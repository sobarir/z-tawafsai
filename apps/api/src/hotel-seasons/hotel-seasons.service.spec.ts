import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelSeasonsService } from './hotel-seasons.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelSeasonsService(db);

// Seasons are global reference data. The seed only inserts the season labels
// that some property window uses (peak/ramadan/hajj/promo); 'standard' is never
// seeded (Standard = the absence of a season), so it is the one label this
// spec can freely create and drop without colliding with the seeded catalog.
const TEST_NAME = 'standard' as const;

async function cleanupSeasons() {
  await db.delete(schema.season).where(eq(schema.season.name, TEST_NAME));
}

describe('HotelSeasonsService', () => {
  afterAll(cleanupSeasons);
  beforeEach(cleanupSeasons);

  it('creates, reads, and deletes a season', async () => {
    const created = await service.create({ name: TEST_NAME });
    expect(created.name).toBe(TEST_NAME);

    const fetched = await service.findById(created.id);
    expect(fetched.id).toBe(created.id);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a duplicate season label (global catalog)', async () => {
    await service.create({ name: TEST_NAME });

    await expect(service.create({ name: TEST_NAME })).rejects.toThrow(
      ConflictException,
    );
  });
});
