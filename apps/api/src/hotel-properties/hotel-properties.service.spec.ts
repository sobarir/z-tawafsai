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

// A code not in prd/hotels/15-seed-data.md's property set (JED-WFH/MAD-CIN),
// so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ-PROP';

async function cleanup() {
  await db
    .delete(schema.property)
    .where(eq(schema.property.propertyCode, TEST_CODE));
}

describe('HotelPropertiesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a property', async () => {
    const created = await service.create({
      propertyCode: TEST_CODE,
      type: 'hotel',
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
  });

  it('rejects creating a duplicate property code', async () => {
    await service.create({
      propertyCode: TEST_CODE,
      type: 'hotel',
      displayName: 'Test Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });

    await expect(
      service.create({
        propertyCode: TEST_CODE,
        type: 'hotel',
        displayName: 'Duplicate Property',
        destination: 'Test City',
        countryCode: 'ZZ',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
