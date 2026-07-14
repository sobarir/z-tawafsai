# 00 — Overview

## Tech stack (this repo, not a fresh scaffold)

This domain is built inside the existing `z-tawafsai` monorepo, alongside the flights domain
— nothing here is a new app. `apps/api` (NestJS 11, Fastify, Drizzle ORM, Postgres 17),
`apps/web` (Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, TanStack Query, next-intl,
Better Auth client), `packages/db` (Drizzle schema/migrations), `packages/shared` (Zod
contracts), `packages/auth` (Better Auth config) all already exist and are reused as-is.
Tests are Vitest throughout. IDs are ULIDs via `createId()` from `@repo/db` — never a bare
`ulid()` call, never UUID. Every user-facing string goes through `useTranslations`,
translated into all 6 existing locales (en/es/fr/ar/bn/zh) — same rule flights follows,
enforced by `apps/web/AGENTS.md`. See `AGENTS.md`/`backbone.yml` at the repo root for the
full map.

## Goal

A read-only search service. A user submits a destination, a date range, an
occupancy, and a display currency. The service returns a single ranked list
mixing **properties** and **packages**, each row carrying a **price resolved for
those exact inputs** in the requested currency. Booking.com-simplified: the part
where you find something and see what it costs, and nothing after that.

## In scope

- Unified catalog of properties and packages behind one `listing` spine.
- Search with filters: destination, date range, occupancy, currency,
  kind (property | package | both), price bounds, sort.
- Price resolution:
  - **Property:** nightly rate × number of nights, chosen by season +
    occupancy band + room type.
  - **Package:** season total, chosen by season + occupancy band.
- **Multi-currency:** each rate rule stores a native currency; results convert
  to the requested display currency via `fx_rate`.
- **Seasonal/tiered:** the date range selects a season, which selects the rate.
- **Per-occupancy:** occupancy selects the price band.
- Idempotent seed data for a demo dataset.

## Non-goals (hard)

- **No booking, cart, hold, or payment.** Ever. This is the wall.
- **No inventory / availability decrement.** A price is shown whether or not
  "rooms are left" — availability is not modeled.
- **No external pricing API.** Prices are seeded. The schema is API-*ready*
  (native currency per rate) but no integration exists.
- No reviews/ratings. No user profiles beyond the existing Better Auth session. No
  images/media pipeline (a single `hero_image_url` string is the ceiling).
- No email/notifications.
- **No auth to build.** This repo's global `AuthGuard`/Better Auth session is already wired
  on every route; hotel search is gated by default (no guard code to write), same as flights.

## Personas

- **Traveler (end user):** signs in like any dashboard user, then searches, compares, and
  sees prices. Search is a gated page under both `@admin` and `@user` (same permission-slot
  pattern as flights' `/search`) — not a public, sign-in-free page.
- **Ops/content (internal):** owns the seed data; not a live admin UI in this
  scope — they edit seed files.
- **Downstream integrator (future):** will later attach a real pricing API and a
  booking service. This PRD's job is to not make that painful.

## Success criteria

1. A single search request returns both properties and packages, correctly
   priced for the given dates/occupancy/currency, in one ranked list.
2. Changing the date range across a season boundary changes the resolved price.
3. Changing occupancy changes which band applies and thus the price.
4. Changing display currency converts every row consistently via FX.
5. All golden scenarios S1–S12 pass. No floats in money anywhere. No UUIDs.
