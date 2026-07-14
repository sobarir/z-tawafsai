import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { AirportsService } from './airports.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new AirportsService(db);

// A code not used by prd/flights/15-seed-data.md, so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ';

async function cleanup() {
  await db
    .delete(schema.airports)
    .where(eq(schema.airports.airportCode, TEST_CODE));
}

describe('AirportsService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes an airport', async () => {
    const created = await service.create({
      airportCode: TEST_CODE,
      name: 'Test Airport',
      cityCode: 'JED',
      countryCode: 'ZZ',
      timezone: 'UTC',
    });
    expect(created.airportCode).toBe(TEST_CODE);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.name).toBe('Test Airport');

    const updated = await service.update(TEST_CODE, {
      name: 'Renamed Airport',
    });
    expect(updated.name).toBe('Renamed Airport');

    await service.remove(TEST_CODE);
    await expect(service.findByCode(TEST_CODE)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects creating a duplicate airport code', async () => {
    await service.create({
      airportCode: TEST_CODE,
      name: 'Test Airport',
      cityCode: 'JED',
      countryCode: 'ZZ',
      timezone: 'UTC',
    });

    await expect(
      service.create({
        airportCode: TEST_CODE,
        name: 'Duplicate Airport',
        cityCode: 'JED',
        countryCode: 'ZZ',
        timezone: 'UTC',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('groups multi-airport metros by city_code (idx_airports_city_code)', async () => {
    // NRT and HND are seeded with cityCode 'TYO' — the index this test exercises
    // is what open-jaw detection and inter-airport MCT resolution key off.
    const tokyoAirports = await db
      .select({ airportCode: schema.airports.airportCode })
      .from(schema.airports)
      .where(eq(schema.airports.cityCode, 'TYO'));

    const codes = tokyoAirports.map((a) => a.airportCode).sort();
    expect(codes).toEqual(['HND', 'NRT']);
  });
});
