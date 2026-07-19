import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelRoomTypesService } from './hotel-room-types.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelRoomTypesService(db);

// Room types are global reference data. Use a name the seed never inserts so
// this fixture never collides with the seeded catalog (Double/Triple/Quad…).
const TEST_NAME = 'ZZZ Fixture Room';

async function cleanupRoomTypes() {
  await db.delete(schema.roomType).where(eq(schema.roomType.name, TEST_NAME));
}

describe('HotelRoomTypesService', () => {
  afterAll(cleanupRoomTypes);
  beforeEach(cleanupRoomTypes);

  it('creates, reads, updates, and deletes a room type', async () => {
    const created = await service.create({ name: TEST_NAME, maxOccupancy: 2 });
    expect(created.name).toBe(TEST_NAME);

    const fetched = await service.findById(created.id);
    expect(fetched.maxOccupancy).toBe(2);

    const updated = await service.update(created.id, { maxOccupancy: 3 });
    expect(updated.maxOccupancy).toBe(3);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a duplicate room type name (global catalog)', async () => {
    await service.create({ name: TEST_NAME, maxOccupancy: 2 });

    await expect(
      service.create({ name: TEST_NAME, maxOccupancy: 4 }),
    ).rejects.toThrow(ConflictException);
  });
});
