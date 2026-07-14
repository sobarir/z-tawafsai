# 32 — Frontend Build Steps (Claude Code sessions)

Run **after** backend Step 6 (a working `/search` endpoint exists). Same ritual:
opening → work → review checklist → gate → commit. Update CONTEXT.md each session.

## Step F1 — Feature folder + tokens

**Opening:** create `apps/web/src/features/hotel-search/` (components/hooks/lib/server, same
shape as `flight-search`). Add the design tokens from `31-design.md` as CSS variables /
Tailwind v4 theme extensions scoped to the feature. Load the two new typefaces (display
serif, Plus Jakarta Sans) alongside the app's existing font setup; tabular-nums for prices.
No app scaffold — Next.js 16/Tailwind v4/shadcn already exist.
**Review checklist:**
- [ ] every color from the palette exists as a CSS var; no terracotta/clay anywhere.
- [ ] fonts load with fallbacks; tabular-nums available for prices.
- [ ] no UI-kit chrome pulled in beyond the existing `src/components/ui/` primitives.
**Gate:** dev server renders a tokens preview page.
**Commit:** `feat(web): hotel-search feature folder + design tokens`

## Step F2 — Search form + URL state

**Opening:** build `<SearchForm/>` (client, in `hotel-search/components/`). Destination, date
range, occupancy stepper, currency select, kind toggle. On submit, write all fields to the
URL. The URL is the only state.
**Review checklist:**
- [ ] every field maps to a query param; refresh preserves the search.
- [ ] keyboard-operable: stepper, date range, toggles have visible focus.
- [ ] client validation mirrors the API (checkOut > checkIn, occupancy ≥ 1).
- [ ] every label/placeholder/button string goes through `useTranslations`, added to all 6
      locale files (en/es/fr/ar/bn/zh).
**Gate:** submitting builds a correct `/hotels?...` URL under `@admin` and `@user`.
**Commit:** `feat(web): hotel search form with URL state`

## Step F3 — Results + cards

**Opening:** `(protected)/@admin/hotels/page.tsx` and `@user/hotels/page.tsx` (both thin
Server Components rendering the same shared `<HotelSearchPageContent/>`) host the client
`<HotelSearch/>` tree, which calls the generated `useSearchHotels()` hook and renders
`<ResultsList/>` → `<ResultCard/>`. Implement both card variants.
**Review checklist:**
- [ ] both `@admin/hotels` and `@user/hotels` pages exist and render identically — a missing
      slot shows a blank `default.tsx` to that role (the flights precedent's quirk).
- [ ] data comes from `useSearchHotels()`, never a raw `fetch`/direct NestJS call.
- [ ] **property card shows `perNight × nights = total`; package card shows a
      flat total and NO per-night line.** (the spine rule reaching the UI)
- [ ] price formatted by the currency's minor_unit (IDR 0dp, USD/SAR 2dp).
- [ ] native price shown as muted secondary line only when currency differs.
- [ ] no client-side money arithmetic anywhere.
- [ ] result strings (counts, labels) translated into all 6 locales.
**Gate:** a Jeddah search shows L1 (property, nightly) and L2 (package, total)
correctly, converted to the requested display currency.
**Commit:** `feat(web): hotel search results + cards`

## Step F4 — Refine rail, empty/error states, detail page

**Opening:** `<RefineRail/>` (sort + price bounds + kind, edits URL). Empty and
error states per the writing rules. `hotels/[id]` detail (under both `@admin`/`@user`) with
`<PriceBreakdown/>` mirroring the API `breakdown`; "Request this" CTA is a `mailto:`/stub only.
**Review checklist:**
- [ ] refine controls edit the URL and re-run `useSearchHotels()`.
- [ ] price filter reflects the CONVERTED display price (matches API behavior).
- [ ] empty state directs the user; error state explains, doesn't apologize.
- [ ] detail page has no booking POST — CTA is a stub.
- [ ] refine rail and empty/error copy translated into all 6 locales.
**Gate:** filtering/sorting round-trips through the URL; detail breakdown matches
a card's numbers.
**Commit:** `feat(web): refine rail + states + detail`

## Step F5 — Signature, motion, a11y, responsive polish

**Opening:** implement the mizan price-line signature (gold hairline under each
price). Add the one staggered results reveal with a static reduced-motion
fallback. Mobile: search bar → single-column summary, refine → bottom sheet.
**Review checklist:**
- [ ] gold appears ONLY on the price hairline/focus ring — nowhere as a fill.
- [ ] `prefers-reduced-motion` gives a static layout, no reveal.
- [ ] responsive to ~360px; RefineRail becomes a bottom sheet.
- [ ] Chanel test: remove one accessory — cut any decoration not serving the brief.
**Gate:** Lighthouse a11y ≥ 95; looks calm and intentional on a phone viewport.
**Commit:** `feat(web): signature price-line, motion, responsive polish`

## Frontend definition of done

F1–F5 committed. The property/package card rule holds. No client money math, no
booking POST, no terracotta. Shareable-URL searches work. Reduced-motion and
mobile both correct.
