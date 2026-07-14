import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, createId, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelSeasonsService } from './hotel-seasons.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelSeasonsService(db);

// Own isolated listing fixture — never touches the seeded L1/L2/L3 listings
// that hotels.service.spec.ts's golden scenarios (and their season windows)
// depend on.
let fixtureListingId: string;

async function cleanupSeasons() {
  await db
    .delete(schema.season)
    .where(eq(schema.season.listingId, fixtureListingId));
}

describe('HotelSeasonsService', () => {
  beforeAll(async () => {
    fixtureListingId = createId();
    await db.insert(schema.listing).values({
      id: fixtureListingId,
      kind: 'property',
      displayName: 'Season Fixture Listing',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
  });

  afterAll(async () => {
    await cleanupSeasons();
    await db
      .delete(schema.listing)
      .where(eq(schema.listing.id, fixtureListingId));
  });

  beforeEach(cleanupSeasons);

  it('creates, reads, updates, and deletes a season', async () => {
    const created = await service.create({
      listingId: fixtureListingId,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });
    expect(created.name).toBe('standard');

    const fetched = await service.findById(created.id);
    expect(fetched.startDate).toBe('2027-01-01');

    const updated = await service.update(created.id, { name: 'promo' });
    expect(updated.name).toBe('promo');

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects an overlapping date range for the same listing (EXCLUDE constraint)', async () => {
    await service.create({
      listingId: fixtureListingId,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    await expect(
      service.create({
        listingId: fixtureListingId,
        name: 'peak',
        startDate: '2027-02-01',
        endDate: '2027-04-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('allows adjacent, non-overlapping date ranges for the same listing', async () => {
    await service.create({
      listingId: fixtureListingId,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    const second = await service.create({
      listingId: fixtureListingId,
      name: 'peak',
      startDate: '2027-03-01',
      endDate: '2027-04-01',
    });
    expect(second.name).toBe('peak');
  });
});
