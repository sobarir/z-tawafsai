# PRD template — how to start a new domain

This folder is a **blank skeleton**, not a domain. Nothing here is ever implemented. It exists so
that "build me feature X" turns into a written PRD with a consistent, known shape — instead of a
fresh improvisation each time.

`_template` is deliberately underscore-prefixed so it sorts first and never reads as a real
domain. It is listed in `backbone.yml` under `prd.template`, not under `prd.domains`.

## How an agent uses this

When the user says *"create a new feature `<X>` based on the PRD template"*:

1. **Pick the folder name.** `prd/<domain>/`, kebab-case, naming one concept — the noun a user
   would use, not an implementation detail. Confirm it with the user if ambiguous.
2. **Copy this folder's files** into `prd/<domain>/`, dropping the ones the domain does not need
   (see the file table below), and **delete this README** from the copy.
3. **Run the intake questions** (below) before filling anything in. Do not invent answers —
   unanswered questions belong in `CONTEXT.md`'s *Open questions*, not in a guessed spec.
4. **Fill the docs in order** — `00` → `01` → `11` → `13` → `14` → `15` → `20`, then the `3x`
   frontend docs if the domain has UI. Each doc's own `> TEMPLATE:` blockquotes say what belongs
   there; **strip every `> TEMPLATE:` line and every `{{placeholder}}`** from the copy. A shipped
   PRD contains zero template scaffolding.
5. **Register the domain**: add a row to `prd/README.md`'s Domains table, and an entry to
   `backbone.yml`'s `prd.domains` map. Then run `pnpm check:backbone`.
6. **Stop and get the PRD approved before writing code.** The PRD is the artifact of this
   request; implementation is a separate, later ask.

## Files

| File | Required? | Purpose |
| --- | --- | --- |
| `00-overview.md` | **always** | Goal, in-scope, hard non-goals, personas, success criteria. |
| `01-glossary.md` | if the domain has its own vocabulary | Exact terms + the decision logic behind them. Skip for a domain that reuses existing words. |
| `11-data-model.md` | if the domain touches the DB | Table-by-table Drizzle spec + the schema-generation prompt that kicks off the build. |
| `13-logic.md` | if there is a non-trivial algorithm or API surface | The core computation and the endpoint contract. Rename it to what it actually is (`13-<the-algorithm>.md`). |
| `14-scenarios.md` | if the domain has testable behavior | Numbered golden scenarios (S1…Sn) + a coverage matrix. These are the oracle. |
| `15-seed-data.md` | if the domain needs demo data | Exact, idempotent seed fixtures the scenarios assert against. |
| `20-steps.md` | **always** | Ordered build sessions: opening prompt → review checklist → gate → commit. |
| `30-frontend.md` | if the domain has UI | Routes, component tree, display rules, a11y floor. |
| `31-design.md` | only if the UI deviates from the app's design system | Palette/type/layout direction. **Confirm the deviation with the user first.** |
| `32-frontend-steps.md` | if the domain has UI | Ordered frontend sessions (F1…Fn), same ritual as `20`. |
| `CONTEXT.md` | **always** | Living state: current step, confirmed decisions, entity table, open questions, progress checklist. Read first, updated last, every session. |

Numbering is a grouping convention, not a sequence: `0x` = framing, `1x` = model & behavior,
`2x` = backend build order, `3x` = frontend. Leave gaps — a later `12-` or `16-` doc slots in
without renumbering anything.

## Intake questions (ask before writing)

Answers go into `00-overview.md` and `CONTEXT.md`'s *Confirmed decisions*. Anything unanswered
goes into *Open questions* and blocks the step that depends on it.

1. **The wall** — what is explicitly *not* being built? Push until you get a real prohibition
   ("no payment, ever", "no external API — data is seeded"), not a vague "later". A PRD without
   hard non-goals grows without limit.
2. **Read-only or CRUD?** Search/display only, admin-managed, or both? This decides whether there
   are write endpoints and admin screens at all.
3. **Entities** — what are the nouns, which already exist as reference tables in `packages/db`,
   and which are new? An existing reference table gets an FK; if it is missing a row the domain
   needs, seed that row rather than adding a duplicate free-text column.
4. **Who uses it** — end user, internal ops, or both? Gated behind auth, or public? (Default in
   this repo: gated — the global `AuthGuard` already covers every route.)
5. **UI scope** — none, admin-only, public-facing, or both slots (`@admin` + `@user`)?
6. **Money?** If yes: which currencies, and is FX display-side conversion needed?
7. **Time?** If yes: is each value an absolute instant, or a local wall-clock time plus an
   offset? Decide this before the schema — the two are not convertible after the fact, and
   storing a naive local time breaks every cross-timezone calculation.
8. **Golden scenarios** — what handful of concrete cases, with exact expected outputs, defines
   "correct"? If the user cannot name any, the feature is not specified yet.

## Non-negotiables every new domain inherits

These come from the root `AGENTS.md` and apply without restating them per domain — reference
them, don't re-litigate them:

- Built **inside this monorepo**, never a new app: `packages/db` (schema), `packages/shared`
  (Zod contracts), `apps/api` (all data access), `apps/web` (UI consuming generated hooks).
- IDs are ULIDs via `createId()` from `@repo/db`; a real-world standard code (an ISO or
  industry code the outside world already assigns) may be a natural key instead. Never UUID,
  never serial, never nanoid.
- All timestamps `timestamp({ withTimezone: true })`.
- API shapes live only in `packages/shared`, use `z.iso.datetime()` — never `Date`.
- Every user-facing string via `useTranslations`, translated into all 6 locales
  (en/es/fr/ar/bn/zh).
- Definition of done is the root `AGENTS.md` list: `typecheck`, `lint`, `test`,
  `generate:api` output committed, migration committed, `backbone.yml` updated,
  `check:instructions` passing.
