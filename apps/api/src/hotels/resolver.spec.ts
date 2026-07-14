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
  listing: { kind: 'property', isActive: true },
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

const packageBase: ResolveInput = {
  listing: { kind: 'package', isActive: true },
  seasons: [
    { id: 's-standard', startDate: '2026-01-01', endDate: '2026-05-01' },
  ],
  rateRules: [
    {
      seasonId: 's-standard',
      roomTypeId: null,
      minOccupancy: 1,
      maxOccupancy: 2,
      amount: 180_000,
      currency: 'USD',
    },
  ],
  checkIn: '2026-02-01',
  checkOut: '2026-02-10',
  occupancy: 2,
  displayCurrency: 'USD',
  fxRates,
  currencies,
};

describe('resolvePrice', () => {
  it('property: multiplies per-night amount by nights', () => {
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

  it('package: uses the season total, ignoring nights', () => {
    const result = resolvePrice(packageBase);
    expect(result.outcome).toBe('OK');
    if (result.outcome !== 'OK') throw new Error('unreachable');
    expect(result.native).toEqual({ amount: 180_000, currency: 'USD' });
    expect(result.breakdown).toEqual({
      total: { amount: 180_000, currency: 'USD' },
    });
  });

  it('returns INACTIVE for an inactive listing without checking anything else', () => {
    const result = resolvePrice({
      ...propertyBase,
      listing: { ...propertyBase.listing, isActive: false },
    });
    expect(result.outcome).toBe('INACTIVE');
  });

  it('returns NO_SEASON when the stay falls outside every season window', () => {
    const result = resolvePrice({
      ...propertyBase,
      checkIn: '2026-06-01',
      checkOut: '2026-06-04',
    });
    expect(result.outcome).toBe('NO_SEASON');
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
