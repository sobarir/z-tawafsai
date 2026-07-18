/**
 * Price resolver — see /prd/hotels/01-glossary.md ("Price resolution") and
 * /prd/hotels/13-resolver-and-search.md. Pure given loaded rows: no DB access
 * here, so scenarios can test it with fixtures. DB access lives in
 * hotels.service.ts.
 */
import {
  applyFx,
  type CurrencyInfo,
  type FxRateRow,
  type Money,
  nights,
} from './money';

export type ResolveOutcome =
  | 'OK'
  | 'NO_SEASON'
  | 'NO_BAND'
  | 'FX_MISSING'
  | 'INACTIVE';

export type SeasonRow = {
  id: string;
  /** ISO date, inclusive. */
  startDate: string;
  /** ISO date, exclusive. */
  endDate: string;
};

export type RateRuleRow = {
  seasonId: string;
  roomTypeId: string;
  minOccupancy: number;
  maxOccupancy: number;
  /** Minor units, always per-night. */
  amount: number;
  currency: string;
};

export type PriceBreakdown = {
  perNight: Money;
  nights: number;
  total: Money;
};

export type ResolveInput = {
  listing: { isActive: boolean };
  seasons: SeasonRow[];
  rateRules: RateRuleRow[];
  checkIn: string;
  checkOut: string;
  occupancy: number;
  displayCurrency: string;
  roomTypeId: string;
  fxRates: FxRateRow[];
  currencies: CurrencyInfo[];
};

export type ResolveResult =
  | { outcome: Exclude<ResolveOutcome, 'OK'> }
  | {
      outcome: 'OK';
      native: Money;
      converted: Money;
      breakdown: PriceBreakdown;
    };

function matchSeason(input: ResolveInput): SeasonRow | undefined {
  const { seasons, checkIn, checkOut } = input;
  // The whole stay must fall within a single season window.
  return seasons.find((s) => checkIn >= s.startDate && checkOut <= s.endDate);
}

function matchBand(
  input: ResolveInput,
  seasonId: string,
): RateRuleRow | undefined {
  return input.rateRules.find(
    (r) =>
      r.seasonId === seasonId &&
      r.roomTypeId === input.roomTypeId &&
      input.occupancy >= r.minOccupancy &&
      input.occupancy <= r.maxOccupancy,
  );
}

export function resolvePrice(input: ResolveInput): ResolveResult {
  if (!input.listing.isActive) {
    return { outcome: 'INACTIVE' };
  }

  const season = matchSeason(input);
  if (!season) {
    return { outcome: 'NO_SEASON' };
  }

  const band = matchBand(input, season.id);
  if (!band) {
    return { outcome: 'NO_BAND' };
  }

  const n = nights(input.checkIn, input.checkOut);
  const nativeAmount = band.amount * n;
  const breakdown: PriceBreakdown = {
    perNight: { amount: band.amount, currency: band.currency },
    nights: n,
    total: { amount: nativeAmount, currency: band.currency },
  };

  const native: Money = { amount: nativeAmount, currency: band.currency };

  let converted: Money;
  try {
    converted = applyFx(
      native,
      input.displayCurrency,
      input.fxRates,
      input.currencies,
    );
  } catch {
    return { outcome: 'FX_MISSING' };
  }

  return { outcome: 'OK', native, converted, breakdown };
}
