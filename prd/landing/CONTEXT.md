# Landing — CONTEXT

> Read this every session before touching landing code. Files: `00-overview.md`
> (scope/goals), `01-design-spec.md` (layout, tokens, shadcn mapping),
> `design-reference.html` (approved v3 prototype — visual source of truth).

## Status

- **Design: APPROVED at v3** (pair-rows layout). **Implemented in `apps/web` 2026-07-17.**
- Prototype iterated as a standalone HTML file with embedded images; the repo
  copy references image files instead (base64 stripped).
- Root route restructured: `(public)/page.tsx` is now the landing page with no
  generic site chrome; `Header`/`BackgroundGradient` moved into a new
  `(public)/(chrome)/` route group (confirmed with the user before
  restructuring — the landing shell's own sidebar/topbar replaces the generic
  nav on `/`). As of 2026-07-17 that group wraps `about/` and `packages/`
  (renamed from `travel-packages/` — see `prd/travel-packages/CONTEXT.md`);
  `ui-components/` was removed outright (template boilerplate, no longer
  needed) along with its now-orphaned `hero-section.tsx` and
  `ui-components-showcase.tsx` and the unused `uiComponents` /
  `navigation.uiComponents` translation keys.
- `packages/`, `destinations/`, `articles/` content lives in
  `apps/web/src/features/landing/data/*.ts` as typed constants (placeholder
  values per `00-overview.md`); chrome/UI copy lives in the `landing` next-intl
  namespace (all 6 locale files carry the same Indonesian text verbatim — not
  translated, per decision #7).
- Added Button CVA variants `brand` (gold shine, `.btn-brand-shine` in
  `globals.css`) and `brandSolid` (plain Tailwind utilities, overridable via
  className — used for the gold "Kirim" button in the CTA section).
- Landing topbar is session-aware: shows "Masuk" (→ `/login`) when signed out,
  the shared `UserDropdown` (avatar/role/logout) when signed in — reuses the
  same component and `signOut()` flow as the rest of the app rather than a
  landing-specific one. The former topbar kicker text ("Perjalanan Umrah &
  Ziarah") now lives under the logo in the sidebar, replacing "Travel Umrah
  Resmi Kemenag"; the topbar's left side is empty and nav is right-aligned.
- "Paket" (nav anchor → `#paket`) and "Mulai Rencana" (brand CTA, same anchor)
  intentionally both target the packages section — different roles
  (wayfinding vs. conversion prompt), not considered redundant. Confirmed with
  the user, left as-is.
- **2026-07-17 — sitewide rebrand.** Logging in used to jump from the
  TawafSai landing page into the original "Next Elite" starter-kit identity
  (purple `--primary`, "N" logo, Fredoka). The whole app — auth pages,
  `/dashboard`, all admin/user CRUD screens, `/about` — now runs the same
  olive/gold palette, Fraunces + Plus Jakarta Sans, and the TawafSai mark
  (`apps/web/public/tawafsai-logo.svg`), in both light and dark mode. Colors
  and fonts are token-driven (`apps/web/src/app/globals.css`,
  `site.config.json`, `fonts.ts`), so almost everything inherited the change
  automatically — no per-page rewrites needed except `/about`, which got new
  placeholder TawafSai copy replacing its 100%-generic dev-kit content.

## Design version history

| Ver | Layout | Outcome |
| --- | ------ | ------- |
| v1  | Packages and destinations in separate stacked sections | Stable fallback |
| v2  | Packages column beside destinations column | Rejected — package cards lost too much width/detail |
| v3  | **One package card + one destination card per row**, equal height; remaining 5 destinations in a grid below; filter hides the whole row | **Approved** |

Earlier explorations (single-viewport dashboard, glassmorphism, masonry discovery
feed, three-column feed) were rejected on the way to v3 — do not resurrect them
without a new decision here.

## Decisions log

1. **Palette is soft olive**, not vivid green — sampled from an approved swatch:
   900 `#333a28`, 700 `#48503b` (primary), 600 `#5c6647`, 100 `#e7e8de`;
   gold `#c98a3a` / `#f0e2cb`; paper `#f6f4ee`; line `#e4e2d8`.
2. **Fonts**: Fraunces (headings/prices/brand, italic tagline) + Plus Jakarta Sans.
3. **Hero photo is bottom-anchored** — the pilgrims' hands at the image bottom are
   the emotional core and must never be cropped (`object-position: bottom`).
4. **Brand CTA buttons** ("Mulai Rencana", "Cek Ketersediaan") use the shiny gold
   gradient treatment with hover glint — implement as a shadcn Button CVA variant.
5. **Package card anatomy** (v3): header = badge + stars left, price in tinted
   box right; body = 2×2 icon detail grid (Durasi / Maskapai / Hotel Makkah /
   Hotel Madinah); footer = note left, "Lihat Detail" right. Direct flights show
   a green "Langsung" pill. No separate price rail — removed at v3.
6. **Mobile order swap**: main content first, sidebar below (<900px); pair rows
   stack under 860px.
7. **Copy stays Bahasa Indonesia verbatim** from the reference, via next-intl
   messages — no hardcoded strings, no invented copy.
8. **Static data v1** — `apps/web` never touches the DB (repo boundary); dynamic
   content arrives later through `packages/shared` contracts + generated hooks.

## Next steps

1. Replace placeholder business data (prices, hotels, airlines, license no.)
   in `apps/web/src/features/landing/data/*.ts` and the sidebar license line.
2. New increment: article pages (the actual SEO ranking surface) + articles API.
