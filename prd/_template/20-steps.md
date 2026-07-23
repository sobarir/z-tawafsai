# 20 — Build Steps (Claude Code session workflow)

> TEMPLATE: the build order, one step per session. Each step is small enough to finish, review,
> and commit in one sitting. Steps 3+ by convention — steps 1–2 were "write the PRD" and "agree
> the scope", already done by the time this file is read.
>
> Keep the four-part shape for every step: **Opening** (what to paste/do) → **Review checklist**
> (what the agent verifies before claiming done) → **Gate** (the command that must pass) →
> **Commit** (the message). A step with no gate is a step that will be reported done while broken.

## Step 3 — Schema-first kickoff

**Opening:** paste the schema-generation prompt from `11-data-model.md`.
**Review checklist:**
- [ ] {{n}} tables + {{m}} enums exist, names match the spec.
- [ ] ULID / natural keys only; grep for `uuid` → clean.
- [ ] no float money types (`real`, `double`, `numeric` on amounts).
- [ ] every timestamp `withTimezone: true`.
- [ ] `$inferSelect` / `$inferInsert` exported for every table.
- [ ] `11-data-model.md` matches what was actually built.
**Gate:** `pnpm db:generate` clean; migration applies to a fresh DB via `pnpm db:migrate`.
**Commit:** `feat(db): {{domain}} schema ({{n}} tables)`

## Step 4 — Seed

**Opening:** implement `15-seed-data.md` in `packages/db/src/seed.ts`, idempotent, in a tx.
**Review checklist:**
- [ ] re-running the seed leaves row counts unchanged.
- [ ] all FKs resolve; no orphan fixtures.
- [ ] date windows cover the ranges other domains' seeds use.
**Gate:** `pnpm db:seed && pnpm db:seed` succeeds twice, counts stable.
**Commit:** `feat(db): idempotent {{domain}} seed`

## Step 5 — {{Core logic}}

**Opening:** build the helpers and the pure `{{fn}}` per `13-logic.md`. Unit-test helpers first.
**Review checklist:**
- [ ] the core function is pure (no DB access inside).
- [ ] {{domain-specific invariant}}.
**Gate:** helper unit tests green.
**Commit:** `feat({{domain}}): {{core logic}}`

## Step 6 — Endpoints

**Opening:** implement the routes in `13-logic.md` under `apps/api/src/{{domain}}/`, copying the
`apps/api/src/posts/` shape. Contracts go in `packages/shared` first.
**Review checklist:**
- [ ] every route has `@ApiOperation({ operationId })`.
- [ ] validation matches `13-logic.md` (rejected vs. legitimately empty).
- [ ] `pnpm generate:api` run from the repo root; `apps/api/openapi.json` + the generated web
      hooks are updated and committed **with** the code.
**Gate:** manual smoke — {{a concrete request and its expected response}}.
**Commit:** `feat({{domain}}): {{endpoints}}`

## Step 7 — Golden scenarios

**Opening:** implement S1–S{{n}} from `14-scenarios.md` as Vitest.
**Review checklist:**
- [ ] all {{n}} green; exact values asserted.
- [ ] coverage matrix fully hit.
**Gate:** `pnpm test` green.
**Commit:** `test({{domain}}): golden scenarios S1–S{{n}}`

## Step 8 — Consistency sweep & hardening

**Opening:** run the sweep; fix leaks rather than suppressing them.
- grep `uuid` → clean; grep float money types → none.
- confirm the `00-overview.md` non-goals hold — no code exists for anything on that list.
- confirm cross-entity invariants from `11-data-model.md` are asserted somewhere.
**Gate:** full suite green; `pnpm typecheck && pnpm lint && pnpm test && pnpm check:dupes &&
pnpm check:backbone && pnpm check:instructions`.
**Commit:** `chore({{domain}}): consistency sweep + docs`

## Per-step exit ritual

1. Run the step's gate. A red gate means the step is not done — do not move on.
2. Update `CONTEXT.md`: tick the checklist, log decisions made and why, list new open questions.
3. Commit with the step's message. One step, one commit.

## Definition of done

All steps committed, S1–S{{n}} green, sweep clean, `CONTEXT.md` checklist fully ticked, and the
root `AGENTS.md` definition-of-done list satisfied (`typecheck`, `lint`, `test`, generated API
output committed, migration committed, `backbone.yml` updated).
