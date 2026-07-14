import { ConflictException, NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { HotelFxRatesService } from './hotel-fx-rates.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new HotelFxRatesService(db);

// SAR->USD: seeded fx_rate rows only cover SAR->IDR, USD->IDR, USD->SAR
// (prd/hotels/15-seed-data.md) — this reverse pair is free for tests to own.
// USD/SAR themselves are seeded reference currencies, safe to reuse (like
// airports/airlines in mct-rules/interline-agreements specs).
const BASE = 'SAR';
const QUOTE = 'USD';

async function cleanup() {
  await db
    .delete(schema.fxRate)
    .where(
      and(
        eq(schema.fxRate.baseCurrency, BASE),
        eq(schema.fxRate.quoteCurrency, QUOTE),
      ),
    );
}

describe('HotelFxRatesService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes an fx rate', async () => {
    const created = await service.create({
      baseCurrency: BASE,
      quoteCurrency: QUOTE,
      ratePpm: 266_667,
      asOf: '2026-01-01T00:00:00.000Z',
    });
    expect(created.baseCurrency).toBe(BASE);
    expect(created.ratePpm).toBe(266_667);

    const fetched = await service.findById(created.id);
    expect(fetched.quoteCurrency).toBe(QUOTE);

    const updated = await service.update(created.id, { ratePpm: 270_000 });
    expect(updated.ratePpm).toBe(270_000);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects creating a duplicate base/quote pair', async () => {
    await service.create({
      baseCurrency: BASE,
      quoteCurrency: QUOTE,
      ratePpm: 266_667,
      asOf: '2026-01-01T00:00:00.000Z',
    });

    await expect(
      service.create({
        baseCurrency: BASE,
        quoteCurrency: QUOTE,
        ratePpm: 270_000,
        asOf: '2026-01-02T00:00:00.000Z',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
