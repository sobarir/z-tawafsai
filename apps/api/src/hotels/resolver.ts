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
  /** NULL for packages, a specific room type for properties. */
  roomTypeId: string | null;
  minOccupancy: number;
  maxOccupancy: number;
  /** Minor units. Per-night for properties, total for packages. */
  amount: number;
  currency: string;
};

export type PropertyBreakdown = {
  perNight: Money;
  nights: number;
  total: Money;
};
export type PackageBreakdown = { total: Money };

export type ResolveInput = {
  listing: { kind: 'property' | 'package'; isActive: boolean };
  seasons: SeasonRow[];
  rateRules: RateRuleRow[];
  checkIn: string;
  checkOut: string;
  occupancy: number;
  displayCurrency: string;
  /** Required for property listings (a specific room type); ignored for packages. */
  roomTypeId?: string | null;
  fxRates: FxRateRow[];
  currencies: CurrencyInfo[];
};

export type ResolveResult =
  | { outcome: Exclude<ResolveOutcome, 'OK'> }
  | {
      outcome: 'OK';
      native: Money;
      converted: Money;
      breakdown: PropertyBreakdown | PackageBreakdown;
    };

function matchSeason(input: ResolveInput): SeasonRow | undefined {
  const { listing, seasons, checkIn, checkOut } = input;
  if (listing.kind === 'property') {
    // The whole stay must fall within a single season window.
    return seasons.find((s) => checkIn >= s.startDate && checkOut <= s.endDate);
  }
  // Package: the departure date (checkIn) must fall within the season window.
  return seasons.find((s) => checkIn >= s.startDate && checkIn < s.endDate);
}

function matchBand(
  input: ResolveInput,
  seasonId: string,
): RateRuleRow | undefined {
  const targetRoomTypeId = input.roomTypeId ?? null;
  return input.rateRules.find(
    (r) =>
      r.seasonId === seasonId &&
      r.roomTypeId === targetRoomTypeId &&
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

  let nativeAmount: number;
  let breakdown: PropertyBreakdown | PackageBreakdown;
  if (input.listing.kind === 'property') {
    const n = nights(input.checkIn, input.checkOut);
    nativeAmount = band.amount * n;
    breakdown = {
      perNight: { amount: band.amount, currency: band.currency },
      nights: n,
      total: { amount: nativeAmount, currency: band.currency },
    };
  } else {
    nativeAmount = band.amount;
    breakdown = { total: { amount: nativeAmount, currency: band.currency } };
  }

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
