# 20 — Claude Code Workflow (Steps 3–8)

> Steps 1–2 are already done: the PRD is chunked into `prd/flights/*.md` and `CLAUDE.md` sits at
> project root. This guide is the actual sequence of Claude Code sessions. **One step ≈ one
> session.** After each step: run the gates, commit, and tick the box in `CONTEXT.md`.

Every session opens with the same first move:

```
Read CONTEXT.md, then root CLAUDE.md, then the files named in today's step. Do not write
code until you've confirmed the "Current step" line in CONTEXT.md matches what we're doing.
```

---

## Step 3 — Schema-First Kickoff  (do this before anything else)

**Goal:** produce `/src/db/schema.ts` and nothing else. No app code yet.

Opening message:

```
Read CONTEXT.md, 00-overview.md, 01-glossary.md, 11-data-model.md.

Your ONLY task today: generate /src/db/schema.ts (Drizzle) for the 7 tables in 11-data-model.md
(airports, airlines, flights, flight_legs, flight_marketing, mct_rules, interline_agreements).
Connection candidates are DERIVED — do not create a table for them.

Follow the schema generation prompt at the bottom of 11-data-model.md exactly:
- 3 pgEnums first (mct_scope, leg_role, flight_status)
- natural varchar PKs for airports/airlines; varchar(26).$defaultFn(() => ulid()) for the rest
- timestamp({ withTimezone: true }) everywhere; integer() minutes for durations
- every UNIQUE, CHECK, partial index, FK from 11-data-model.md
- $onUpdate(() => new Date()) on every updated_at
- export $inferSelect and $inferInsert types for all 7 tables

Do not write services, controllers, or seeds yet. Stop after schema.ts and show it to me.
```

**Review checklist before confirming:**
- [ ] 3 `pgEnum`s defined; `connection_kind` is NOT a column anywhere.
- [ ] airports/airlines use natural `varchar` PKs; the other 4 use `varchar(26)` ULID.
- [ ] Partial unique index: one `is_operating_carrier = true` per `flight_id`.
- [ ] UNIQUE on `(operating_airline, flight_number, departure_time)` on flights.
- [ ] UNIQUE on `(flight_id, leg_sequence)`; `idx_mct_lookup`; `idx_airports_city_code`.
- [ ] `interline_agreements`: UNIQUE `(inbound_airline, outbound_airline)` + CHECK `inbound <> outbound` + `idx_interline_lookup`.
- [ ] All timestamps `withTimezone: true`. All durations `integer`. No money columns anywhere.
- [ ] `$inferSelect`/`$inferInsert` exported for all 7 tables.

Then: `pnpm db:generate && pnpm db:push`. Update CONTEXT.md → mark all 7 entities confirmed,
set Current step to Step 4.

---

## Step 4 — Reference-data module (airports, airlines)

```
Read CONTEXT.md, 11-data-model.md, 15-seed-data.md.
Build the NestJS modules for airports and airlines: Zod-validated DTOs, CRUD endpoints, Drizzle
repository methods. Then write /src/db/seed.ts (idempotent) seeding the airports + airlines tables
from 15-seed-data.md. Add Vitest tests for CRUD + the city_code index behavior.
```

Gate: `pnpm db:seed` twice (must be idempotent), tests green.

---

## Step 5 — Operating-flight module (flights + legs)

```
Read CONTEXT.md, 01-glossary.md, 11-data-model.md, 14-scenarios.md (S7).
Build the flights + flight_legs module. Enforce the leg invariants (first leg dep = flight origin,
last leg arr = flight dest, contiguous legs) in the service layer with clear errors. A single-leg
flight auto-creates one FULL leg; a multi-leg create validates contiguity. Add seed for NH 10
(2-leg technical stop) and the point-to-point demo flights. Tests: S7 leg structure assertions.
```

Gate: creating NH 10 yields 1 `flights` row + 2 `flight_legs`; invariant violations rejected.

---

## Step 6 — Marketing / codeshare module

```
Read CONTEXT.md, 01-glossary.md (operating vs marketing), 11-data-model.md, 14-scenarios.md (S10).
Build flight_marketing CRUD + a resolver `getOperatingFlightByMarketing(airline, number)`.
Enforce: exactly one is_operating_carrier per flight; that row's airline == flights.operating_airline;
all marketing airlines exist locally (own-metal). Seed GA 874 with NH 5502 + KL 4062 codeshares.
Tests: S10 (marketing resolves to one operating flight; report counts physical flight once).
```

Gate: S10 passes; partial unique index prevents a second operating-carrier marketing row.

---

## Step 7 — MCT rules module

```
Read CONTEXT.md, 13-mct-rules.md, 14-scenarios.md (S11), 15-seed-data.md.
Build mct_rules CRUD + the most-specific-first resolver from 13-mct-rules.md §A. Seed all rules
including the S11 NH-specific pair. Tests: S11 (specific rule beats default), NO_MCT_RULE path.
```

Gate: resolver precedence table honored; S11 green.

---

## Step 7.5 — Interline-agreements module

```
Read CONTEXT.md, 01-glossary.md (codeshare vs interline), 11-data-model.md (Entity 7),
13-mct-rules.md (§A2 resolver), 14-scenarios.md (S13–S18), 15-seed-data.md.
Build the interline_agreements table module: Zod DTOs, CRUD (GET/POST/DELETE), and the directional
resolver resolveInterline(inboundOpCarrier, outboundOpCarrier) → { online, permitted,
bagThroughChecked, agreementId }. Same carrier ⇒ online (permitted, bag=true, no lookup).
Enforce the inbound<>outbound CHECK and the (inbound,outbound) UNIQUE. Seed the agreements from
15-seed-data.md (GA→SQ, SQ→GA, GA→QR, NH→KL bag=false; deliberately NO GA→AF, NO QR→GA).
Tests: resolver returns online for same carrier; permitted+bag flag for GA→SQ; not-permitted for
GA→AF; directionality (GA→QR yes, QR→GA no).
```

Gate: resolver honors directionality + online short-circuit; unique/check constraints enforced.

---

## Step 8 — Connection-validation service

```
Read CONTEXT.md, 01-glossary.md, 13-mct-rules.md (§A2 + §B classifier), 14-scenarios.md (ALL).
Build the classifier exactly as 13-mct-rules.md §B specifies, plus POST /connections/validate and
POST /connections/validate-chain. Wire it to BOTH resolvers: the interline resolver (Step 7.5) and
the MCT resolver (Step 7). Resolve marketing→operating first (Step 6) so the interline gate uses
OPERATING carriers. Order: transit → open_jaw → interline gate → MCT (NO_MCT_RULE / NEGATIVE_GAP /
BELOW_MCT) → connection/stopover. Populate isInterline, bagThroughChecked, appliedInterlineId,
appliedMctRuleId. Then make the ENTIRE golden set S1–S18 pass.
```

Gate (definition of done for v1): **all of S1–S18 green**, plus lint/format/typecheck clean.
Pay special attention to S18 — the interline gate must use the operating carrier, not the codeshare
marketing carrier.

---

## Per-step exit ritual

```
1. pnpm biome check --write . && pnpm typecheck
2. pnpm test           # step's tests + all prior tests still green
3. git add -A && git commit -m "step N: <summary>"
4. Update CONTEXT.md: tick the box, move the "Current step" line.
```
