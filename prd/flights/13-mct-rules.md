# 13 — MCT Rules & Connection Classification

This is the brain of the service. Two pieces: **(A)** the MCT resolver (pick the right rule),
and **(B)** the classifier (turn a gap into a `ConnectionKind`).

## A. MCT resolver — most-specific-first

Given a candidate connection `(prev flight P, next flight N)`:

1. Determine `scope` (`DD`/`DI`/`ID`/`II`) from whether P's arrival and N's departure are domestic
   or international relative to the connection airport's country. (Domestic = both airports of that
   leg share the connection airport's `country_code`.)
2. Query `mct_rules` where `arrival_airport = P.arr_airport` AND
   `departure_airport = N.dep_airport` AND `scope = <scope>`.
3. Among matches, pick the **most specific** by this precedence (higher wins):

   | Rank | arrival_airline | departure_airline | arrival_terminal | departure_terminal |
   | ---- | :-------------: | :---------------: | :--------------: | :----------------: |
   | 4 (highest) | set        | set               | set              | set                |
   | 3    | set             | set               | —                | —                  |
   | 2    | set (one side)  | — or one side     | —                | —                  |
   | 1 (default) | NULL       | NULL              | NULL             | NULL               |

   A rule matches only if each non-NULL field equals the candidate's value; NULL = wildcard.
   Ties broken by most non-NULL fields, then newest `updated_at`.
4. If **no** rule matches (not even a default), the connection is **`invalid`** with reason
   `NO_MCT_RULE` — never silently pass. Seeds must guarantee an airport-pair default exists for
   every real connection point.

> `arrival_airport != departure_airport` in the matched rule means an **inter-airport** connection
> (NRT→HND). Same code on both sides = same-airport. Both are legal connections; they just have
> different rows (inter-airport MCTs are larger).

## A2. Interline resolver — carrier-pair gate

Given the two **operating** carriers (from P and N):

1. If `P.operating_airline === N.operating_airline` → **online** connection. No lookup; permitted;
   `bagThroughChecked = true`; `isInterline = false`.
2. Else look up `interline_agreements` where
   `inbound_airline = P.operating_airline AND outbound_airline = N.operating_airline` (directional).
   - Found → **interline** permitted; `isInterline = true`;
     `bagThroughChecked = agreement.bag_through_checked`; `appliedInterlineId = agreement.id`.
   - Not found → connection is **`invalid`**, reason `NO_INTERLINE`. Do not fall through to MCT.

> Directional: the reverse pair (N→P) is irrelevant here; only inbound→outbound matters. Resolve
> the **operating** carriers via the marketing→operating resolver from Step 6 if you were handed
> marketing flights.

## B. Classifier — gap → ConnectionKind

Implement EXACTLY this order (mirrors `01-glossary.md`):

```ts
function classify(
  P: Flight, N: Flight,
  interline: InterlineResolution,   // from A2: { online, permitted, bagThroughChecked, agreementId }
  rule: MctRule | null,
): ConnectionResult {
  // 1. same operating flight, internal stop → transit (leg-level, not a real connection)
  if (P.id === N.id)
    return { kind: 'transit', gapMinutes: null, bagThroughChecked: false, isInterline: false, ... };

  // 2. cities don't line up → open-jaw (surface gap, pax-covered)
  if (P.destCityCode !== N.originCityCode)
    return { kind: 'open_jaw', gapMinutes: null, bagThroughChecked: false, isInterline: false, ... };

  // 3. interline gate — only bites when operating carriers differ (see A2)
  if (!interline.permitted)
    return { kind: 'invalid', gapMinutes: null, reason: 'NO_INTERLINE',
             isInterline: true, bagThroughChecked: false };

  const gap = minutesBetween(P.arrival_time, N.departure_time); // TIMESTAMPTZ-safe

  // 4a. no rule at all → invalid (NO_MCT_RULE)
  if (!rule)
    return { kind: 'invalid', gapMinutes: gap, reason: 'NO_MCT_RULE',
             isInterline: !interline.online, bagThroughChecked: false };

  // 4b. too tight
  if (gap < rule.mct_minutes)
    return { kind: 'invalid', gapMinutes: gap, reason: 'BELOW_MCT', appliedMctRuleId: rule.id,
             isInterline: !interline.online, bagThroughChecked: false };

  // shared success fields
  const ok = {
    isInterline: !interline.online,
    bagThroughChecked: interline.bagThroughChecked,
    appliedMctRuleId: rule.id,
    appliedInterlineId: interline.agreementId ?? null,
    sameMetroInterAirport: P.arr_airport !== N.dep_airport,
  };

  // 4c. within window → connection
  if (gap <= rule.max_connection_minutes)
    return { kind: 'connection', gapMinutes: gap, ...ok };

  // 4d. beyond window → stopover
  return { kind: 'stopover', gapMinutes: gap, ...ok };
}
```

> Order matters: the interline gate (step 3) runs **before** MCT. A pair with no agreement is
> `NO_INTERLINE` regardless of timing — don't compute or report a gap-based verdict for it.

Notes:
- `sameMetroInterAirport` is `true` when `P.arr_airport !== N.dep_airport` but cities match — i.e.
  the passenger changes airports within a metro (NRT→HND). The larger inter-airport MCT rule
  should already have been resolved in step A, so a tight NRT→HND gap correctly returns `invalid`.
- Negative gap (N departs before P arrives) → `invalid` with reason `NEGATIVE_GAP`. Guard for it.
- All time math on `timestamp with time zone`. Never subtract naive local times.

## Seed rules (minimum viable set — see `15-seed-data.md`)

| arrival | departure | scope | mct_minutes | max_conn | note                         |
| ------- | --------- | ----- | ----------- | -------- | ---------------------------- |
| NRT     | NRT       | II    | 60          | 1440     | same airport, intl→intl      |
| NRT     | NRT       | ID    | 90          | 1440     | intl→domestic (immigration)  |
| NRT     | HND       | II    | 240         | 1440     | **inter-airport, Tokyo metro** |
| SIN     | SIN       | II    | 60          | 1440     | Changi hub                   |
| JFK     | JFK       | II    | 75          | 1440     |                              |
| JFK     | EWR       | II    | 300         | 1440     | **NYC metro airport change** |
| DOH     | DOH       | II    | 60          | 2880     | Qatar stopover-friendly (max 48h) |

## API surface (v1)

- `POST /connections/validate` — body `{ prevFlightId, nextFlightId }` → `ConnectionResult`.
- `POST /connections/validate-chain` — body `{ flightIds: string[] }` → `ConnectionResult[]`
  (classify each consecutive pair; useful for a whole itinerary).
- `GET /mct-rules`, `POST /mct-rules`, `PATCH /mct-rules/:id`, `DELETE /mct-rules/:id` — admin CRUD.
- `GET /interline-agreements`, `POST /interline-agreements`, `DELETE /interline-agreements/:id` —
  admin CRUD for the carrier-pair gate (directional; seed both directions for a symmetric pair).
