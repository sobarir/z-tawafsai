# 13 — Price Resolver & Search API

Built as a real feature module: `apps/api/src/hotels/` with
`hotels.controller.ts|service.ts|dto.ts|module.ts` (copy `apps/api/src/posts/` — the repo's
reference feature). Every route carries `@ApiOperation({ operationId, summary })` — mandatory,
it names the generated frontend hook (e.g. `operationId: 'searchHotels'` → `useSearchHotels()`).
Request/response shapes are Zod schemas in `packages/shared/src/index.ts`
(`hotelSearchQuerySchema`, `hotelSearchResultSchema`, etc.) — reuse the **existing**
`currencyCodeSchema` and `ulidSchema` already exported there rather than redefining
currency/ULID validation. `checkIn`/`checkOut` are `z.iso.date()` (same pattern already used
for the flights `date` field) — never `z.date()`/`z.coerce.date()`. Routes are session-gated
by the repo's global `AuthGuard` by default (matches flights) — no `@AllowAnonymous()` needed.

After wiring the controller, `pnpm generate:api` must run and its diff (`apps/api/openapi.json`
+ `apps/web/src/libs/api/generated/`) is committed together with the code — this is a CI gate
in this repo, not optional polish.

## Money & FX helpers (build first, unit-test hard)

```
type Money = { amount: number; currency: string }; // amount = integer minor units

nights(checkIn: Date, checkOut: Date): number
  = whole days, checkOut exclusive; must be ≥ 1.

applyFx(m: Money, to: string, fx): Money
  if m.currency === to → return m unchanged.
  find fx_rate(base=m.currency, quote=to).
    if found:      converted = round(m.amount * rate_ppm / 1_000_000)
    else try inverse fx_rate(base=to, quote=m.currency):
                   converted = round(m.amount * 1_000_000 / rate_ppm)
    else → throw FxMissing (caller turns into FX_MISSING filter outcome).
  Rounding: half-up to the display currency's minor_unit precision.
```

Rounding happens **once**, at the final display conversion. Never round mid-calc.

## Resolver

```
resolvePrice(listing, { checkIn, checkOut, occupancy, displayCurrency, roomTypeId? })
  → { outcome: 'OK'|'NO_BAND'|'FX_MISSING'|'INACTIVE',
      native?: Money, converted?: Money, breakdown?: {...} }

steps (see 01-glossary.md for the canonical algorithm):
  - inactive listing → INACTIVE
  - season := matchSeason(listing, checkIn, checkOut)   // kind-dependent; may be none
  - band   := matchBand(listing, season, ...) ?? matchBand(listing, null, ...)
              // a matched season's band wins; otherwise the Standard
              // (season_id = NULL) band applies. No NO_SEASON outcome.
  - native := listing.kind === 'property'
                ? band.amount * nights(checkIn, checkOut)
                : band.amount
  - converted := applyFx({amount: native, currency: band.currency},
                         displayCurrency, fx)
  - breakdown: for property include perNight + nights; for package include total.
```

The resolver is **pure** given the loaded rows — take data in, return a result.
DB access lives in a repository, not in the resolver, so scenarios can test it
with fixtures.

## Search endpoint

`GET /hotels/search` (read-only; no other verbs exist in this service — matches the
`GET /flights/search` naming precedent)

Query params:

| param        | type      | required | notes                                   |
|--------------|-----------|----------|-----------------------------------------|
| destination  | string    | yes      | matched against `listing.destination`   |
| checkIn      | date      | yes      | ISO date                                |
| checkOut     | date      | yes      | ISO date, exclusive, > checkIn          |
| occupancy    | integer   | yes      | ≥ 1                                      |
| currency     | char(3)   | yes      | display currency                        |
| kind         | enum      | no       | property \| package \| both (default property)|
| roomType     | string    | no       | property-only preference hint           |
| minPrice     | integer   | no       | in display currency minor units         |
| maxPrice     | integer   | no       | in display currency minor units         |
| sort         | enum      | no       | price_asc (default) \| price_desc \| name |
| limit/offset | integer   | no       | pagination; sane defaults (20 / 0)      |

Pipeline:

```
1. Load active listings matching destination (+ kind filter).
   For a property, pick the room type: `roomType` hint if given & valid,
   else the cheapest qualifying room type for the inputs.
2. For each, run resolvePrice. Keep only outcome === 'OK'.
3. Apply minPrice/maxPrice on the CONVERTED display price.
4. Sort, paginate.
5. Return rows: { listingId, kind, displayName, destination, heroImageUrl,
   price: { amount, currency }, nativePrice: { amount, currency },
   breakdown, ...kind-specific (starRating | durationNights) }.
```

Non-`OK` listings are **silently omitted**, never surfaced as errors. Response is
always `200` with a (possibly empty) array + total count.

## Validation

Reject with `400` only on malformed input (checkOut ≤ checkIn, occupancy < 1,
unknown currency code, bad date). A well-formed search that matches nothing
returns `200` + empty list.
