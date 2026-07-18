import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelRateRulesService } from './hotel-rate-rules.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelRateRulesService(db);

// Own isolated property + season + room type fixtures — never touches the
// seeded JED-WFH/MAD-CIN data hotels.service.spec.ts's golden scenarios
// depend on. USD is seeded reference data (prd/hotels/15-seed-data.md),
// safe to reuse as an FK.
const CURRENCY = 'USD';
const FIXTURE_CODE = 'ZZZ-RATERULE';

let fixtureSeasonId: string;
let fixtureRoomTypeId: string;

async function cleanupRateRules() {
  await db
    .delete(schema.rateRule)
    .where(eq(schema.rateRule.propertyCode, FIXTURE_CODE));
}

describe('HotelRateRulesService', () => {
  beforeAll(async () => {
    await db.insert(schema.property).values({
      propertyCode: FIXTURE_CODE,
      type: 'hotel',
      displayName: 'Rate Rule Fixture Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });

    const [season] = await db
      .insert(schema.season)
      .values({
        propertyCode: FIXTURE_CODE,
        name: 'standard',
        startDate: '2027-01-01',
        endDate: '2027-06-01',
      })
      .returning();
    fixtureSeasonId = season.id;

    const [roomType] = await db
      .insert(schema.roomType)
      .values({
        propertyCode: FIXTURE_CODE,
        name: 'Double',
        maxOccupancy: 2,
      })
      .returning();
    fixtureRoomTypeId = roomType.id;
  });

  afterAll(async () => {
    await cleanupRateRules();
    await db.delete(schema.season).where(eq(schema.season.id, fixtureSeasonId));
    await db
      .delete(schema.roomType)
      .where(eq(schema.roomType.id, fixtureRoomTypeId));
    await db
      .delete(schema.property)
      .where(eq(schema.property.propertyCode, FIXTURE_CODE));
  });

  beforeEach(cleanupRateRules);

  it('creates, reads, updates, and deletes a rate rule', async () => {
    const created = await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId: fixtureSeasonId,
      roomTypeId: fixtureRoomTypeId,
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 100_00,
      currency: CURRENCY,
    });
    expect(created.amount).toBe(100_00);
    expect(created.roomTypeId).toBe(fixtureRoomTypeId);

    const fetched = await service.findById(created.id);
    expect(fetched.currency).toBe(CURRENCY);

    const updated = await service.update(created.id, { amount: 120_00 });
    expect(updated.amount).toBe(120_00);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a duplicate band for the same property/season/room type', async () => {
    await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId: fixtureSeasonId,
      roomTypeId: fixtureRoomTypeId,
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 100_00,
      currency: CURRENCY,
    });

    await expect(
      service.create({
        propertyCode: FIXTURE_CODE,
        seasonId: fixtureSeasonId,
        roomTypeId: fixtureRoomTypeId,
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: 150_00,
        currency: CURRENCY,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
