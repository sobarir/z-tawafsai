import { NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { MctRulesService, pickMostSpecificMctRule } from './mct-rules.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new MctRulesService(db);

type MctRuleRow = typeof schema.mctRules.$inferSelect;

const BASE_ROW: MctRuleRow = {
  id: 'test',
  arrivalAirport: 'NRT',
  departureAirport: 'NRT',
  scope: 'II',
  arrivalAirline: null,
  departureAirline: null,
  arrivalTerminal: null,
  departureTerminal: null,
  mctMinutes: 60,
  maxConnectionMinutes: 1440,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const rule = (overrides: Partial<MctRuleRow>): MctRuleRow => ({
  ...BASE_ROW,
  ...overrides,
});

describe('pickMostSpecificMctRule', () => {
  it('returns the only default rule when no candidates have criteria', () => {
    const rules = [rule({ id: 'default', mctMinutes: 60 })];
    const picked = pickMostSpecificMctRule(rules, {});
    expect(picked?.id).toBe('default');
  });

  it('returns null when nothing matches', () => {
    expect(pickMostSpecificMctRule([], {})).toBeNull();
  });

  it('S11: an airline-specific rule beats the default when it matches', () => {
    const rules = [
      rule({ id: 'default', mctMinutes: 60 }),
      rule({ id: 'nh-specific', arrivalAirline: 'NH', mctMinutes: 45 }),
    ];
    const picked = pickMostSpecificMctRule(rules, { arrivalAirline: 'NH' });
    expect(picked?.id).toBe('nh-specific');
    expect(picked?.mctMinutes).toBe(45);
  });

  it('falls back to the default when the specific rule does not match the candidate', () => {
    const rules = [
      rule({ id: 'default', mctMinutes: 60 }),
      rule({ id: 'nh-specific', arrivalAirline: 'NH', mctMinutes: 45 }),
    ];
    const picked = pickMostSpecificMctRule(rules, { arrivalAirline: 'QR' });
    expect(picked?.id).toBe('default');
  });

  it('ranks a rule with both airline fields set above a one-sided rule', () => {
    const rules = [
      rule({ id: 'one-sided', arrivalAirline: 'NH', mctMinutes: 45 }),
      rule({
        id: 'both-sides',
        arrivalAirline: 'NH',
        departureAirline: 'NH',
        mctMinutes: 30,
      }),
    ];
    const picked = pickMostSpecificMctRule(rules, {
      arrivalAirline: 'NH',
      departureAirline: 'NH',
    });
    expect(picked?.id).toBe('both-sides');
  });

  it('ranks a fully-specific rule (all 4 fields) above a partial one', () => {
    const rules = [
      rule({
        id: 'airlines-only',
        arrivalAirline: 'NH',
        departureAirline: 'NH',
        mctMinutes: 30,
      }),
      rule({
        id: 'fully-specific',
        arrivalAirline: 'NH',
        departureAirline: 'NH',
        arrivalTerminal: '1',
        departureTerminal: '2',
        mctMinutes: 20,
      }),
    ];
    const picked = pickMostSpecificMctRule(rules, {
      arrivalAirline: 'NH',
      departureAirline: 'NH',
      arrivalTerminal: '1',
      departureTerminal: '2',
    });
    expect(picked?.id).toBe('fully-specific');
  });

  it('breaks ties between equally-specific rules by newest updatedAt', () => {
    const rules = [
      rule({
        id: 'older',
        arrivalAirline: 'NH',
        mctMinutes: 50,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      }),
      rule({
        id: 'newer',
        arrivalAirline: 'NH',
        mctMinutes: 45,
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      }),
    ];
    const picked = pickMostSpecificMctRule(rules, { arrivalAirline: 'NH' });
    expect(picked?.id).toBe('newer');
  });
});

// A tuple not in prd/15-seed-data.md's MCT rule set, so tests never collide with seeded rows.
const TEST_ARRIVAL = 'DPS';
const TEST_DEPARTURE = 'DPS';
const TEST_SCOPE = 'DD' as const;

async function cleanup() {
  await db
    .delete(schema.mctRules)
    .where(
      and(
        eq(schema.mctRules.arrivalAirport, TEST_ARRIVAL),
        eq(schema.mctRules.departureAirport, TEST_DEPARTURE),
        eq(schema.mctRules.scope, TEST_SCOPE),
      ),
    );
}

describe('MctRulesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes an MCT rule', async () => {
    const created = await service.create({
      arrivalAirport: TEST_ARRIVAL,
      departureAirport: TEST_DEPARTURE,
      scope: TEST_SCOPE,
      mctMinutes: 45,
    });
    expect(created.mctMinutes).toBe(45);
    expect(created.maxConnectionMinutes).toBe(1440);

    const updated = await service.update(created.id, { mctMinutes: 50 });
    expect(updated.mctMinutes).toBe(50);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('S11: resolves the NH-specific NRT/NRT II rule over the default', async () => {
    const resolved = await service.resolve({
      arrivalAirport: 'NRT',
      departureAirport: 'NRT',
      scope: 'II',
      arrivalAirline: 'NH',
    });
    expect(resolved.mctMinutes).toBe(45);
    expect(resolved.arrivalAirline).toBe('NH');
  });

  it('resolves the NRT/NRT II default for a non-NH arrival carrier', async () => {
    const resolved = await service.resolve({
      arrivalAirport: 'NRT',
      departureAirport: 'NRT',
      scope: 'II',
      arrivalAirline: 'QR',
    });
    expect(resolved.mctMinutes).toBe(60);
    expect(resolved.arrivalAirline).toBeNull();
  });

  it('NO_MCT_RULE: throws NotFoundException for an airport pair with no rule', async () => {
    await expect(
      service.resolve({
        arrivalAirport: TEST_ARRIVAL,
        departureAirport: TEST_DEPARTURE,
        scope: TEST_SCOPE,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
