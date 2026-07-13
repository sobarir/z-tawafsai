import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { AirlinesService } from './airlines.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new AirlinesService(db);

// A code not used by prd/flights/15-seed-data.md, so tests never collide with seeded rows.
const TEST_CODE = 'ZZ';

async function cleanup() {
  await db
    .delete(schema.airlines)
    .where(eq(schema.airlines.airlineCode, TEST_CODE));
}

describe('AirlinesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes an airline', async () => {
    const created = await service.create({
      airlineCode: TEST_CODE,
      name: 'Test Airline',
      countryCode: 'ZZ',
    });
    expect(created.airlineCode).toBe(TEST_CODE);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.name).toBe('Test Airline');

    const updated = await service.update(TEST_CODE, {
      name: 'Renamed Airline',
    });
    expect(updated.name).toBe('Renamed Airline');

    await service.remove(TEST_CODE);
    await expect(service.findByCode(TEST_CODE)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects creating a duplicate airline code', async () => {
    await service.create({
      airlineCode: TEST_CODE,
      name: 'Test Airline',
      countryCode: 'ZZ',
    });

    await expect(
      service.create({
        airlineCode: TEST_CODE,
        name: 'Duplicate Airline',
        countryCode: 'ZZ',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
