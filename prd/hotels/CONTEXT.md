# CONTEXT.md — living state

> Update this at the end of every session. It is the memory between sessions so
> decisions are not re-litigated.

## Current step

**Search (Steps 3–8 backend, F1–F5 frontend) is done, browser-verified, and
committed.** A second build pass then added **full admin CRUD for the
catalog** (all 7 manageable entities: currency, fx_rate, property, package,
room_type, season, rate_rule) at explicit user request — "I've checked the
hotel feature is just for searching... I need to also be able to manage all
the data for hotel feature." This mirrors flights' Schedule Admin exactly:
`apps/api/src/hotel-{currencies,fx-rates,properties,packages,room-types,
seasons,rate-rules}/` (controller/service/dto/module each), 7 matching
`apps/web/src/features/hotel-*` admin screens under a new "Catalog Admin"
sidebar section (`(protected)/@admin/catalog/*`, admin-only — no `@user`
counterpart, matching `schedule/*` precedent), full `catalog` i18n namespace
across all 6 locales. `EntityDataTable`/`useCrudFeedback` were generalized
with a `namespace: 'schedule' | 'catalog'` parameter to serve both sections.

**Found and fixed a real, pre-existing, app-wide bug during this pass**: 
`apps/api/src/main.ts`'s `app.enableCors()` never set `methods`, and
`@fastify/cors` defaults to `GET,HEAD,POST` only — every PATCH/DELETE
endpoint in the *entire app* (not just hotels) silently failed in the browser
after a passing OPTIONS preflight. Fixed with an explicit `methods` array.
This had been broken for every existing admin screen (airports, airlines,
flights, mct-rules, interline-agreements, flight-marketing) the whole time;
none of it was hotels-specific.

**`pnpm check:dupes` went over threshold (3.28%, gate is 2.0%)** once the 7
new admin screens landed — they (and 5 pre-existing schedule-admin screens)
shared two near-identical blocks: the create/update/delete `useMutation`
wiring, and the Dialog/ConfirmDialog JSX shell. Fixed by extracting shared
primitives and applying them to **all 13** admin screens (not just the 7 new
ones — partial extraction wouldn't have cleared the gate, and the pattern
was already past the rule-of-three before this session):
`crudMutationOptions()` in `use-crud-feedback.ts` (collapses the 3x
`{ onSuccess: onSuccess(key, after), onError }` boilerplate into one call),
`EntityFormDialog` + `EntityDeleteConfirm` in `components/shared/` (collapse
the Dialog/ConfirmDialog shells), and `actionsColumn()` in
`components/shared/actions-column.tsx` (collapses the repeated
`RowActionsCell` actions-column `cell` definition across every `columns.tsx`
except `flights` (has an extra "view" action) and
`interline-agreements` (delete-only), which keep bespoke `RowActionsCell`
usage since their shape doesn't match the plain edit+delete pattern.
Duplication dropped to 1.97%, under gate.

All repo-root quality gates are green again (`typecheck`, `lint`, `test`
94+127, `check:dupes` 1.97%, `check:backbone`, `check:instructions`). This
Catalog Admin work is **not yet committed** — next session (or later in this
one) should review the diff and commit, per the repo's "only commit when
asked" rule.

---

Below this line: the original search-feature build log (Steps 3–8, F1–F5),
committed and unchanged since.

Backend: all 8 tables + 2 enums live in
`packages/db/src/schema/app.ts`, migration `0003_powerful_killer_shrike.sql` +
a hand-written custom migration `0004_hotels_season_no_overlap.sql` (Drizzle
has no schema-builder API for Postgres `EXCLUDE` constraints — this is the
`drizzle-kit generate --custom` escape hatch, not a hand-edit of generated
output). Seed data (3 currencies, 3 fx rates, L1/L2/L3 listings) is in
`packages/db/src/seed.ts`, verified idempotent (two `pnpm db:seed` runs,
stable row counts). `apps/api/src/hotels/` has `money.ts`/`resolver.ts` (pure,
unit-tested), `hotels.service.ts`/`controller.ts`/`dto.ts`/`module.ts`, all
12 golden scenarios green in `hotels.service.spec.ts` against live Postgres,
plus a `hotels-invariants.spec.ts` for the cross-entity checks (94/94 tests
green, typecheck/lint clean). Contracts added to `packages/shared/src/index.ts`
(`hotelSearchQuerySchema`, `hotelSearchResultSchema`, etc.), `pnpm generate:api`
run and committed-ready (`apps/api/openapi.json` + generated web hooks).

Frontend: `apps/web/src/features/hotel-search/` (form, results, refine rail,
orchestrator, page-content wrapper), pages at both
`(protected)/@admin/hotels/page.tsx` and `@user/hotels/page.tsx`, tokens in
`globals.css` (`.hotel-search-theme`, `.hs-mizan`, `.hs-card`, `.hs-reveal`),
fonts added to `apps/web/src/app/fonts.ts` (Amiri + Plus Jakarta Sans), i18n
`hotelSearch` keys added to all 6 locale files. **Found and fixed a real bug
during browser verification**: the search form and refine rail originally
committed every keystroke straight to the URL (matching the "URL is the
state" requirement too literally), which re-rendered the Server Component
mid-type and clobbered in-progress input — fixed by buffering form/price-bound
edits in local component state and only navigating on Search-click / blur.
Verified end-to-end with a real Playwright script (registered a user, ran a
Jeddah search — 2 results, property showing `SAR 400.00 × 3` → `SAR 1,200.00`,
package showing a flat `SAR 6,750.00` with `$1,800.00 · converted` beneath, no
per-night line; a Madinah search — 1 result, `Madinah Central Inn`; URL
correctly carried all query params on both). One hydration warning appeared
(`caret-color: transparent` injected onto inputs) — confirmed pre-existing/
environmental by reproducing it against the *unmodified* flights `/search`
page too, not something this change introduced.

**Step F4** (`hotels/[id]` detail page, `PriceBreakdown`, mailto stub CTA):
since there's no dedicated get-by-id endpoint (matches the PRD's actual API
surface — only `GET /hotels/search` was ever defined), the detail route
carries the same search inputs (destination/checkIn/checkOut/occupancy/
currency) as query params from the "View details" link and re-runs
`useSearchHotels`, finding the matching row by `listingId` client-side. A
missing/excluded listing (bad id, or NO_SEASON/NO_BAND for those exact dates)
shows a directive not-found message, never a crash — verified with a garbage
ULID in the URL. `PriceBreakdown` mirrors the API's actual `breakdown` shape
exactly (no season/band labels — the contract never carried them, so this
renders what's really returned rather than an aspirational richer shape).
"Request this" is a genuine `mailto:` to `siteConfig.contact.supportEmail`,
never a POST.

**Step F5** (motion/a11y/responsive): reduced-motion verified with
`page.emulateMedia({reducedMotion:'reduce'})` — `.hs-reveal` cards render at
`opacity:1`/`animationName:none` immediately, confirming the CSS's structural
guarantee (the fade-rise keyframe only exists inside
`@media (prefers-reduced-motion: no-preference)`, so there's no "turn off
animation" branch to get wrong — reduced-motion is the unstyled default).
Mobile verified at 360px width — no horizontal overflow; the refine rail
simply stacks above the results in a single column rather than the design
brief's bottom-sheet pattern (a deliberate scope simplification for this
build, not a bug — noting it explicitly here so it doesn't get "fixed" by
accident later without a decision to build the bottom sheet). Repo-wide a11y
lint (Biome) found zero new warnings across any hotel-search file.

**Two real bugs found and fixed during browser verification** (both are why
this took actual browser-driving, not just typecheck/tests):
1. The search form and refine rail originally committed every keystroke
   straight to the URL (over-literal reading of "URL is the state"), which
   re-rendered the Server Component mid-type and clobbered in-progress
   input — fixed by buffering edits in local component state, committing on
   Search-click / blur only.
2. The shadcn `Button`'s default variant sets its background via a
   `.btn-primary-gradient` CSS class that uses `!important`, so the inline
   `style={{backgroundColor: 'var(--hs-haram-green)'}}` silently lost —
   fixed with a dedicated `.hs-cta` class (also `!important`) instead of
   inline styles for the two haram-green CTAs.
A third bug (a copy duplication — "SAR 400.00 × 3 3 nights", double-counting
the night count because `t('durationNights', {count})` already embeds the
number) was caught the same way and fixed in `price-breakdown.tsx`.

All repo-root quality gates green: `pnpm typecheck` (5/5 packages),
`pnpm lint` (zero new warnings — the ~34 that show are 100% pre-existing,
none touch any hotel file), `pnpm test` (94 API + 127 web, all passing),
`pnpm check:dupes` (1.57% repo-wide, under the 2% gate — one 2-copy clone
exists between `hotel-detail.tsx` and `hotel-search-results.tsx`'s card
header block, left alone per the rule-of-three: two copies don't warrant
extraction yet), `pnpm check:backbone` (90 paths verified).

## Entity table (8 entities: 8 tables, 0 derived)

| # | Entity              | Table                 | Key            | Admin CRUD                            | Notes |
|---|---------------------|-----------------------|----------------|----------------------------------------|-------|
| 1 | Listing             | `listing`             | ULID           | via Property/Package (1:1, no own screen) | Spine. `kind` ∈ {property, package}. Search operates here. |
| 2 | Property            | `property`            | property code  | `catalog/properties` | 1:1 with a `kind=property` listing. |
| 3 | Package             | `package`             | package code   | `catalog/packages` | 1:1 with a `kind=package` listing. |
| 4 | Room Type           | `room_type`           | ULID           | `catalog/room-types` | Child of property. Occupancy capacity lives here. |
| 5 | Season              | `season`              | ULID           | `catalog/seasons` | Named date window scoped to a listing. |
| 6 | Rate Rule           | `rate_rule`           | ULID           | `catalog/rate-rules` | (listing, season, occupancy band) → price in a currency. |
| 7 | Currency            | `currency`            | ISO-4217 code  | `catalog/currencies` | Reference table. |
| 8 | FX Rate             | `fx_rate`             | ULID           | `catalog/fx-rates` | (base, quote) → rate. For display conversion only. |

All 7 manageable entities (Listing has no standalone screen — it's created/edited as part of
Property or Package) have full create/edit/delete admin screens under
`(protected)/@admin/catalog/*`, added in the Catalog Admin build pass above.

## Confirmed decisions

- Scope: **search-only**, both properties and packages, one unified result set.
- Pricing source: **static, seeded in our DB**. No external API.
- Pricing behaviors required day one: **date-range/nightly, per-occupancy,
  seasonal/tiered, multi-currency**. All four.
- Money = integer minor units + ISO currency. ULID/natural keys, never UUID.
- Property price = **nightly × nights**. Package price = **season total**.
- FX is display-side conversion only; rate rules store a native currency each.
- Frontend: **Next.js 16 App Router** (existing `apps/web`, no scaffold), read-only client
  over `GET /hotels/search` via the generated `useSearchHotels()` hook, URL = state, all
  money math server-side. Visual direction: **umrah/pilgrimage-
  grounded** (limestone + haram-green + gold hairline; terracotta banned).
  Signature = the "mizan" price-line. See 30/31/32.
- **Built inside this monorepo, not a standalone app**: DB tables go in the existing
  `packages/db/src/schema/app.ts` (copy the `post` pattern); API is
  `apps/api/src/hotels/` (copy `apps/api/src/posts/`); contracts are Zod schemas in the
  existing `packages/shared/src/index.ts`, reusing `currencyCodeSchema`/`ulidSchema`; IDs are
  `createId()` from `@repo/db` (never a bare `ulid()`, never UUID).
- **Gated behind auth, like flights** — search lives under both
  `(protected)/@admin/hotels` and `@user/hotels` (same permission-slot pattern flights uses),
  not a public sign-in-free page. No auth guard code to write — the repo's global `AuthGuard`
  covers it by default.
- **Full i18n, like flights** — every user-facing string via `useTranslations`, translated
  into all 6 locales (en/es/fr/ar/bn/zh).
- Money is **integer minor units + currency**, intentionally stricter than flights' looser
  `numeric(10,2)` price column — rationale: FX conversion math needs to avoid float/decimal
  rounding drift that a single-currency domain (flights) never had to worry about.

## Open questions

- (none blocking — fill in as they arise)

## Progress checklist

- [x] Step 3 — schema-first kickoff (all 8 tables + enums + constraints)
- [x] Step 4 — seed spec implemented, idempotent
- [x] Step 5 — price resolver (nightly + total), FX conversion
- [x] Step 6 — search endpoint (filter, unified rank, resolved price)
- [x] Step 7 — golden Vitest scenarios S1–S12 green
- [x] Step 8 — consistency sweep + hardening
- [x] Step F1 — hotel-search feature folder + design tokens (no terracotta)
- [x] Step F2 — search form + URL-as-state (browser-verified)
- [x] Step F3 — results + property/package cards (`@admin`/`@user` gated pages) (browser-verified)
- [x] Step F4 — refine rail + empty/error states + detail page (browser-verified, incl. not-found case)
- [x] Step F5 — mizan price signature + motion/a11y/responsive verification (browser-verified)
- [x] Final — repo-root quality gates (`typecheck`/`lint`/`test`/`check:dupes`/`check:backbone`) all green
- [x] Catalog Admin — backend CRUD modules for all 7 manageable entities
- [x] Catalog Admin — frontend admin screens, routes, sidebar nav, i18n (6 locales)
- [x] Catalog Admin — browser-verified CRUD round-trip (create/edit/delete)
- [x] Catalog Admin — app-wide CORS PATCH/DELETE bug found and fixed
- [x] Catalog Admin — `check:dupes` regression (3.28%) fixed via shared extraction (1.97%)
- [x] Catalog Admin — full quality gates green

## Definition of done: met

All backend steps (3–8) and frontend steps (F1–F5) per `20-steps.md` /
`32-frontend-steps.md` are complete and committed. The Catalog Admin build
pass (full CRUD for all 7 manageable entities) is also complete and
quality-gated, but **not yet committed** — next step is to review that diff
and commit it, then decide whether to open a PR.
