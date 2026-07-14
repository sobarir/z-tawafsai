# 14 — Golden Scenarios (definition of done)

Twelve Vitest scenarios. All must be green. They are the oracle — behavior is
correct iff these pass. Each uses fixed seed fixtures (see 15-seed-data.md). They live as
colocated `apps/api/src/hotels/*.spec.ts` files, the same convention `flights.service.spec.ts`
already follows in this repo — run via `pnpm --filter api test`.

| ID  | Scenario                                                            | Asserts |
|-----|--------------------------------------------------------------------|---------|
| S1  | Property, standard season, 2 guests, native currency               | price = perNight × nights, no FX applied |
| S2  | Property, stay spans 3 nights → price = perNight × 3                | nights multiplier correct |
| S3  | Package, standard season, 2 pax → price = season TOTAL              | nights NOT multiplied for packages |
| S4  | Seasonal boundary: same property, dates in **peak** vs **standard** | different perNight → different price |
| S5  | Occupancy band: 2 guests vs 4 guests, same dates                   | different band selected → different price |
| S6  | Multi-currency: property priced in SAR, display in IDR             | converted via fx_rate, rounded to IDR minor_unit |
| S7  | FX inverse: rate stored as (IDR→SAR), request SAR→IDR path         | inverse rate used correctly |
| S8  | Unified search returns BOTH a property and a package in one call    | mixed result set, each priced by its own rule |
| S9  | `NO_SEASON`: dates outside any season window                        | listing silently omitted, 200 + not in results |
| S10 | `NO_BAND`: occupancy above all bands                                | listing silently omitted |
| S11 | Sort price_asc across mixed property+package rows in display ccy    | ordering by converted price, stable |
| S12 | Price filter minPrice/maxPrice applied on CONVERTED price           | rows outside band excluded; boundary inclusive |

## Coverage matrix

| Concern                     | Covered by            |
|-----------------------------|-----------------------|
| Nightly (date-range)        | S1, S2, S4            |
| Package total (not nightly) | S3, S8                |
| Seasonal / tiered           | S4, S9                |
| Per-occupancy bands         | S5, S10               |
| Multi-currency + rounding   | S6, S7, S11, S12      |
| Unified property+package    | S8, S11               |
| Silent-omit outcomes        | S9, S10               |
| Sort & filter in display ccy| S11, S12              |

## Rules for the scenarios

- No network, no real clock — inject dates and FX as fixtures.
- Assert exact integer minor-unit amounts, not floats.
- Each scenario names the expected resolution outcome explicitly.
- If a scenario needs a price the seed doesn't provide, extend the seed spec in
  15-seed-data.md — don't hardcode magic numbers in the test.
