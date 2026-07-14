import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelPackagesService } from './hotel-packages.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelPackagesService(db);

// A code not in prd/hotels/15-seed-data.md's listing set (JED-WFH/UMR-9D-ECO/...),
// so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ-PKG';

async function cleanup() {
  const [existing] = await db
    .select({ listingId: schema.travelPackage.listingId })
    .from(schema.travelPackage)
    .where(eq(schema.travelPackage.packageCode, TEST_CODE));
  await db
    .delete(schema.travelPackage)
    .where(eq(schema.travelPackage.packageCode, TEST_CODE));
  if (existing) {
    await db
      .delete(schema.listing)
      .where(eq(schema.listing.id, existing.listingId));
  }
}

describe('HotelPackagesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a package (listing + package in one transaction)', async () => {
    const created = await service.create({
      packageCode: TEST_CODE,
      displayName: 'Test Package',
      destination: 'Test City',
      countryCode: 'ZZ',
      durationNights: 5,
    });
    expect(created.packageCode).toBe(TEST_CODE);
    expect(created.isActive).toBe(true);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.durationNights).toBe(5);

    const updated = await service.update(TEST_CODE, {
      displayName: 'Renamed Package',
      durationNights: 7,
    });
    expect(updated.displayName).toBe('Renamed Package');
    expect(updated.durationNights).toBe(7);

    await service.remove(TEST_CODE);
    await expect(service.findByCode(TEST_CODE)).rejects.toThrow(
      NotFoundException,
    );

    const [listingRow] = await db
      .select({ id: schema.listing.id })
      .from(schema.listing)
      .where(eq(schema.listing.id, created.listingId));
    expect(listingRow).toBeUndefined();
  });

  it('rejects creating a duplicate package code', async () => {
    await service.create({
      packageCode: TEST_CODE,
      displayName: 'Test Package',
      destination: 'Test City',
      countryCode: 'ZZ',
      durationNights: 5,
    });

    await expect(
      service.create({
        packageCode: TEST_CODE,
        displayName: 'Duplicate Package',
        destination: 'Test City',
        countryCode: 'ZZ',
        durationNights: 3,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
