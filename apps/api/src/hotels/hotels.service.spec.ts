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
  sort: 'price_asc',
  limit: 20,
  offset: 0,
};

/**
 * Golden scenarios from prd/hotels/14-scenarios.md, run against the real
 * seeded Postgres (prd/hotels/15-seed-data.md: JED-WFH property/SAR,
 * MAD-CIN property/SAR). The package-only scenarios (formerly S3, S8, S11,
 * S12) were removed along with the hotel-domain `package` concept — see
 * prd/hotels/CONTEXT.md.
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

  it('S4 — seasonal boundary: standard vs peak yields a different perNight/price', async () => {
    const standard = await hotels.search({
      ...baseQuery,
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'SAR',
    });
    const peak = await hotels.search({
      ...baseQuery,
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
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 2,
      currency: 'SAR',
    });
    const fourGuests = await hotels.search({
      ...baseQuery,
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

  it('S9 — Standard fallback: dates outside every dated season still price at the season-less Standard rate', async () => {
    // 2027-02 is outside every seeded Madinah dated season. Under the
    // "Standard = no season" model, the season-less base rate applies, so the
    // Madinah properties are priced (previously this was NO_SEASON → omitted).
    const res = await hotels.search({
      ...baseQuery,
      destination: 'Madinah',
      checkIn: '2027-02-01',
      checkOut: '2027-02-03',
      occupancy: 2,
      currency: 'SAR',
    });
    expect(res.items.length).toBeGreaterThan(0);
    for (const item of res.items) {
      expect(item.price.amount).toBeGreaterThan(0);
    }
  });

  it('S10 — NO_BAND: occupancy above every band is silently omitted', async () => {
    const res = await hotels.search({
      ...baseQuery,
      destination: 'Madinah',
      checkIn: '2026-02-01',
      checkOut: '2026-02-02',
      occupancy: 5,
      currency: 'SAR',
    });
    expect(res.items).toHaveLength(0);
  });
});
