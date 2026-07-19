# 01 — Glossary & decision logic

## Terms

- **Listing** — the abstract, searchable unit. Holds everything common to both
  kinds: display name, destination, `kind`, `hero_image_url`, active flag.
  Exactly one child row (`property` or `package`) exists per listing.
- **Property** — `kind=property` listing detail. Has one or more **room types**.
  Priced **per night**.
- **Package** — `kind=package` listing detail. Fixed scope (e.g. `duration_nights`).
  Priced **as a total** for the stay/departure, not per night.
- **Room Type** — a bookable room class under a property (e.g. "Double",
  "Quad"). Carries `max_occupancy`. Property rate rules are scoped to a room type.
- **Season** — a `[start_date, end_date)` window, named (e.g. "Peak", "Ramadan"),
  scoped to a single listing. Non-overlapping within a listing.
- **Occupancy band** — an inclusive `[min_occupancy, max_occupancy]` range on a
  rate rule. The requested occupancy falls into exactly one band per
  (listing, season[, room type]).
- **Rate Rule** — the atomic price fact:
  `(listing, season, occupancy band[, room type]) → amount + currency`.
  For properties the amount is **per night**; for packages it is a **total**.
- **FX Rate** — `(base_currency, quote_currency) → rate` for display conversion.

## Price resolution (the core algorithm)

Input: `listingId`, `checkIn`, `checkOut` (checkOut exclusive), `occupancy`,
`displayCurrency`, and for properties optionally `roomTypeId`.

```
1. Load listing. If inactive → EXCLUDED.
2. Resolve season (optional — 2026-07-19):
     find the season on this listing whose window contains the stay.
     - property: the stay must fall within a single season window
                 (checkIn ≥ season.start AND checkOut ≤ season.end).
     - package:  the checkIn (departure) must fall within a season window.
     If none, that's fine — the Standard (season-less) rate applies. There is
     no NO_SEASON outcome: "no season" simply means Standard.
3. Resolve occupancy band (season → Standard fallback):
     find the rate_rule for (listing, matched-season[, roomType]) whose
     [min,max] occupancy contains `occupancy`. If the matched season has no such
     band (or no season matched), fall back to the Standard band — the rate_rule
     with season_id = NULL for that [roomType,] occupancy.
     If neither a seasonal nor a Standard band matches → NO_BAND (excluded).
4. Compute native amount:
     - property: nights = checkOut - checkIn (in days);
                 native = rate_rule.amount_per_night * nights.
     - package:  native = rate_rule.amount_total.   (nights ignored)
5. Convert to display currency:
     if rate_rule.currency == displayCurrency → converted = native.
     else converted = applyFx(native, rate_rule.currency, displayCurrency).
     If no FX path → FX_MISSING (excluded).
6. Return { native, nativeCurrency, converted, displayCurrency, breakdown }.
```

## Property vs package — the one branch that matters

| Aspect            | Property                          | Package                       |
|-------------------|-----------------------------------|-------------------------------|
| Rate rule amount  | per **night**                     | **total** for the stay        |
| Nights factor     | multiplies the amount             | ignored                       |
| Room type         | required (rate scoped to it)      | not applicable                |
| Season match      | whole stay inside one season      | departure date inside season  |

Everything above the branch (season lookup, band lookup, FX) is shared. Keep the
shared path shared; branch only on the multiply-by-nights step and room-type
scoping.

## Resolution outcomes (not exceptions — filters)

`OK`, `NO_BAND`, `FX_MISSING`, `INACTIVE`. Anything not `OK` means the listing is
silently dropped from that search's results, never a 500. (`NO_SEASON` was
removed 2026-07-19 — a missing season now falls back to the Standard rate.)

## The 5 golden rules

1. **Listing is the spine.** Property and Package never reference each other; they both hang
   off `listing`. Search operates on `listing`, price resolution dispatches on `listing.kind`.
2. **Price is resolved, not stored per query.** A returned price is computed from
   (season × occupancy band × currency) at request time. No cached per-search prices in the
   schema.
3. **Money is always (integer minor units + currency).** No exceptions. FX is a lookup, never
   an arithmetic guess.
4. **Search never mutates.** Every endpoint in this service is read-only. If a request would
   write, it's out of scope.
5. **Nightly (property) vs total (package) pricing are different resolvers.** Same input
   shape, different math, dispatched on `kind`. Don't collapse them. This reaches the UI: a
   **property card shows `perNight × nights`, a package card shows a flat total and never a
   per-night figure.** The client never does money arithmetic — it formats and displays what
   the API returns.
