/**
 * Money & FX helpers — see /prd/hotels/13-resolver-and-search.md. Pure
 * functions, no DB access, unit-tested directly.
 */

export type Money = { amount: number; currency: string };

export type FxRateRow = {
  baseCurrency: string;
  quoteCurrency: string;
  /** rate x 1_000_000 (parts per million). */
  ratePpm: number;
};

export type CurrencyInfo = { code: string; minorUnit: number };

export class FxMissingError extends Error {
  constructor(from: string, to: string) {
    super(`No FX rate (direct or inverse) from ${from} to ${to}`);
    this.name = 'FxMissingError';
  }
}

/** Whole days between two ISO dates, checkOut exclusive. Must be >= 1. */
export function nights(checkIn: string, checkOut: string): number {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  const wholeDays = Math.round((end - start) / 86_400_000);
  if (!Number.isFinite(wholeDays) || wholeDays < 1) {
    throw new Error(
      'Invalid stay: checkOut must be at least 1 night after checkIn',
    );
  }
  return wholeDays;
}

function minorUnitFor(code: string, currencies: CurrencyInfo[]): number {
  const found = currencies.find((c) => c.code === code);
  if (!found) {
    throw new Error(`Unknown currency code: ${code}`);
  }
  return found.minorUnit;
}

/**
 * Converts `money` to `toCurrency`. Rounds once, half-up, at the display
 * currency's minor-unit precision — never mid-calculation. The stored
 * `ratePpm` is a major-unit multiplier (e.g. "1 SAR = 4350 IDR"), so the
 * native amount is de-scaled to major units before applying it and
 * re-scaled to the target currency's own minor unit afterward — currencies
 * with different minor-unit counts (e.g. SAR's 2 vs IDR's 0) would otherwise
 * be off by a power of 10.
 */
export function applyFx(
  money: Money,
  toCurrency: string,
  fxRates: FxRateRow[],
  currencies: CurrencyInfo[],
): Money {
  if (money.currency === toCurrency) {
    return money;
  }

  const fromMinor = minorUnitFor(money.currency, currencies);
  const toMinor = minorUnitFor(toCurrency, currencies);
  const nativeMajor = money.amount / 10 ** fromMinor;

  const direct = fxRates.find(
    (r) => r.baseCurrency === money.currency && r.quoteCurrency === toCurrency,
  );
  const inverse = fxRates.find(
    (r) => r.baseCurrency === toCurrency && r.quoteCurrency === money.currency,
  );

  let convertedMajor: number;
  if (direct) {
    convertedMajor = nativeMajor * (direct.ratePpm / 1_000_000);
  } else if (inverse) {
    convertedMajor = nativeMajor / (inverse.ratePpm / 1_000_000);
  } else {
    throw new FxMissingError(money.currency, toCurrency);
  }

  return {
    amount: Math.round(convertedMajor * 10 ** toMinor),
    currency: toCurrency,
  };
}
