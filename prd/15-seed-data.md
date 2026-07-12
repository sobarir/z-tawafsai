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

## Airlines (own-metal + codeshare partners, all local rows)

| code | name                | country |
| ---- | ------------------- | ------- |
| GA   | Garuda Indonesia    | ID      |
| NH   | ANA                 | JP      |
| KL   | KLM                 | NL      |
| QR   | Qatar Airways       | QA      |
| AF   | Air France          | FR      |
| SQ   | Singapore Airlines  | SG      |

## MCT rules (see full table in `13-mct-rules.md`)

Seed at minimum: NRT/NRT II(60) & ID(90), **NRT/HND II(240)**, SIN/SIN II(60), JFK/JFK II(75),
JFK/EWR II(300), DOH/DOH II(60, max 2880). Plus the S11 pair: NRT/NRT II default(60) and
NRT/NRT II arrival_airline=NH(45).

## Interline agreements (directional carrier-pair gate)

| inbound | outbound | bag_through_checked | note                                    |
| ------- | -------- | :-----------------: | --------------------------------------- |
| GA      | SQ       | true                | Garuda → Singapore Air, bags through    |
| SQ      | GA       | true                | reverse direction (symmetric pair)      |
| GA      | QR       | true                | Garuda → Qatar                          |
| NH      | KL       | false               | ANA → KLM, agreement exists but bags NOT through-checked |

> Deliberately NO agreement seeded for GA→AF — used by S15 to prove the `NO_INTERLINE` path.
> NH→KL has `bag_through_checked = false` to exercise a permitted-but-no-bag-through case (S16).

## Demo flights (enough to run all scenarios)

- **GA 874** CGK→NRT (operating GA) with marketing rows: GA 874 (`is_operating_carrier=true`),
  NH 5502, KL 4062 → powers S10.
- **NH 10** CGK→LHR, single operating flight, **two legs** L1 CGK→BKK / L2 BKK→LHR
  (role `TECHNICAL_STOP`), one marketing row NH 10 → powers S7.
- Point-to-point demo flights for S1–S6, S8, S12 at the times listed in `14-scenarios.md`.

> Keep all seed departure/arrival times exactly as written in `14-scenarios.md` (with the stated
> offsets) so the classifier tests are deterministic.

## Seeding order (respect FKs)

1. airports → 2. airlines → 3. mct_rules → 4. flights → 5. flight_legs → 6. flight_marketing.
