import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { InterlineAgreementsService } from './interline-agreements.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new InterlineAgreementsService(db);

// A pair not in prd/flights/15-seed-data.md's interline table, so tests never collide with seeded rows.
const TEST_INBOUND = 'AF';
const TEST_OUTBOUND = 'QR';

async function cleanup() {
  await db
    .delete(schema.interlineAgreements)
    .where(
      and(
        eq(schema.interlineAgreements.inboundAirline, TEST_INBOUND),
        eq(schema.interlineAgreements.outboundAirline, TEST_OUTBOUND),
      ),
    );
}

describe('InterlineAgreementsService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, and deletes an interline agreement', async () => {
    const created = await service.create({
      inboundAirline: TEST_INBOUND,
      outboundAirline: TEST_OUTBOUND,
      bagThroughChecked: false,
    });
    expect(created.bagThroughChecked).toBe(false);

    const fetched = await service.findById(created.id);
    expect(fetched.inboundAirline).toBe(TEST_INBOUND);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a self-paired agreement (inbound === outbound)', async () => {
    await expect(
      service.create({
        inboundAirline: TEST_INBOUND,
        outboundAirline: TEST_INBOUND,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a duplicate directional pair', async () => {
    await service.create({
      inboundAirline: TEST_INBOUND,
      outboundAirline: TEST_OUTBOUND,
    });

    await expect(
      service.create({
        inboundAirline: TEST_INBOUND,
        outboundAirline: TEST_OUTBOUND,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('S13: same operating carrier resolves online with no lookup', async () => {
    const resolution = await service.resolveInterline('GA', 'GA');
    expect(resolution).toEqual({
      online: true,
      permitted: true,
      bagThroughChecked: true,
      agreementId: null,
    });
  });

  it('S14: GA->SQ resolves permitted with bags through-checked', async () => {
    const resolution = await service.resolveInterline('GA', 'SQ');
    expect(resolution.online).toBe(false);
    expect(resolution.permitted).toBe(true);
    expect(resolution.bagThroughChecked).toBe(true);
    expect(resolution.agreementId).not.toBeNull();
  });

  it('S15: GA->AF has no agreement (NO_INTERLINE)', async () => {
    const resolution = await service.resolveInterline('GA', 'AF');
    expect(resolution).toEqual({
      online: false,
      permitted: false,
      bagThroughChecked: false,
      agreementId: null,
    });
  });

  it('S16: NH->KL is permitted but bags are not through-checked', async () => {
    const resolution = await service.resolveInterline('NH', 'KL');
    expect(resolution.permitted).toBe(true);
    expect(resolution.bagThroughChecked).toBe(false);
  });

  it('S17: the GA->QR agreement does not authorize the reverse QR->GA', async () => {
    const forward = await service.resolveInterline('GA', 'QR');
    expect(forward.permitted).toBe(true);

    const reverse = await service.resolveInterline('QR', 'GA');
    expect(reverse.permitted).toBe(false);
  });
});
