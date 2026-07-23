import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelCurrenciesService } from './hotel-currencies.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelCurrenciesService(db);

// A code outside the seeded currency set (USD/SAR/IDR in packages/db/src/seed.ts),
// so tests never collide with seeded rows.
const TEST_CODE = 'ZZZ';

async function cleanup() {
  await db.delete(schema.currency).where(eq(schema.currency.code, TEST_CODE));
}

describe('HotelCurrenciesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a currency', async () => {
    const created = await service.create({
      code: TEST_CODE,
      minorUnit: 2,
      symbol: 'Z',
      name: 'Test Currency',
    });
    expect(created.code).toBe(TEST_CODE);

    const fetched = await service.findByCode(TEST_CODE);
    expect(fetched.name).toBe('Test Currency');

    const updated = await service.update(TEST_CODE, {
      name: 'Renamed Currency',
    });
    expect(updated.name).toBe('Renamed Currency');

    await service.remove(TEST_CODE);
    await expect(service.findByCode(TEST_CODE)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects creating a duplicate currency code', async () => {
    await service.create({
      code: TEST_CODE,
      minorUnit: 2,
      symbol: 'Z',
      name: 'Test Currency',
    });

    await expect(
      service.create({
        code: TEST_CODE,
        minorUnit: 0,
        symbol: 'Y',
        name: 'Duplicate Currency',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
