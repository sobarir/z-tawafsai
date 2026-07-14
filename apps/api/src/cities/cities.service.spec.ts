import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { inArray } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { CitiesService } from './cities.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new CitiesService(db);

// Codes not used by the seed data, so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ';
const TEST_CODE_2 = 'ZZY';

async function cleanup() {
  await db
    .delete(schema.city)
    .where(inArray(schema.city.cityCode, [TEST_CODE, TEST_CODE_2]));
}

describe('CitiesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a city', async () => {
    const created = await service.create({
      cityCode: TEST_CODE,
      name: 'Test City',
      countryCode: 'ZZ',
    });
    expect(created.cityCode).toBe(TEST_CODE);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.name).toBe('Test City');

    const updated = await service.update(TEST_CODE, {
      name: 'Renamed City',
    });
    expect(updated.name).toBe('Renamed City');

    await service.remove(TEST_CODE);
    await expect(service.findByCode(TEST_CODE)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects creating a duplicate city code', async () => {
    await service.create({
      cityCode: TEST_CODE,
      name: 'Test City',
      countryCode: 'ZZ',
    });

    await expect(
      service.create({
        cityCode: TEST_CODE,
        name: 'Duplicate City',
        countryCode: 'ZZ',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects creating or renaming a city to a name already in use', async () => {
    await service.create({
      cityCode: TEST_CODE,
      name: 'Test City',
      countryCode: 'ZZ',
    });

    await expect(
      service.create({
        cityCode: TEST_CODE_2,
        name: 'Test City',
        countryCode: 'ZZ',
      }),
    ).rejects.toThrow(ConflictException);

    const other = await service.create({
      cityCode: TEST_CODE_2,
      name: 'Other City',
      countryCode: 'ZZ',
    });
    await expect(
      service.update(other.cityCode, { name: 'Test City' }),
    ).rejects.toThrow(ConflictException);

    // Renaming a city to its own current name must not self-collide.
    const unchanged = await service.update(TEST_CODE, { name: 'Test City' });
    expect(unchanged.name).toBe('Test City');
  });
});
