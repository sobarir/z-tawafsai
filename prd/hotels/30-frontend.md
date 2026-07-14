# 30 — Frontend Architecture

The search UI is the product. It is a thin, read-only client over `GET /hotels/search`
(11–13), consumed via the generated `useSearchHotels()` hook. It renders results; it never
books, holds, or prices anything itself — all price math lives on the server, the client only
displays what the API returns. If the client is doing money arithmetic, that's a bug.

## Stack

This is the existing `apps/web` app (Next.js 16 App Router, Turbopack, React 19, TypeScript
strict, Tailwind v4, shadcn/ui, TanStack Query v5, next-intl, Vitest+RTL) — nothing is
scaffolded fresh. This feature adds a new feature folder,
`apps/web/src/features/hotel-search/` (components/hooks/lib/server), the same shape as the
existing `flight-search` feature.

- **Server Components** for the results list (fetch on the server, stream to
  client). The search form is a **Client Component** (it owns URL state).
- **Styling:** Tailwind v4 utilities + CSS variables for the design tokens in `31-design.md`,
  layered on top of (not replacing) the existing semantic tokens. Base interactive primitives
  (buttons, inputs, selects) extend the vendored `src/components/ui/` shadcn primitives rather
  than being fully hand-built — the bespoke visual pieces (ResultCard, the mizan price line)
  are new components under `features/hotel-search/components/`.
- **Data fetching:** the Orval-generated TanStack Query hook (`useSearchHotels()` from
  `src/libs/api/generated/endpoints`), called from a client component — exactly like
  `flight-search.tsx` does today. Never a raw `fetch`/direct server-side call to the NestJS
  URL; that bypasses the mutator's cookie handling and typed `ApiError` envelope.
- **State model:** **the URL is the state.** Every search input is a query param
  (`destination`, `checkIn`, `checkOut`, `occupancy`, `currency`, `kind`, `sort`,
  `minPrice`, `maxPrice`, `page`). This makes searches shareable, back-button
  correct, and shareable within the app. TanStack Query still caches/dedupes the request.
- **i18n:** every user-facing string goes through `useTranslations`, added to all 6 locale
  files (en/es/fr/ar/bn/zh) — same rule flights follows.

## Routes

Search is a signed-in, gated feature — same pattern as flights' `/search`, not a public page.

| Route                                  | Type              | Job                                            |
|-----------------------------------------|-------------------|------------------------------------------------|
| `(protected)/@admin/hotels/page.tsx`    | Server            | Renders the shared search content for admins.  |
| `(protected)/@user/hotels/page.tsx`     | Server            | Renders the **same** shared content for users — both slots must exist, or the permission-slot layout shows a blank `default.tsx` to whichever role's page is missing (the same quirk flights hit). |
| `(protected)/@admin\|@user/hotels/[id]` | Server            | Read-only detail: price breakdown for the searched inputs. **No book button** — a "Request this" CTA that is a stub/`mailto` only. |
| `not-found` / `error`                   | —                 | Empty-state and error-state per the design writing rules. |

## Component tree (build these primitives, nothing more)

Following `flight-search`'s shape: the `(protected)/@admin|@user/hotels/page.tsx` files are
thin async Server Components (just `getTranslations` + render), and the actual search
tree — form, results, refine rail — is one client component that owns the
`useSearchHotels()` call, same as `flight-search.tsx` today.

```
<HotelSearchPageContent/>  server — page wrapper, i18n setup, renders <HotelSearch/>.
<HotelSearch/>       client — owns useSearchHotels(), URL state, and the tree below.
<SearchForm/>        client — destination, date range, occupancy stepper,
                     currency select, kind toggle (Stays | Packages | Both).
                     Writes to the URL, triggers the query.
<ResultsList/>       client — maps API rows to <ResultCard/>. Handles empty state.
<ResultCard/>        client — one row. Two variants dispatched on `kind`:
                       • property: star rating, "per night × N nights = total"
                       • package : duration in nights, "total" (never /night)
                     Both show price in the requested display currency, with the
                     native price as a muted secondary line when currency differs.
<RefineRail/>        client — sort + price min/max + kind filter. Edits the URL.
<PriceBreakdown/>    client — on the detail page: season, band, per-night/total,
                     nights, FX line if converted. Mirrors API `breakdown`.
<EmptyState/>        client — well-formed search, zero matches. Directs, not apologizes.
```

## The property-vs-package rule reaches the UI

The single most important frontend correctness rule, inherited from the backend
spine: **a property card shows nightly math (`× N nights`), a package card shows
a flat total and must never render a "per night" figure.** `ResultCard`
dispatches on `row.kind`. Getting this wrong is the frontend equivalent of
collapsing the two resolvers.

## Money display rules

- The API returns integer minor units + currency. Format using the currency's
  `minor_unit` (IDR has 0 decimals, USD/SAR have 2). Never divide by 100 with a
  hardcoded assumption.
- Show the **display-currency** price as primary. If the native currency
  differs, show it as a secondary muted line ("﷼2,800 · converted"). Never
  recompute conversion client-side — show what the API gave.
- Never show a raw float. Never show more precision than the currency has.

## Accessibility & quality floor (non-negotiable, from the skill)

- Responsive to mobile (the search form collapses to a single column stepper).
- Visible keyboard focus on every control; the occupancy stepper and date range
  are keyboard-operable.
- `prefers-reduced-motion` respected — the hero motion (31-design) has a static
  fallback.
- Empty/error states explain what to do next in the interface's own voice.

## Out of scope (frontend)

No new auth UI (the existing sign-in flow is reused as-is), no account pages, no
cart/checkout, no map view, no reviews, no image galleries (single `hero_image_url` per
card). A "Request this" CTA on detail is a `mailto:`/stub — it does not POST anywhere.
