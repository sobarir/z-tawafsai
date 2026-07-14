/**
 * Hotel prices are integer minor units (prd/hotels/11-data-model.md) — unlike
 * flights' decimal `numeric(10,2)` price column, so `@/libs/format-currency`
 * (which expects an already-major-unit amount) does not apply here. The
 * currency's minor-unit count is domain-seeded data (prd/hotels/15-seed-data.md)
 * rather than always matching Intl's built-in ISO-4217 table (e.g. IDR is
 * seeded with 0 decimals here) — never assume /100.
 */
const MINOR_UNITS: Record<string, number> = { USD: 2, SAR: 2, IDR: 0 };
const DEFAULT_MINOR_UNIT = 2;

export function minorUnitFor(currency: string): number {
  return MINOR_UNITS[currency] ?? DEFAULT_MINOR_UNIT;
}

export function formatHotelMoney(
  money: { amount: number; currency: string },
  locale: string,
): string {
  const minorUnit = minorUnitFor(money.currency);
  const major = money.amount / 10 ** minorUnit;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(major);
}
