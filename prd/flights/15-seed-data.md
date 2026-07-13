# 15 — Seed Data

A single idempotent seed script (`/src/db/seed.ts`, run via `pnpm db:seed`) that upserts all rows
below. Must be safe to run repeatedly (use `onConflictDoNothing`/`onConflictDoUpdate`). The golden
scenarios in `14-scenarios.md` depend on this exact data.

## Airports (city_code drives metro grouping)

| code | city | country | timezone           |
| ---- | ---- | ------- | ------------------ |
| CGK  | JKT  | ID      | Asia/Jakarta       |
| DPS  | DPS  | ID      | Asia/Makassar      |
| SIN  | SIN  | SG      | Asia/Singapore     |
| NRT  | TYO  | JP      | Asia/Tokyo         |
| HND  | TYO  | JP      | Asia/Tokyo         |
| DOH  | DOH  | QA      | Asia/Qatar         |
| LHR  | LON  | GB      | Europe/London      |
| LGW  | LON  | GB      | Europe/London      |
| FCO  | ROM  | IT      | Europe/Rome        |
| CDG  | PAR  | FR      | Europe/Paris       |
| JFK  | NYC  | US      | America/New_York   |
| EWR  | NYC  | US      | America/New_York   |
| JED  | JED  | SA      | Asia/Riyadh        |
| MED  | MED  | SA      | Asia/Riyadh        |
| KUL  | KUL  | MY      | Asia/Kuala_Lumpur  |
| DXB  | DXB  | AE      | Asia/Dubai         |
| AUH  | AUH  | AE      | Asia/Dubai         |
| CAI  | CAI  | EG      | Africa/Cairo       |
| BOM  | BOM  | IN      | Asia/Kolkata       |
| HAK  | HAK  | CN      | Asia/Shanghai      |
| MCT  | MCT  | OM      | Asia/Muscat        |

## Airlines (own-metal + codeshare partners, all local rows)

| code | name                | country |
| ---- | ------------------- | ------- |
| GA   | Garuda Indonesia    | ID      |
| NH   | ANA                 | JP      |
| KL   | KLM                 | NL      |
| QR   | Qatar Airways       | QA      |
| AF   | Air France          | FR      |
| SQ   | Singapore Airlines  | SG      |
| SV   | Saudia              | SA      |
| MH   | Malaysia Airlines   | MY      |
| EK   | Emirates            | AE      |
| EY   | Etihad Airways      | AE      |
| MS   | EgyptAir            | EG      |
| AI   | Air India           | IN      |
| HU   | Hainan Airlines     | CN      |
| WY   | Oman Air            | OM      |
| TR   | Scoot               | SG      |
| 6E   | IndiGo              | IN      |

## MCT rules (see full table in `13-mct-rules.md`)

Seed at minimum: NRT/NRT II(60) & ID(90), **NRT/HND II(240)**, SIN/SIN II(60), JFK/JFK II(75),
JFK/EWR II(300), DOH/DOH II(60, max 2880). Plus the S11 pair: NRT/NRT II default(60) and
NRT/NRT II arrival_airline=NH(45). v1.2 adds 8 hub-junction rules: KUL/KUL, DXB/DXB, AUH/AUH,
MCT/MCT (all II, 60min), CAI/CAI and BOM/BOM (II, 90min — secondary hubs), HAK/HAK (II, 120min —
newest/thinnest route), and JED/JED (ID, 90min — the SV domestic JED→MED connector junction).

## Interline agreements (directional carrier-pair gate)

| inbound | outbound | bag_through_checked | note                                    |
| ------- | -------- | :-----------------: | --------------------------------------- |
| GA      | SQ       | true                | Garuda → Singapore Air, bags through    |
| SQ      | GA       | true                | reverse direction (symmetric pair)      |
| GA      | QR       | true                | Garuda → Qatar                          |
| NH      | KL       | false               | ANA → KLM, agreement exists but bags NOT through-checked |
| SQ      | TR       | true                | v1.2: Singapore Air → Scoot, SIN hub junction |
| 6E      | AI       | true                | v1.2: IndiGo → Air India, BOM hub junction |
| TR      | SV       | false                | v1.2: Scoot → Saudia, JED→MED connector |
| EK      | SV       | false                | v1.2: Emirates → Saudia, JED→MED connector |
| EY      | SV       | false                | v1.2: Etihad → Saudia, JED→MED connector |
| MS      | SV       | false                | v1.2: EgyptAir → Saudia, JED→MED connector |
| AI      | SV       | false                | v1.2: Air India → Saudia, JED→MED connector |
| HU      | SV       | false                | v1.2: Hainan → Saudia, JED→MED connector |

> Deliberately NO agreement seeded for GA→AF — used by S15 to prove the `NO_INTERLINE` path.
> NH→KL has `bag_through_checked = false` to exercise a permitted-but-no-bag-through case (S16).
> v1.2's same-operating-carrier hub junctions (KUL/MH, DXB/EK, AUH/EY, DOH/QR, CAI/MS, MCT/WY)
> need no interline row — online connections bypass this lookup. Reverse rows (e.g. SV→TR) are
> deliberately omitted since this batch adds no return (JED/MED→CGK) itineraries.

## Demo flights (enough to run all scenarios)

- **GA 874** CGK→NRT (operating GA) with marketing rows: GA 874 (`is_operating_carrier=true`),
  NH 5502, KL 4062 → powers S10.
- **NH 10** CGK→LHR, single operating flight, **two legs** L1 CGK→BKK / L2 BKK→LHR
  (role `TECHNICAL_STOP`), one marketing row NH 10 → powers S7.
- Point-to-point demo flights for S1–S6, S8, S12 at the times listed in `14-scenarios.md`.

> Keep all seed departure/arrival times exactly as written in `14-scenarios.md` (with the stated
> offsets) so the classifier tests are deterministic.

## Flight pricing (v1.1)

Every seeded flight carries a flat `price` (USD, roughly distance-banded — short intra-Asia hops
~$60-180, medium-haul ~$400-650, long-haul ~$900-980) and `currency: 'USD'`, for `GET
/flights/search` and admin-screen demonstration. Not tied to any golden scenario — S1-S18 assertions
never depend on price. See `00-overview.md` Goal 7.

## CGK↔JED/MED realistic search demo data (v1.2)

180 additional flights (26 route-patterns × 6-9 dates each) for Jakarta (CGK) → Jeddah (JED) and
CGK → Madinah (MED), Aug/Sep/Oct 2026, grounded in real-world airline routing (researched, not
literal future fares). Direct: GA and SV both fly CGK-JED and CGK-MED (3 dates/month, "headline"
tier). Plus 9 transit hubs (SIN, KUL, DXB, AUH, DOH, CAI, BOM, HAK, MCT), each 2 dates/month
("standard" tier) except MS CGK-CAI/CAI-JED (real Wed/Fri schedule only) and HU CGK-HAK/HAK-JED
(real Thu-outbound / Wed-inbound schedule, intentionally not same-day — HAK is the thinnest route
in the set and genuinely requires a multi-day layover in reality).

`FlightsService.search()` matches a single `flights` row by origin+dest+UTC-day — it never chains
two flights into one itinerary. So MED is only reachable directly (GA, SV) or via the 3 hubs whose
carrier genuinely flies onward to MED (KUL/MH, DOH/QR, MCT/WY); the other 6 hubs only reach JED,
plus a standalone **SV JED-MED domestic connector** (2 daily departures, AM ~14:15 and PM ~23:00
local, flight numbers SV 1420/1422) that non-MED-capable hub arrivals can interline onto.

Prices (USD) follow base-price-per-pattern × month multiplier (Aug 1.00, Sep 0.95 shoulder, Oct
1.05) × within-month multiplier (0.97/1.00/[1.03 headline-only]), rounded to $5 — direct GA/SV
land priciest (~$800-850), hub two-leg itineraries land cheaper or comparable per carrier tier.

> Known limitation: HAK's own two legs (and CAI's, on the connector) don't always land on a date
> that lines up with the SV JED-MED connector's dates — real Saudia flies that route ~7x/day, but
> this seed only samples a few dates/month. A `/connections/validate` check across a misaligned
> pair still resolves correctly (as `stopover`, not an error), it just isn't demonstrated end-to-end
> for every hub in this dataset.

## Seeding order (respect FKs)

1. airports → 2. airlines → 3. mct_rules → 4. flights → 5. flight_legs → 6. flight_marketing.
