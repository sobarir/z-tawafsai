import { createDb } from '@repo/db';
import type { HotelSearchQuery } from '@repo/shared';
import { describe, expect, it } from 'vitest';
import { HotelsService } from './hotels.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const hotels = new HotelsService(db);

const baseQuery: HotelSearchQuery = {
  destination: 'Jeddah',
  checkIn: '2026-02-01',
  checkOut: '2026-02-02',
  occupancy: 2,
  currency: 'SAR',
  kind: 'both',
  sort: 'price_asc',
  limit: 20,
  offset: 0,
};

/**
 * Golden scenarios from prd/hotels/14-scenarios.md, run against the real
 * seeded Postgres (prd/hotels/15-seed-data.md: L1 JED-WFH property/SAR, L2
 * UMR-9D-ECO package/USD, L3 MAD-CIN property/SAR).
 *
 * S7's FX-inverse case is exercised with SAR->USD (inverse of the seeded
 * USD->SAR rate) rather than the PRD's illustrative IDR->SAR wording — the
 * seed only stores SAR->IDR, USD->IDR, and USD->SAR directly, so SAR->USD is
 * the pair that actually forces the inverse code path with this fixture set.
 */
describe('HotelsService.search — golden scenarios', () => {
  it('S1 — property, standard season, 2 guests, native currency: perNight x nights, no FX', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-03', // 2 nights
      occupancy: 2,
      currency: 'SAR',
    });
    const item = res.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    expect(item?.price).toEqual({ amount: 80_000, currency: 'SAR' });
    expect(item?.nativePrice).toEqual({ amount: 80_000, currency: 'SAR' });
    expect(item?.breakdown).toEqual({
      perNight: { amount: 40_000, currency: 'SAR' },
      nights: 2,
      total: { amount: 80_000, currency: 'SAR' },
    });
  });

  it('S2 — stay spans 3 nights: price = perNight x 3', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-04', // 3 nights
      occupancy: 2,
      currency: 'SAR',
    });
    const item = res.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    expect(item?.price).toEqual({ amount: 120_000, currency: 'SAR' });
    expect(item?.breakdown).toMatchObject({ nights: 3 });
  });

  it('S3 — package, standard season, 2 pax: price = season TOTAL, nights NOT multiplied', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'package',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12', // 2 nights — irrelevant to a package's price
      occupancy: 2,
      currency: 'USD',
    });
    const item = res.items.find((i) => i.displayName === '9-Day Umrah Economy');
    expect(item?.price).toEqual({ amount: 180_000, currency: 'USD' });
    expect(item?.breakdown).toEqual({
      total: { amount: 180_000, currency: 'USD' },
    });
  });

  it('S4 — seasonal boundary: standard vs peak yields a different perNight/price', async () => {
    const standard = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'SAR',
    });
    const peak = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-05-01',
      checkOut: '2026-05-02',
      occupancy: 2,
      currency: 'SAR',
    });
    const standardItem = standard.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    const peakItem = peak.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    expect(standardItem?.price).toEqual({ amount: 40_000, currency: 'SAR' });
    expect(peakItem?.price).toEqual({ amount: 60_000, currency: 'SAR' });
  });

  it('S5 — occupancy band: 2 vs 4 guests selects a different band and price', async () => {
    const twoGuests = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'SAR',
    });
    const fourGuests = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 4,
      currency: 'SAR',
    });
    const twoItem = twoGuests.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    const fourItem = fourGuests.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    expect(twoItem?.price).toEqual({ amount: 40_000, currency: 'SAR' }); // Double band
    expect(fourItem?.price).toEqual({ amount: 70_000, currency: 'SAR' }); // Quad band
  });

  it('S6 — multi-currency: SAR-native property displayed in IDR, converted + rounded to 0dp', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'IDR',
    });
    const item = res.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    expect(item?.nativePrice).toEqual({ amount: 40_000, currency: 'SAR' });
    // SAR 400.00 x 4350 = IDR 1,740,000 (0dp).
    expect(item?.price).toEqual({ amount: 1_740_000, currency: 'IDR' });
  });

  it('S7 — FX inverse: no direct SAR->USD rate stored, only USD->SAR', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'USD',
    });
    const item = res.items.find(
      (i) => i.displayName === 'Jeddah Waterfront Hotel',
    );
    // SAR 400.00 / 3.75 = USD 106.666... -> rounds to 106.67 (10667 minor).
    expect(item?.price).toEqual({ amount: 10_667, currency: 'USD' });
  });

  it('S8 — unified search returns both a property and a package in one call', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'both',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12',
      occupancy: 2,
      currency: 'USD',
    });
    expect(res.items).toHaveLength(2);
    const property = res.items.find((i) => i.kind === 'property');
    const pkg = res.items.find((i) => i.kind === 'package');
    // SAR 800.00 (2 nights x 400) / 3.75 = USD 213.333... -> 21333 minor.
    expect(property?.price).toEqual({ amount: 21_333, currency: 'USD' });
    expect(pkg?.price).toEqual({ amount: 180_000, currency: 'USD' });
  });

  it('S9 — NO_SEASON: dates outside every season window are silently omitted, still 200', async () => {
    const res = await hotels.search({
      ...baseQuery,
      destination: 'Madinah',
      kind: 'property',
      checkIn: '2026-06-01',
      checkOut: '2026-06-03',
      occupancy: 2,
      currency: 'SAR',
    });
    expect(res.items).toHaveLength(0);
  });

  it('S10 — NO_BAND: occupancy above every band is silently omitted', async () => {
    const res = await hotels.search({
      ...baseQuery,
      destination: 'Madinah',
      kind: 'property',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 5,
      currency: 'SAR',
    });
    expect(res.items).toHaveLength(0);
  });

  it('S11 — sort price_asc orders mixed property+package rows by converted price', async () => {
    const res = await hotels.search({
      ...baseQuery,
      kind: 'both',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12',
      occupancy: 2,
      currency: 'USD',
      sort: 'price_asc',
    });
    expect(res.total).toBe(2);
    expect(res.items[0].price.amount).toBeLessThan(res.items[1].price.amount);
    expect(res.items[0].kind).toBe('property');
    expect(res.items[1].kind).toBe('package');
  });

  it('S12 — minPrice/maxPrice filter on CONVERTED price, boundary inclusive', async () => {
    const atUpperBound = await hotels.search({
      ...baseQuery,
      kind: 'both',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12',
      occupancy: 2,
      currency: 'USD',
      maxPrice: 21_333,
    });
    expect(atUpperBound.items).toHaveLength(1);
    expect(atUpperBound.items[0].kind).toBe('property');

    const aboveLowerBound = await hotels.search({
      ...baseQuery,
      kind: 'both',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12',
      occupancy: 2,
      currency: 'USD',
      minPrice: 21_334,
    });
    expect(aboveLowerBound.items).toHaveLength(1);
    expect(aboveLowerBound.items[0].kind).toBe('package');
  });
});
