import { describe, expect, it } from 'vitest';
import { type ResolveInput, resolvePrice } from './resolver';

const currencies = [
  { code: 'USD', minorUnit: 2 },
  { code: 'SAR', minorUnit: 2 },
  { code: 'IDR', minorUnit: 0 },
];
const fxRates = [
  { baseCurrency: 'SAR', quoteCurrency: 'IDR', ratePpm: 4_350_000_000 },
];

const propertyBase: ResolveInput = {
  listing: { isActive: true },
  seasons: [
    { id: 's-standard', startDate: '2026-01-01', endDate: '2026-05-01' },
  ],
  rateRules: [
    {
      seasonId: 's-standard',
      roomTypeId: 'rt-double',
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 40_000,
      currency: 'SAR',
    },
  ],
  checkIn: '2026-02-01',
  checkOut: '2026-02-04',
  occupancy: 2,
  displayCurrency: 'SAR',
  roomTypeId: 'rt-double',
  fxRates,
  currencies,
};

describe('resolvePrice', () => {
  it('multiplies per-night amount by nights', () => {
    const result = resolvePrice(propertyBase);
    expect(result.outcome).toBe('OK');
    if (result.outcome !== 'OK') throw new Error('unreachable');
    expect(result.native).toEqual({ amount: 120_000, currency: 'SAR' });
    expect(result.breakdown).toEqual({
      perNight: { amount: 40_000, currency: 'SAR' },
      nights: 3,
      total: { amount: 120_000, currency: 'SAR' },
    });
  });

  it('returns INACTIVE for an inactive listing without checking anything else', () => {
    const result = resolvePrice({
      ...propertyBase,
      listing: { ...propertyBase.listing, isActive: false },
    });
    expect(result.outcome).toBe('INACTIVE');
  });

  const standardBand = {
    seasonId: null,
    roomTypeId: 'rt-double',
    minOccupancy: 1,
    maxOccupancy: 2,
    amount: 30_000,
    currency: 'SAR',
  };

  it('falls back to the Standard (season-less) band when no dated season covers the stay', () => {
    const result = resolvePrice({
      ...propertyBase,
      rateRules: [...propertyBase.rateRules, standardBand],
      checkIn: '2026-06-01',
      checkOut: '2026-06-04',
    });
    expect(result.outcome).toBe('OK');
    if (result.outcome !== 'OK') throw new Error('unreachable');
    expect(result.native).toEqual({ amount: 90_000, currency: 'SAR' }); // 3 × 30000
  });

  it('prefers a matching season band over the Standard band', () => {
    const result = resolvePrice({
      ...propertyBase,
      rateRules: [...propertyBase.rateRules, standardBand],
      // checkIn 2026-02 is inside the dated season window, so its 40000 band wins.
    });
    expect(result.outcome).toBe('OK');
    if (result.outcome !== 'OK') throw new Error('unreachable');
    expect(result.breakdown.perNight.amount).toBe(40_000);
  });

  it('returns NO_BAND when neither a season nor a Standard band covers the inputs', () => {
    const result = resolvePrice({
      ...propertyBase,
      checkIn: '2026-06-01',
      checkOut: '2026-06-04',
    });
    expect(result.outcome).toBe('NO_BAND');
  });

  it('returns NO_BAND when occupancy exceeds every band', () => {
    const result = resolvePrice({ ...propertyBase, occupancy: 10 });
    expect(result.outcome).toBe('NO_BAND');
  });

  it('returns FX_MISSING when no FX path exists to the display currency', () => {
    const result = resolvePrice({ ...propertyBase, displayCurrency: 'JPY' });
    expect(result.outcome).toBe('FX_MISSING');
  });

  it('converts to the display currency when it differs from the native one', () => {
    const result = resolvePrice({ ...propertyBase, displayCurrency: 'IDR' });
    expect(result.outcome).toBe('OK');
    if (result.outcome !== 'OK') throw new Error('unreachable');
    expect(result.converted).toEqual({ amount: 5_220_000, currency: 'IDR' });
  });
});
