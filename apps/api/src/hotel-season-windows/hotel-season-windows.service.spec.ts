import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelSeasonWindowsService } from './hotel-season-windows.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelSeasonWindowsService(db);

// Own isolated property fixture — never touches the seeded JED-WFH/MAD-CIN
// properties that hotels.service.spec.ts's golden scenarios depend on. Windows
// reference a global season (read-only); we resolve one from the seeded catalog.
const FIXTURE_CODE = 'ZZZ-SEASON-WINDOW';
let seasonId: string;

async function cleanupWindows() {
  await db
    .delete(schema.seasonWindow)
    .where(eq(schema.seasonWindow.propertyCode, FIXTURE_CODE));
}

describe('HotelSeasonWindowsService', () => {
  beforeAll(async () => {
    await db.insert(schema.property).values({
      propertyCode: FIXTURE_CODE,
      type: 'hotel',
      displayName: 'Season Window Fixture Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
    const [season] = await db.select().from(schema.season).limit(1);
    if (!season) {
      throw new Error('No seeded season to reference — run the seed first');
    }
    seasonId = season.id;
  });

  afterAll(async () => {
    await cleanupWindows();
    await db
      .delete(schema.property)
      .where(eq(schema.property.propertyCode, FIXTURE_CODE));
  });

  beforeEach(cleanupWindows);

  it('creates, reads, updates, and deletes a season window', async () => {
    const created = await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId,
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });
    expect(created.propertyCode).toBe(FIXTURE_CODE);

    const fetched = await service.findById(created.id);
    expect(fetched.startDate).toBe('2027-01-01');

    const updated = await service.update(created.id, { endDate: '2027-04-01' });
    expect(updated.endDate).toBe('2027-04-01');

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects an overlapping date range for the same property (EXCLUDE constraint)', async () => {
    await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId,
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    await expect(
      service.create({
        propertyCode: FIXTURE_CODE,
        seasonId,
        startDate: '2027-02-01',
        endDate: '2027-04-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('allows adjacent, non-overlapping date ranges for the same property', async () => {
    await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId,
      startDate: '2027-01-01',
      endDate: '2027-03-01',
    });

    const second = await service.create({
      propertyCode: FIXTURE_CODE,
      seasonId,
      startDate: '2027-03-01',
      endDate: '2027-04-01',
    });
    expect(second.startDate).toBe('2027-03-01');
  });
});
