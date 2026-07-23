# CONTEXT.md — living state

> Update this at the end of every session. It is the memory between sessions so decisions are
> not re-litigated. It is also **disposable at handoff**: it records how the domain was built,
> and it retires with the rest of this folder at Step 9. Anything here that must govern the code
> afterwards belongs in a test, a scoped `AGENTS.md`, or a comment at the line it explains —
> a build log kept alive past its build only drifts from the code it claims to describe.

> TEMPLATE: the single most important file in the folder — the one every session in this domain
> reads first and writes last. Rules that keep it useful:
>
> - **Newest entry at the top**, dated absolutely (`2026-07-23`), never "yesterday" or "last
>   session".
> - **Log the why, not just the what.** "Field X is now optional" is useless six weeks later;
>   "field X is optional because the product owner reversed the earlier requirement — a row
>   without it now *means* the default case" survives, and stops the next session from
>   re-tightening it.
> - **Quote the user** when a decision came from them, so a later session cannot argue with it.
> - **Record superseded docs explicitly.** When a build invalidates a numbered doc, say which
>   file is now historical record and which is authoritative — do not silently leave both.
> - **Bugs found during verification go here**, especially pre-existing and app-wide ones. That
>   log is how the next domain avoids re-finding them.
> - Never track another domain's state here.

## Current step

**{{YYYY-MM-DD}} — {{one-line headline of what just changed}}.** {{What was done, why, which
packages it touched, what is authoritative afterward.}}

---

{{older entries below, newest first}}

## Entity table ({{n}} entities, {{n}} tables, {{n}} derived)

| # | Entity | Table | Key | Admin CRUD | Notes |
|---|--------|-------|-----|------------|-------|
| 1 | {{Entity}} | `{{table}}` | {{ULID / natural key}} | {{route or —}} | {{…}} |

> TEMPLATE: derived concepts (computed on read, never stored) belong in this table too, with `—`
> in the table column and an explicit "DERIVED, never stored" note. Without that row, a later
> session sees the concept has no column and helpfully adds one — which then drifts from the
> inputs it was supposed to be computed from.

## Confirmed decisions

> TEMPLATE: things that are settled. A new session reads this instead of asking again. Each with
> its reason; add the date when the decision reversed an earlier one.

- Scope: {{…}}
- {{decision}} — {{why}}
- Built inside this monorepo, not a standalone app: tables in `packages/db/src/schema/app.ts`,
  API in `apps/api/src/{{domain}}/`, contracts in `packages/shared`, IDs via `createId()`.
- Gated behind auth by the repo's global `AuthGuard` — no guard code to write.
- Full i18n across all 6 locales (en/es/fr/ar/bn/zh).

## Open questions

> TEMPLATE: anything unanswered that blocks a step. Name the blocked step. Empty is a valid
> state — write "(none blocking)" rather than deleting the section.

- {{question}} — blocks Step {{n}}.

## Progress checklist

- [ ] Step 3 — schema
- [ ] Step 4 — seed
- [ ] Step 5 — {{core logic}}
- [ ] Step 6 — endpoints
- [ ] Step 7 — golden scenarios S1–S{{n}}
- [ ] Step 8 — consistency sweep
- [ ] Step F1–F{{n}} — frontend (if applicable)
- [ ] Final — repo-root quality gates all green

## Definition of done

{{Not met yet. / All steps per `20-steps.md` complete, committed, and quality-gated — with
anything deliberately left out named explicitly here.}}
