# 00 — Overview

## Problem

Downstream systems (a booking engine, an ops dashboard, a schedule-display API) all need one
trustworthy answer to: *"What flights exist, who really operates them, how are they sold, and
which pairs of flights form a legal connection?"* Today that logic is scattered and inconsistent —
codeshare display is wrong, technical stops are mismodeled as separate flights, and connection
validity is guessed rather than governed by rules.

This service is the **single system of record** for flight schedule structure and connection
legality. It does one thing well and exposes clean data + a validation API.

## Goals (v1)

1. **Model operating flights precisely** — one physical flight = one operating carrier + one
   flight number + one aircraft, with support for **multi-leg** flights (technical stops).
2. **Model codeshare correctly** — many marketing identities mapped onto one operating flight,
   own-metal only. Every marketing row resolves to exactly one operating flight.
3. **Govern connections with MCT rules** — a rules table matched most-specific-first, supporting
   same-airport and inter-airport (multi-airport metro) connections.
4. **Classify any gap between two flights** — connection / stopover / transit(leg) / open-jaw /
   invalid — as a *derived* result computed from city match, time gap, and journey boundaries.
5. **Gate connections by interline agreement** — a directional carrier-pair check (on operating
   carriers) that must pass before a cross-carrier connection is valid, plus a baggage
   through-check flag on the result.
6. **Expose a clean read + validation API** consumable by a downstream booking engine.
7. **(v1.1) Support price-aware flight search** — a single flat price + currency per flight,
   admin-managed and seeded, so a signed-in user can search by origin/destination/date and see
   results sorted by price, OTA-results-page style. Read-only: no booking, PNR, payment, or seat
   selection — see the amended Non-Goals below. Added 2026-07-13 at explicit user request; this
   scope change was flagged against the original Non-Goals before being adopted.

## Non-Goals (explicitly OUT of scope for v1)

- ❌ Booking / reservation flow — PNRs, payment, seat selection, ticketing. **Read-only flight
  *search* with price display is IN scope as of v1.1 (Goal 7)** — searching is not booking; no
  reservation record is ever created.
- ❌ Fare classes, fare construction, dynamic/multi-class pricing, promotions or discounts. **A
  single flat price + currency per flight is IN scope as of v1.1 (Goal 7)** — admin-managed and
  seeded, used only for search display/sorting. This is not a fare engine.
- ❌ PNRs, passengers, ticketing, loyalty/mileage.
- ❌ Seat inventory / availability / booking classes.
- ❌ External GDS/NDC integration (Amadeus, Sabre). Codeshare partners are local rows.
- ❌ Real-time operational status (delays, cancellations, gate changes).
- ❌ Fare-based stopover pricing. We classify a stopover; we do not price it.
- ❌ Interline *scope* detail — fare/segment-type applicability, effective/expiry dates, prorate
   agreements. v1 interline is a simple directional existence gate + a bag-through-check flag only.

> If a task drifts toward any ❌ item, STOP and flag it. These are hard boundaries.

## Personas

- **Schedule Loader (internal ops).** Enters/updates operating flights, legs, and codeshare mappings.
- **MCT Administrator (internal ops).** Maintains connection-time rules per airport/metro.
- **Downstream Consumer (booking engine / display API).** Calls read + `POST /connections/validate`.

## Success criteria

- Given two flights, the service returns the correct classification (connection / stopover /
  open-jaw / invalid-too-tight / transit-leg) 100% of the time on the golden test set
  (`14-scenarios.md`).
- A codeshare flight resolves to exactly one operating carrier, and reports built on operating
  flights never double-count a physical flight sold under N marketing numbers.
- A multi-leg flight (e.g. one flight number, one refuel stop) is stored as **one** segment with
  **two** legs — never as two flights.
- Inter-airport connections (NRT→HND) are validated against a distinct, larger MCT than
  same-airport connections.

## The 7 entities at a glance

```
airports ──┐            ┌── flight_marketing (N marketing → 1 operating)  ← codeshare
airlines ──┼── flights ─┤
           │            └── flight_legs (1 operating → N legs)            ← technical stops
           │
mct_rules ─┤  (rules table, matched at validation time — not FK-linked to a flight)
           │
interline_agreements ─┘  (carrier-pair gate, matched on OPERATING carriers at validation time)

connection_candidates — DERIVED (computed by the validation service; optional cache)
```

**Codeshare vs interline** are different layers: codeshare = one flight's many marketing identities
(`flight_marketing`); interline = permission to connect two carriers' flights under one ticket
(`interline_agreements`). See `01-glossary.md`.
