# 00 — Overview

> TEMPLATE: this doc answers "what is this, and where does it stop?". Written once at the start,
> amended only by an explicit scope change (which is logged in `CONTEXT.md` with its date and the
> user's own words). Delete every `> TEMPLATE:` line and fill every `{{placeholder}}`.

## Tech stack (this repo, not a fresh scaffold)

This domain is built inside the existing `z-tawafsai` monorepo, alongside the
{{other domains}} domain(s) — nothing here is a new app. `apps/api` (NestJS 11, Fastify,
Drizzle ORM, Postgres 17), `apps/web` (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui,
TanStack Query, next-intl, Better Auth client), `packages/db` (Drizzle schema/migrations),
`packages/shared` (Zod contracts), `packages/auth` (Better Auth config) all already exist and are
reused as-is. Tests are Vitest throughout. IDs are ULIDs via `createId()` from `@repo/db`. Every
user-facing string goes through `useTranslations`, translated into all 6 locales
(en/es/fr/ar/bn/zh). See `AGENTS.md` / `backbone.yml` at the repo root for the full map.

## Problem

> TEMPLATE: 2–5 sentences on what is broken or missing today, in the user's terms, not in
> implementation terms. If you cannot state the problem without naming a table, ask again.

{{problem}}

## Goal

> TEMPLATE: one paragraph. What a user can do at the end that they cannot do now. Find the
> single sentence that will decide a scope argument later — the one that says both what this is
> and where it stops — and put it here.

{{goal}}

## In scope

> TEMPLATE: bullets. Each one is something a reviewer can check off as present or absent.

- {{capability}}
- {{capability}}

## Non-goals (hard)

> TEMPLATE: the wall. State each as a prohibition with an em-dash reason — the reason is what
> lets a later session generalize the rule instead of relitigating the line. This section is the
> most valuable in the whole PRD; a domain without it grows without limit.

- **No {{thing}}.** {{why it is out — the boundary this protects}}
- **No {{thing}}.** {{why}}

## Personas

> TEMPLATE: only the personas that change a decision. Two or three, not a cast list.

- **{{Persona}}:** {{what they do, which routes they reach, what they cannot do}}
- **{{Persona}}:** {{…}}

## Success criteria

> TEMPLATE: numbered, observable, and falsifiable — each names an input change and the visible
> output change it must cause. "Fast" and "intuitive" are not criteria. The last one should tie
> to the golden scenarios in `14-scenarios.md`.

1. {{criterion}}
2. {{criterion}}
3. All golden scenarios S1–S{{n}} pass.

## The {{n}} entities at a glance

> TEMPLATE: one line each — name, what it is, and its key type (natural key or ULID). The full
> column spec lives in `11-data-model.md`; this is the orientation table a new session reads
> first. Drop this section if the domain adds no tables.

| Entity | What it is | Key |
| --- | --- | --- |
| {{Entity}} | {{one line}} | {{natural key / ULID}} |
