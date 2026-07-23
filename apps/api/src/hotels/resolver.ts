/**
 * Price resolver. Pure given loaded rows: no DB access here, so scenarios can
 * test it with fixtures. DB access lives in hotels.service.ts.
 *
 * Resolution order, for a stay (checkIn, checkOut, occupancy, displayCurrency):
 *   1. inactive property                        -> INACTIVE
 *   2. the property's season_window covering the stay -> its global season
 *      (may be none — that is normal, not an error)
 *   3. band := the matched season's rate_rule for the occupancy,
 *              ELSE the Standard (season_id = NULL) rate_rule
 *   4. no band at all                           -> NO_BAND
 *   5. native  := band.amount * nights          (always nightly x nights)
 *   6. converted := applyFx(native, displayCurrency)  -> FX_MISSING if no rate
 *
 * Step 3's fallback is why there is no NO_SEASON outcome: a stay outside every
 * dated window is priced at the Standard rate, not excluded. Rounding happens
 * exactly once, in applyFx at step 6 — never mid-calculation.
 *
 * Anything other than OK is silently omitted from search results rather than
 * surfaced as an error; the endpoint always answers 200.
 */
import {
  applyFx,
  type CurrencyInfo,
  type FxRateRow,
  type Money,
  nights,
} from './money';

export type ResolveOutcome = 'OK' | 'NO_BAND' | 'FX_MISSING' | 'INACTIVE';

export type SeasonRow = {
  id: string;
  /** ISO date, inclusive. */
  startDate: string;
  /** ISO date, exclusive. */
  endDate: string;
};

export type RateRuleRow = {
  /** Null = the Standard (season-less) base rate. */
  seasonId: string | null;
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
  seasonId: string | null,
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

  // A dated season covering the stay takes priority; otherwise (and whenever the
  // matched season has no band for this room/occupancy) fall back to the
  // Standard, season-less band. There is no NO_SEASON outcome any more —
  // "no season" simply means Standard.
  const season = matchSeason(input);
  const band =
    (season ? matchBand(input, season.id) : undefined) ??
    matchBand(input, null);
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
