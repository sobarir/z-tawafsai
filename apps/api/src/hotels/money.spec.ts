import { describe, expect, it } from 'vitest';
import { applyFx, FxMissingError, nights } from './money';

const currencies = [
  { code: 'USD', minorUnit: 2 },
  { code: 'SAR', minorUnit: 2 },
  { code: 'IDR', minorUnit: 0 },
];

// Mirrors the `fxRates` seed in packages/db/src/seed.ts exactly — keep the two
// in step, or these unit expectations stop describing real conversions.
const fxRates = [
  { baseCurrency: 'SAR', quoteCurrency: 'IDR', ratePpm: 4_350_000_000 },
  { baseCurrency: 'USD', quoteCurrency: 'IDR', ratePpm: 16_300_000_000 },
  { baseCurrency: 'USD', quoteCurrency: 'SAR', ratePpm: 3_750_000 },
];

describe('nights', () => {
  it('counts whole days, checkOut exclusive', () => {
    expect(nights('2026-06-01', '2026-06-04')).toBe(3);
  });

  it('rejects a same-day or inverted stay', () => {
    expect(() => nights('2026-06-01', '2026-06-01')).toThrow();
    expect(() => nights('2026-06-04', '2026-06-01')).toThrow();
  });
});

describe('applyFx', () => {
  it('returns the amount unchanged when currencies match', () => {
    expect(
      applyFx({ amount: 40_000, currency: 'SAR' }, 'SAR', fxRates, currencies),
    ).toEqual({
      amount: 40_000,
      currency: 'SAR',
    });
  });

  it('converts via a directly stored rate, rescaling minor units (SAR 2dp -> IDR 0dp)', () => {
    // SAR 400.00 (40000 minor) * 4350 = IDR 1,740,000 major = 1,740,000 minor (0dp).
    expect(
      applyFx({ amount: 40_000, currency: 'SAR' }, 'IDR', fxRates, currencies),
    ).toEqual({
      amount: 1_740_000,
      currency: 'IDR',
    });
  });

  it('converts via the inverse of a stored rate when no direct rate exists', () => {
    // Only USD->SAR (3.75) is stored, not SAR->USD. SAR 400.00 / 3.75 = USD 106.666... ->
    // round to 106.67 (10667 minor, 2dp).
    expect(
      applyFx({ amount: 40_000, currency: 'SAR' }, 'USD', fxRates, currencies),
    ).toEqual({
      amount: 10_667,
      currency: 'USD',
    });
  });

  it('throws FxMissingError when neither a direct nor inverse rate exists', () => {
    const currenciesWithNoRoute = [
      ...currencies,
      { code: 'EUR', minorUnit: 2 },
      { code: 'JPY', minorUnit: 0 },
    ];
    expect(() =>
      applyFx(
        { amount: 100, currency: 'EUR' },
        'JPY',
        fxRates,
        currenciesWithNoRoute,
      ),
    ).toThrow(FxMissingError);
  });
});
