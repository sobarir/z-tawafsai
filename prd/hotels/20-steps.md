# 20 — Build Steps (Claude Code session workflow)

Run these as ordered sessions. Each: opening message → work → review checklist →
gate → commit. Update CONTEXT.md at the end of every session.

## Step 3 — Schema-first kickoff

**Opening:** paste the schema-generation prompt from `11-data-model.md`.
**Review checklist:**
- [ ] 8 tables + 2 enums exist, names match the spec.
- [ ] ULID/natural keys only; grep for `uuid` → clean.
- [ ] grep for float money types (`real`, `double`, `numeric` on amounts) → none.
- [ ] every timestamp `withTimezone: true`.
- [ ] season EXCLUDE non-overlap constraint present; btree_gist enabled.
- [ ] partial UNIQUE on `rate_rule` (null room_type) present.
- [ ] `$inferSelect`/`$inferInsert` exported for all 8 tables.
**Gate:** `pnpm db:generate` runs clean; migration applies via `pnpm db:migrate`/`db:push` to
a fresh DB.
**Commit:** `feat(db): unified listing schema (8 tables)`

## Step 4 — Seed

**Opening:** implement `15-seed-data.md` in the existing `packages/db/src/seed.ts`,
idempotent, in a tx.
**Review checklist:**
- [ ] re-running seed leaves row counts unchanged.
- [ ] all FKs resolve; season windows non-overlapping per listing.
- [ ] property rate rules have room_type_id; package rate rules have NULL.
**Gate:** `pnpm db:seed && pnpm db:seed` succeeds twice, counts stable.
**Commit:** `feat(db): idempotent demo seed`

## Step 5 — Resolver + FX

**Opening:** build money/FX helpers and the pure `resolvePrice` per
`13-resolver-and-search.md`. Unit-test helpers first.
**Review checklist:**
- [ ] resolver is pure (no DB access inside).
- [ ] rounding happens once, at display conversion, to currency minor_unit.
- [ ] property multiplies by nights; package does not.
- [ ] FX inverse path works.
**Gate:** helper unit tests green.
**Commit:** `feat(pricing): price resolver + fx conversion`

## Step 6 — Search endpoint

**Opening:** implement `GET /hotels/search` per `13-resolver-and-search.md` in
`apps/api/src/hotels/` (copy `apps/api/src/posts/` shape). Read-only.
**Review checklist:**
- [ ] filters: destination, kind, occupancy, currency, price bounds, sort, page.
- [ ] non-OK listings silently omitted; always 200 unless input malformed.
- [ ] property room-type selection: hint → else cheapest qualifying.
- [ ] price filter applied on CONVERTED price.
- [ ] `@ApiOperation({ operationId })` set on every route.
- [ ] `pnpm generate:api` run from repo root; `git diff` shows `apps/api/openapi.json` +
      `apps/web/src/libs/api/generated/` updated, committed together with the code.
**Gate:** manual smoke: a Jeddah search returns both L1 and L2 priced correctly.
**Commit:** `feat(search): unified property+package search`

## Step 7 — Golden scenarios

**Opening:** implement S1–S12 from `14-scenarios.md` as Vitest.
**Review checklist:**
- [ ] all 12 green; exact integer amounts asserted.
- [ ] each asserts its named resolution outcome.
- [ ] coverage matrix fully hit.
**Gate:** `pnpm test` green.
**Commit:** `test: golden scenarios S1–S12`

## Step 8 — Consistency sweep & hardening

**Opening:** run the sweep below; fix leaks.
- grep `uuid` (expect only "never UUID" docs) → clean.
- grep float money → none.
- confirm no write endpoints exist (search-only wall intact).
- confirm cross-entity invariants asserted (property↔room_type, package↔null room).
- README: how to run migrate/seed/test; API-readiness note for future pricing API.
**Gate:** full test suite green; sweep clean.
**Commit:** `chore: consistency sweep + docs`

## Definition of done

All 8 steps committed, S1–S12 green, sweep clean, CONTEXT.md checklist all
checked. No booking/payment/inventory code anywhere.
