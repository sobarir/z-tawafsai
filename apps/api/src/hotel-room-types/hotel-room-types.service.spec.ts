import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, createId, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelRoomTypesService } from './hotel-room-types.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelRoomTypesService(db);

// Own isolated property fixture — never touches the seeded JED-WFH property
// that hotels.service.spec.ts's golden scenarios depend on.
const FIXTURE_PROPERTY_CODE = 'ZZZ-RT-FIXTURE';
const TEST_NAME = 'Test Room';

let fixtureListingId: string;

async function cleanupRoomTypes() {
  await db
    .delete(schema.roomType)
    .where(eq(schema.roomType.propertyCode, FIXTURE_PROPERTY_CODE));
}

describe('HotelRoomTypesService', () => {
  beforeAll(async () => {
    fixtureListingId = createId();
    await db.insert(schema.listing).values({
      id: fixtureListingId,
      kind: 'property',
      displayName: 'Room Type Fixture Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
    await db.insert(schema.property).values({
      propertyCode: FIXTURE_PROPERTY_CODE,
      listingId: fixtureListingId,
    });
  });

  afterAll(async () => {
    await cleanupRoomTypes();
    await db
      .delete(schema.property)
      .where(eq(schema.property.propertyCode, FIXTURE_PROPERTY_CODE));
    await db
      .delete(schema.listing)
      .where(eq(schema.listing.id, fixtureListingId));
  });

  beforeEach(cleanupRoomTypes);

  it('creates, reads, updates, and deletes a room type', async () => {
    const created = await service.create({
      propertyCode: FIXTURE_PROPERTY_CODE,
      name: TEST_NAME,
      maxOccupancy: 2,
    });
    expect(created.propertyCode).toBe(FIXTURE_PROPERTY_CODE);

    const fetched = await service.findById(created.id);
    expect(fetched.maxOccupancy).toBe(2);

    const updated = await service.update(created.id, { maxOccupancy: 3 });
    expect(updated.maxOccupancy).toBe(3);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a duplicate room type name for the same property', async () => {
    await service.create({
      propertyCode: FIXTURE_PROPERTY_CODE,
      name: TEST_NAME,
      maxOccupancy: 2,
    });

    await expect(
      service.create({
        propertyCode: FIXTURE_PROPERTY_CODE,
        name: TEST_NAME,
        maxOccupancy: 4,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
