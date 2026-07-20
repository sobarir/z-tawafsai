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

async function cleanup() {
  await db
    .delete(schema.property)
    .where(eq(schema.property.displayName, 'Test Property'))
    .execute();
  await db
    .delete(schema.property)
    .where(eq(schema.property.displayName, 'Renamed Property'))
    .execute();
}

describe('HotelPropertiesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a property', async () => {
    const created = await service.create({
      type: 'hotel',
      displayName: 'Test Property',
      destination: 'Test City',
      countryCode: 'ZZ',
    });
    expect(created.propertyCode).toBeDefined();
    expect(created.isActive).toBe(true);

    const generatedCode = created.propertyCode;

    const fetched = await service.findByCode(generatedCode);
    expect(fetched.displayName).toBe('Test Property');

    const updated = await service.update(generatedCode, {
      displayName: 'Renamed Property',
      starRating: 4,
    });
    expect(updated.displayName).toBe('Renamed Property');
    expect(updated.starRating).toBe(4);

    await service.remove(generatedCode);
    await expect(service.findByCode(generatedCode)).rejects.toThrow(
      NotFoundException,
    );
  });
});
