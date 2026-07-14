import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelPropertiesService } from './hotel-properties.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelPropertiesService(db);

// A code not in prd/hotels/15-seed-data.md's listing set (JED-WFH/UMR-9D-ECO/...),
// so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ-PROP';

async function cleanup() {
  const [existing] = await db
    .select({ listingId: schema.property.listingId })
    .from(schema.property)
    .where(eq(schema.property.propertyCode, TEST_CODE));
  await db
    .delete(schema.property)
    .where(eq(schema.property.propertyCode, TEST_CODE));
  if (existing) {
    await db
      .delete(schema.listing)
      .where(eq(schema.listing.id, existing.listingId));
  }
}

describe('HotelPropertiesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a property (listing + property in one transaction)', async () => {
    const created = await service.create({
      propertyCode: TEST_CODE,
      displayName: 'Test Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
    expect(created.propertyCode).toBe(TEST_CODE);
    expect(created.isActive).toBe(true);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.displayName).toBe('Test Property');

    const updated = await service.update(TEST_CODE, {
      displayName: 'Renamed Property',
      starRating: 4,
    });
    expect(updated.displayName).toBe('Renamed Property');
    expect(updated.starRating).toBe(4);

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

  it('rejects creating a duplicate property code', async () => {
    await service.create({
      propertyCode: TEST_CODE,
      displayName: 'Test Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });

    await expect(
      service.create({
        propertyCode: TEST_CODE,
        displayName: 'Duplicate Property',
        destination: 'Test City',
        countryCode: 'ZZ',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
