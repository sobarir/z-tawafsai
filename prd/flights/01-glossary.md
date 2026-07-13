# 01 — Glossary & Domain Rules

The whole system hangs on using these terms precisely. Claude Code must use these exact words in
code, comments, table names, and API responses.

## The structural hierarchy

| Term        | Definition                                                              | Changes when…                    |
| ----------- | ---------------------------------------------------------------------- | -------------------------------- |
| **Journey** | Full trip, origin → final destination (owned by booking engine).       | new origin/destination pair      |
| **Segment** | One marketing flight number on one aircraft. What a passenger "buys."   | marketing flight number changes  |
| **Leg**     | One takeoff + one landing, no stop in between.                          | any physical stop occurs         |

Containment: **Journey ⊇ Segment ⊇ Leg.** A journey has ≥1 segment; a segment has ≥1 leg.

> In THIS service we own **operating flights + legs + marketing identities + MCT**. We do not own
> Journey/Segment as stored booking rows — but our validation output is journey-shaped, and a
> "segment" maps 1:1 to one of our **marketing flights**.

## Operating vs Marketing (the spine)

- **Operating flight** — the physical reality. One operating carrier, one flight number, one
  aircraft, one route (possibly multi-leg). Stored in `flights` (+ `flight_legs`).
- **Marketing flight** — a sellable/displayable identity mapped onto an operating flight. Stored
  in `flight_marketing`. **Codeshare = many marketing rows → one operating flight.**
- Exactly one marketing row per operating flight has `is_operating_carrier = true` (the carrier's
  own marketing number). Others are codeshare partners.

Example — GA operates GA 874 CGK→NRT; also sold as NH 5502 and KL 4062:

| operating flight | marketing airline | marketing number | is_operating_carrier |
| ---------------- | ----------------- | ---------------- | :------------------: |
| GA 874 (ULID X)  | GA                | 874              | ✅ true              |
| GA 874 (ULID X)  | NH                | 5502             | false                |
| GA 874 (ULID X)  | KL                | 4062             | false                |

## Codeshare vs Interline (two different carriers, two different layers)

Both involve more than one airline, but they sit at different layers — do not conflate them.

- **Codeshare** — about a *single flight's identity*. One physical (operating) flight sold under
  several flight numbers. A marketing-layer fact, per flight. Already modeled: many
  `flight_marketing` rows → one `flights` row.
- **Interline** — about a *connection across two different physical flights operated by two
  different airlines under one ticket*, with through-checked baggage. A connection-layer fact, per
  **carrier-pair**. Governs whether a connection between two operating carriers is permitted at all.

| | Codeshare | Interline |
| --- | --- | --- |
| About | one flight, many numbers | two flights connecting under one ticket |
| Layer | marketing identity (per flight) | connection permission (per carrier-pair) |
| Model | `flight_marketing` → `flights` | `interline_agreements` lookup at validation time |
| Affects | how a flight is displayed/sold | whether a connection is valid + baggage through-check |

**Online vs interline connection:**
- **Online connection** — both segments' **operating** carriers are the same airline. No interline
  agreement needed; always permitted (subject to MCT).
- **Interline connection** — operating carriers differ. Requires a directional interline agreement
  from the *inbound* operating carrier to the *outbound* operating carrier. No agreement ⇒ the
  connection is `invalid` (`NO_INTERLINE`), even if timing is perfect.

> The interline check is on **operating** carriers, not marketing ones — baggage and handling
> follow metal, not the flight number printed on the ticket.

## The four gap types (all DERIVED — never stored as a column)

For any two consecutive flights, look at **(a)** whether airports/cities line up and **(b)** the
size of the time gap.

| Type            | Airports line up? | Gap length             | Notes                                            |
| --------------- | :---------------: | ---------------------- | ------------------------------------------------ |
| **Transit (leg)** | yes (internal)  | very short             | one segment, internal technical stop — a `flight_leg` |
| **Connection**  | yes               | ≥ MCT and ≤ max_conn   | change planes, don't leave airside               |
| **Stopover**    | yes               | > max_conn (e.g. 24h+) | deliberately stay in the city                    |
| **Open-jaw**    | **no**            | n/a (surface gap)      | arrival city ≠ next departure city; pax covers it |
| **Invalid**     | yes               | < MCT                  | illegal — connection too tight                   |

### Decision logic (implement exactly this)

```
Given prev flight P and next flight N (consecutive):

1. Same operating flight, internal stop?           → TRANSIT (leg-level, not a real connection)
2. P.arrival_city != N.departure_city?             → OPEN_JAW   (surface gap; pax-covered)
3. Operating carriers differ AND no interline
   agreement (P.op_carrier → N.op_carrier)?         → INVALID    (NO_INTERLINE)
4. gap = N.departure_time - P.arrival_time         (TIMESTAMPTZ math — always safe)
   ├─ gap < applicable MCT                          → INVALID    (too tight)
   ├─ MCT <= gap <= max_connection_minutes          → CONNECTION
   └─ gap > max_connection_minutes                  → STOPOVER
```

- **online vs interline** — if P and N share the same operating carrier, skip step 3 (online
  connection). Otherwise step 3 requires a directional agreement inbound→outbound.
- **bagThroughChecked** — an online connection is always through-checked. An interline connection
  is through-checked iff the matched agreement's `bag_through_checked` is true. Open-jaw / transit /
  invalid ⇒ `bagThroughChecked = false`.

- **applicable MCT** is resolved from `mct_rules` most-specific-first (see `13-mct-rules.md`).
- **Same-airport vs inter-airport** connection is detected by
  `P.arrival_airport == N.departure_airport` (same airport) vs
  `P.arrival_airport != N.departure_airport AND P.arrival_city == N.departure_city`
  (inter-airport, same metro — e.g. NRT→HND). Both are connections; they just resolve different
  MCT rows. If cities differ entirely, it's an open-jaw, not a connection.

## City grouping

`airports.city_code` groups multi-airport metros: `NRT` and `HND` → `TYO`; `LHR`,`LGW` → `LON`;
`JFK`,`EWR`,`LGA` → `NYC`. Required for open-jaw detection and inter-airport MCT resolution.
