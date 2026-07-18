import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelSeasonsService } from './hotel-seasons.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelSeasonsService(db);

// Own isolated property fixture — never touches the seeded JED-WFH/MAD-CIN
// properties that hotels.service.spec.ts's golden scenarios (and their
// season windows) depend on.
const FIXTURE_CODE = 'ZZZ-SEASON';

async function cleanupSeasons() {
  await db
    .delete(schema.season)
    .where(eq(schema.season.propertyCode, FIXTURE_CODE));
}

describe('HotelSeasonsService', () => {
  beforeAll(async () => {
    await db.insert(schema.property).values({
      propertyCode: FIXTURE_CODE,
      type: 'hotel',
      displayName: 'Season Fixture Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
  });

  afterAll(async () => {
    await cleanupSeasons();
    await db
      .delete(schema.property)
      .where(eq(schema.property.propertyCode, FIXTURE_CODE));
  });

  beforeEach(cleanupSeasons);

  it('creates, reads, updates, and deletes a season', async () => {
    const created = await service.create({
      propertyCode: FIXTURE_CODE,
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

  it('rejects an overlapping date range for the same property (EXCLUDE constraint)', async () => {
    await service.create({
      propertyCode: FIXTURE_CODE,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    await expect(
      service.create({
        propertyCode: FIXTURE_CODE,
        name: 'peak',
        startDate: '2027-02-01',
        endDate: '2027-04-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('allows adjacent, non-overlapping date ranges for the same property', async () => {
    await service.create({
      propertyCode: FIXTURE_CODE,
      name: 'standard',
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    const second = await service.create({
      propertyCode: FIXTURE_CODE,
      name: 'peak',
      startDate: '2027-03-01',
      endDate: '2027-04-01',
    });
    expect(second.name).toBe('peak');
  });
});
