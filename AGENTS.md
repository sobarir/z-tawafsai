# Agent Guide (root)

pnpm + Turborepo monorepo. Next.js frontend, NestJS (Fastify) backend, Postgres via Drizzle, Better Auth. API contracts flow Zod → OpenAPI → Orval.

> One PRD per domain under `/prd/<domain>/`. Read `/prd/README.md` first, then the active domain's `CONTEXT.md`, every session. That index is the mode switch: a domain listed there is **under construction** and its PRD is authoritative — follow it. A domain not listed has **shipped**; its PRD was retired on purpose and the code, its comments, and its tests are the source of truth. An empty table means every domain has shipped, not that documentation is missing.

## Initialization

1. Claude Code: run `/bootstrap` first. Other agents: follow `.claude/commands/bootstrap.md` manually. It loads the map, checks repo state, and reports a mental model before any change.
2. `backbone.yml` (repo root) is the single source of truth for topology: paths, conventions, boundaries, generated artifacts, and relationships.
3. Never run `find`, `grep`, `ls`, or glob to locate project files before reading `backbone.yml` — exploration re-derives what the map already provides and pollutes context. Search is for what a map cannot answer: symbol usages, code content.
4. Load the scoped AGENTS.md for the area you are changing (routing table below) — and nothing else.

## Scoped context

| Task touches | Load | Skip (and why) |
| --- | --- | --- |
| `apps/web/**` — UI, pages, hooks, i18n, styles | `apps/web/AGENTS.md` | API source — endpoint shapes live in `apps/api/openapi.json` and the generated hooks; reading NestJS code wastes context |
| `apps/api/**` — endpoints, guards, services | `apps/api/AGENTS.md` | Web components — the contract lives in `packages/shared`, not React code |
| `packages/db/**` — schema, migrations | `packages/db/AGENTS.md` | Both apps, unless wiring a feature end to end |
| `packages/shared/**` — API contracts | `packages/shared/AGENTS.md` | — (changes fan out; its file has the loop) |
| `packages/auth/**` — Better Auth config | `packages/auth/AGENTS.md` | Web auth UI components |

Full-stack feature = backend first (`shared` → `api`), then `pnpm generate:api`, then frontend consumes generated hooks. The `add-endpoint` skill (`.claude/skills/add-endpoint/`) packages this loop.

## Structure

Five workspaces: `apps/web` (Next.js UI), `apps/api` (NestJS/Fastify, owns Better Auth + all data access), `packages/db` (Drizzle schema + migrations), `packages/auth` (Better Auth config), `packages/shared` (Zod API contracts). Exact paths, key files, and relationship chains: `backbone.yml` — do not re-discover them.

## Commands

Run from the repo root:

- `pnpm dev` — web :3000, api :3001, Swagger :3001/docs
- `pnpm generate:api` — OpenAPI spec → Orval hooks; required after any contract change
- `pnpm typecheck && pnpm lint && pnpm test` — quality gates
- `pnpm db:generate | db:migrate | db:push | db:studio` — Drizzle workflows
- `pnpm check:backbone && pnpm check:instructions && pnpm check:dupes` — governance + DRY gates (also in pre-commit and CI)
Local Postgres 17 runs directly at `localhost:5432` (not via Docker) — connect straight away, don't check for the `docker` CLI or run `docker compose`.

Local env: `cp .env.example .env`, then set `BETTER_AUTH_SECRET`.

## Boundaries

- Never edit `apps/web/src/libs/api/generated/`, `apps/api/openapi.json`, `packages/db/drizzle/`, or `pnpm-lock.yaml` — generated output; hand edits are silently destroyed by the next `pnpm generate:api` / `db:generate` / `install`. A PreToolUse hook blocks these writes in Claude Code.
- Never use npm or yarn — `workspace:*` deps and the lockfile only resolve with pnpm; mixing managers corrupts `node_modules`.
- Never give `apps/web` database access or data API routes — the API is the single data owner; a second path forks validation and auth.
- Never generate IDs with uuid, serial, or nanoid — every ID is a ULID from `createId()` in `@repo/db`, keeping keys time-sortable and index-friendly.
- Never define API shapes outside `packages/shared`, and never use `Date` in them — `z.iso.datetime()` describes the JSON wire format; `Date` breaks OpenAPI generation.
- Never add routes under `/api/auth/*` — Better Auth owns that path; collisions shadow auth endpoints.
- Never reintroduce ESLint or Prettier — Biome replaces both; two formatters fight over the same files.

## Coding principles

The mechanical layer is enforced (Biome, `pnpm check:dupes` DRY gate, complexity warnings). These are the judgment calls tools cannot make:

- DRY by the rule of three — extract shared logic at the third occurrence; two copies are fine, a third means the next bug fix will miss one. `pnpm check:dupes` fails CI above 2% duplication.
- Never abstract at the first duplication — a premature abstraction couples unrelated call sites and is harder to unwind than a copy (avoid hasty abstractions).
- Reuse before writing: check `packages/shared` (contracts), `@repo/db` (ids, client), `src/libs/utils.ts` (web), and the reference feature (`apps/api/src/posts/`) before creating a new helper — a parallel helper in a second package is a cross-package DRY violation.
- Implement what the task needs, not what it might need (YAGNI) — speculative flexibility is unread code that still has to be maintained.
- One responsibility per function — a service method that queries, maps, and formats belongs split; Biome's cognitive-complexity warning (>15) marks where.
- Prefer early returns over nested conditionals, pure functions over stateful helpers — both shrink the surface a reviewer (human or agent) must hold in mind.
- Fix errors and warnings at their source — make every `pnpm typecheck` error and every `pnpm lint` / Biome warning go away by correcting the code, never by silencing it with `biome-ignore`, `as any`, `@ts-ignore`, or a disable comment. Suppress only when a real fix is impossible, and then leave a comment naming the reason — a hidden warning masks the next real bug.

## Definition of done

1. `pnpm typecheck` — clean.
2. `pnpm lint` — zero errors and no new warnings; fix them at the source, do not suppress (see Coding principles).
3. `pnpm test` — for the affected app.
4. Contract changed? `pnpm generate:api` ran and its output is committed — CI fails on drift.
5. Schema changed? Migration from `pnpm db:generate` is committed.
6. Structure or conventions changed? `backbone.yml` updated — `pnpm check:backbone` fails on paths that do not resolve.
7. Instruction files changed? `pnpm check:instructions` passes — heading depth, budgets, and prohibition rationale are enforced.

## What this is

A multi-domain platform. `/prd/README.md` indexes every domain and is the only place that knows
which exist; each domain owns its scope, non-goals, and live status in its own
`prd/<domain>/00-overview.md` and `prd/<domain>/CONTEXT.md`. Read those two before touching a
domain — never infer a domain's boundaries from its code, since the non-goals are precisely what
the code does not contain. New domain: start from `prd/_template/`.

## Database conventions (STRICT — enforced in review, repo-wide across all domains)

An entity the outside world already assigns a standard code to (an ISO or industry code) uses that
code as its natural key — a fixed-width `varchar`, no surrogate id. Every other ID is a ULID via
`createId()` — never UUID, never auto-increment, keeps keys time-sortable. All timestamps are
`timestamp({ withTimezone: true })` — a naive local time breaks every cross-timezone calculation,
and the breakage appears only for users in other zones. A value computed from other columns is
derived on read, never stored — a cached copy drifts from its inputs, and nothing fails loudly
when it does. Per-domain entity and column reference: `prd/<domain>/11-data-model.md`.

## Domain vocabulary

Each domain defines its own terms in its own `prd/<domain>/01-glossary.md`, along with the
decision logic behind them. Read it before naming anything in that domain — never reuse a term
across domains on the assumption it means the same thing, and never collapse two terms a glossary
deliberately separates; that separation is usually load-bearing for the whole model.