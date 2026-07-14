# CONTEXT.md — living state

> Update this at the end of every session. It is the memory between sessions so
> decisions are not re-litigated.

## Current step

**All of Steps 3–8 (backend) and F1–F5 (frontend) done, browser-verified, and
all repo-wide quality gates green.** Nothing is committed yet (working tree
only) — next session should commit and open a PR, or the user will direct
otherwise. Backend: all 8 tables + 2 enums live in
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

| # | Entity              | Table                 | Key            | Notes |
|---|---------------------|-----------------------|----------------|-------|
| 1 | Listing             | `listing`             | ULID           | Spine. `kind` ∈ {property, package}. Search operates here. |
| 2 | Property            | `property`            | property code  | 1:1 with a `kind=property` listing. |
| 3 | Package             | `package`             | package code   | 1:1 with a `kind=package` listing. |
| 4 | Room Type           | `room_type`           | ULID           | Child of property. Occupancy capacity lives here. |
| 5 | Season              | `season`              | ULID           | Named date window scoped to a listing. |
| 6 | Rate Rule           | `rate_rule`           | ULID           | (listing, season, occupancy band) → price in a currency. |
| 7 | Currency            | `currency`            | ISO-4217 code  | Reference table. |
| 8 | FX Rate             | `fx_rate`             | ULID           | (base, quote) → rate. For display conversion only. |

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

## Definition of done: met

All backend steps (3–8) and frontend steps (F1–F5) per `20-steps.md` /
`32-frontend-steps.md` are complete. Nothing has been committed — this was a
pure build session on the working tree. Suggested next step: review the diff,
commit (likely as several commits mirroring the step boundaries, matching
flights' history style), and decide whether to open a PR.
