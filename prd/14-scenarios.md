# 14 — Golden Scenarios (acceptance tests)

Every scenario below MUST be a Vitest case. The service is not "done" until all pass. These are the
success-criteria oracle referenced in `00-overview.md`. Assume the seed data from `15-seed-data.md`.

## S1 — Simple connection (valid)

- P: NH 10  CGK→NRT, arr `2026-06-01T10:45+09:00`
- N: NH 847 NRT→SIN, dep `2026-06-01T12:45+09:00`
- gap = 120 min; NRT→NRT II rule mct=60, max=1440.
- **Expect** `kind='connection'`, `gapMinutes=120`, `sameMetroInterAirport=false`.

## S2 — Connection too tight (invalid, below MCT)

- P: NH 10  CGK→NRT arr `10:45`; N: NH 847 NRT→SIN dep `11:15`.
- gap = 30 min < mct 60.
- **Expect** `kind='invalid'`, `reason='BELOW_MCT'`, `gapMinutes=30`.

## S3 — Stopover (valid, beyond max_connection)

- P: QR 1 CGK→DOH arr `2026-06-01T11:30+03:00`; N: QR 2 DOH→LHR dep `2026-06-03T09:00+03:00`.
- gap ≈ 2730 min; DOH→DOH II rule mct=60, max=2880.
- **Expect** `kind='stopover'`, `gapMinutes≈2730`.

## S4 — Inter-airport connection, valid (NRT→HND)

- P: intl arr NRT `08:00`; N: intl dep HND `13:00`. Cities both TYO.
- gap = 300 min; NRT→HND II rule mct=240, max=1440.
- **Expect** `kind='connection'`, `sameMetroInterAirport=true`, `appliedMctRuleId=<NRT→HND rule>`.

## S5 — Inter-airport too tight (NRT→HND, invalid)

- Same as S4 but N departs HND `11:00` → gap 180 min < 240.
- **Expect** `kind='invalid'`, `reason='BELOW_MCT'`. (Proves the larger inter-airport MCT is applied,
  not the 60-min same-airport rule.)

## S6 — Open-jaw (cities don't line up)

- P: GA 1 CGK→FCO (arrive Rome, city ROM).
- N: AF 2 CDG→CGK (depart Paris, city PAR).
- **Expect** `kind='open_jaw'`, `gapMinutes=null`. No MCT lookup performed.

## S7 — Transit / technical stop (leg-level, same operating flight)

- Operating flight NH 10 CGK→LHR with legs: L1 CGK→BKK, L2 BKK→LHR (role TECHNICAL_STOP).
- Passing the same flight id as both prev and next.
- **Expect** `kind='transit'`, `gapMinutes=null`. Assert flight has 2 `flight_legs`, 1 `flights` row,
  and exactly 1 segment (marketing) — NOT two flights.

## S8 — Negative gap (guard)

- P arr `12:00`; N dep `11:00` same day, same airport.
- **Expect** `kind='invalid'`, `reason='NEGATIVE_GAP'`.

## S9 — No MCT rule (guard)

- Valid same-airport connection at an airport with NO seeded rule and no default.
- **Expect** `kind='invalid'`, `reason='NO_MCT_RULE'`. (Enforces "never silently pass.")

## S10 — Codeshare resolves to one operating flight

- Operating GA 874 CGK→NRT with marketing rows GA 874 (is_operating_carrier=true), NH 5502, KL 4062.
- **Expect**: querying by marketing NH 5502 → resolves to operating flight GA 874;
  `flights` count for the physical flight = 1; a report grouping by operating flight counts it once,
  not three times.

## S11 — Most-specific-first rule wins

- Two rules for NRT→NRT II: a default (mct 60) and an airline-specific one for arrival_airline=NH
  (mct 45). Candidate has arrival_airline NH.
- **Expect** the NH-specific rule (mct 45) is applied, not the default. A 50-min gap → `connection`
  (would be invalid under the default). Assert `appliedMctRuleId` = the specific rule.

## S12 — validate-chain over a 3-flight itinerary

- CGK→NRT (conn) →HND intl dep (inter-airport conn) →LHR.
- **Expect** an array of 2 `ConnectionResult`s: `[connection(sameMetroInterAirport=false),
  connection(sameMetroInterAirport=true)]`.

## S13 — Online connection (same operating carrier, no interline needed)

- P: GA 100 CGK→SIN arr `10:00`; N: GA 200 SIN→NRT dep `11:30`. Both operating GA.
- **Expect** `kind='connection'`, `isInterline=false`, `bagThroughChecked=true`,
  `appliedInterlineId=null`. (Interline gate skipped entirely for same-carrier.)

## S14 — Interline connection, valid (different carriers, agreement exists)

- P: GA 100 CGK→SIN arr `10:00` (operating GA); N: SQ 300 SIN→NRT dep `11:30` (operating SQ).
- Agreement GA→SQ exists, bag_through_checked=true. SIN→SIN II mct=60, gap=90.
- **Expect** `kind='connection'`, `isInterline=true`, `bagThroughChecked=true`,
  `appliedInterlineId=<GA→SQ row>`.

## S15 — No interline agreement (invalid, gate before MCT)

- P: GA 100 CGK→SIN arr `10:00` (GA); N: AF 400 SIN→CDG dep `13:00` (AF). No GA→AF agreement.
- Timing is MCT-legal (gap 180 > 60), but no agreement.
- **Expect** `kind='invalid'`, `reason='NO_INTERLINE'`, `gapMinutes=null` (gate runs before gap
  math), `isInterline=true`, `bagThroughChecked=false`.

## S16 — Interline valid but bags NOT through-checked

- P: NH 10-ish arr NRT (operating NH); N: KL 800 NRT→AMS dep (operating KL). NH→KL agreement exists
  with bag_through_checked=false. NRT→NRT II legal timing.
- **Expect** `kind='connection'`, `isInterline=true`, `bagThroughChecked=false`. (Proves the flag
  is read from the agreement, not hardcoded.)

## S17 — Directional agreement is one-way

- Agreement GA→QR exists but QR→GA does NOT (only GA→QR seeded).
- P: QR ... arr (operating QR); N: GA ... dep (operating GA). Timing legal.
- **Expect** `kind='invalid'`, `reason='NO_INTERLINE'`. (Proves directionality — the GA→QR row
  does not authorize QR→GA.)

## S18 — Interline check uses OPERATING carriers, not marketing

- P is codeshare: marketing NH 5502 but operating GA (the GA 874 flight from S10). N operating SQ.
- Agreement is GA→SQ (operating), NOT NH→SQ.
- **Expect** `kind='connection'`, `isInterline=true`, resolved via GA→SQ. (Proves the resolver
  looks through the codeshare to the operating carrier — bags follow metal.)

---

### Coverage matrix

| Kind / concern        | Covered by            |
| --------------------- | --------------------- |
| connection (online)   | S1, S4, S12, S13      |
| connection (interline)| S14, S16, S18         |
| invalid               | S2, S5, S8, S9, S15, S17 |
| stopover              | S3                    |
| open_jaw              | S6                    |
| transit               | S7                    |
| codeshare             | S10, S18              |
| MCT resolver          | S5, S9, S11           |
| interline gate        | S13–S18               |
| bagThroughChecked     | S13, S14, S16         |
| directionality        | S17                   |
| operating-not-marketing | S18                 |
