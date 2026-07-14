# 15 — Seed Data (idempotent)

Seed must be **idempotent**: re-running produces the same state (upsert on
natural keys / deterministic ULIDs via a seeded generator, or delete-all-then-
insert inside a transaction for the demo dataset). No duplicate rows on re-run.

## Currencies

| code | minor_unit | symbol | name              |
|------|-----------|--------|-------------------|
| USD  | 2         | $      | US Dollar         |
| SAR  | 2         | ﷼      | Saudi Riyal       |
| IDR  | 0         | Rp     | Indonesian Rupiah |

## FX rates (`rate_ppm` = rate × 1e6)

| base | quote | rate_ppm     | meaning              |
|------|-------|--------------|----------------------|
| SAR  | IDR   | 4_350_000000 | 1 SAR ≈ 4,350 IDR    |
| USD  | IDR   | 16_300_000000| 1 USD ≈ 16,300 IDR   |
| USD  | SAR   | 3_750000     | 1 USD ≈ 3.75 SAR     |

(Inverse pairs resolved by the FX helper, not stored.)

## Listings

### L1 — Property: "Jeddah Waterfront Hotel" (JED-WFH), destination "Jeddah", SA
Room types:
- Double, max_occupancy 2
- Quad, max_occupancy 4

Seasons (on L1):
- standard: 2026-01-01 → 2026-05-01
- peak:     2026-05-01 → 2026-07-01

Rate rules (property → amount is **per night**, SAR):
| season   | room   | band (min–max) | amount (SAR minor) |
|----------|--------|----------------|--------------------|
| standard | Double | 1–2            | 40000  (﷼400/night)|
| standard | Quad   | 3–4            | 70000  (﷼700/night)|
| peak     | Double | 1–2            | 60000  (﷼600/night)|
| peak     | Quad   | 3–4            | 95000  (﷼950/night)|

### L2 — Package: "9-Day Umrah Economy" (UMR-9D-ECO), destination "Jeddah", SA
duration_nights 9. Priced as **total**, room_type_id NULL.

Seasons (on L2):
- standard: 2026-01-01 → 2026-05-01
- ramadan:  2026-02-18 → 2026-03-20   (⚠ overlaps standard — for the demo,
  give L2 non-overlapping windows instead: standard 2026-01-01→2026-02-18,
  ramadan 2026-02-18→2026-03-20, peak 2026-03-20→2026-07-01. Respect the
  non-overlap EXCLUDE constraint.)

Rate rules (package → amount is **total**, USD):
| season   | band (min–max) | amount (USD minor) |
|----------|----------------|--------------------|
| standard | 1–2            | 180000  ($1,800)   |
| standard | 3–4            | 340000  ($3,400)   |
| ramadan  | 1–2            | 260000  ($2,600)   |
| ramadan  | 3–4            | 480000  ($4,800)   |

### L3 — Property: "Madinah Central Inn" (MAD-CIN), destination "Madinah", SA
One room type Double (max 2), standard season only, priced in SAR. Exists so a
`NO_SEASON` case (S9) is easy: query dates outside its single season window.

## Notes

- These exact numbers back the golden scenarios; changing them means updating
  14-scenarios.md.
- Append this data to the existing `packages/db/src/seed.ts` (a flat script with one array
  per table, following the pattern already used for airports/airlines/flights), not a new
  file. Runnable via `pnpm db:seed`, wrapped in a transaction.
