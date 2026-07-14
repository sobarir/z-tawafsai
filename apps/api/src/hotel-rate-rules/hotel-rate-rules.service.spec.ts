import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, createId, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelRateRulesService } from './hotel-rate-rules.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelRateRulesService(db);

// Own isolated listing + season fixtures — never touches the seeded L1/L2/L3
// data hotels.service.spec.ts's golden scenarios depend on. USD is seeded
// reference data (prd/hotels/15-seed-data.md), safe to reuse as an FK.
const CURRENCY = 'USD';

let fixtureListingId: string;
let fixtureSeasonId: string;

async function cleanupRateRules() {
  await db
    .delete(schema.rateRule)
    .where(eq(schema.rateRule.listingId, fixtureListingId));
}

describe('HotelRateRulesService', () => {
  beforeAll(async () => {
    fixtureListingId = createId();
    await db.insert(schema.listing).values({
      id: fixtureListingId,
      kind: 'package',
      displayName: 'Rate Rule Fixture Listing',
      destination: 'Test City',
      countryCode: 'ZZ',
    });

    fixtureSeasonId = createId();
    await db.insert(schema.season).values({
      id: fixtureSeasonId,
      listingId: fixtureListingId,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-06-01',
    });
  });

  afterAll(async () => {
    await cleanupRateRules();
    await db.delete(schema.season).where(eq(schema.season.id, fixtureSeasonId));
    await db
      .delete(schema.listing)
      .where(eq(schema.listing.id, fixtureListingId));
  });

  beforeEach(cleanupRateRules);

  it('creates, reads, updates, and deletes a rate rule', async () => {
    const created = await service.create({
      listingId: fixtureListingId,
      seasonId: fixtureSeasonId,
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 100_00,
      currency: CURRENCY,
    });
    expect(created.amount).toBe(100_00);
    expect(created.roomTypeId).toBeNull();

    const fetched = await service.findById(created.id);
    expect(fetched.currency).toBe(CURRENCY);

    const updated = await service.update(created.id, { amount: 120_00 });
    expect(updated.amount).toBe(120_00);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a duplicate band for the same listing/season/room type', async () => {
    await service.create({
      listingId: fixtureListingId,
      seasonId: fixtureSeasonId,
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 100_00,
      currency: CURRENCY,
    });

    await expect(
      service.create({
        listingId: fixtureListingId,
        seasonId: fixtureSeasonId,
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: 150_00,
        currency: CURRENCY,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
