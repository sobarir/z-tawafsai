# Landing — Design Spec

Visual source of truth: `design-reference.html` (v3). This file translates it into
repo terms: tokens, structure, shadcn mapping, and the implementation prompt.

## Page structure (top to bottom)

1. **Split shell** — sticky left sidebar ~340px + scrolling main. Mobile <900px:
   main first, sidebar below (order swap).
2. **Sidebar** — brand mark, kicker "Travel Umrah Resmi Kemenag", serif headline
   "Menuju Baitullah, dengan tenang.", italic tagline, numbered 6-item
   "Panduan Pilihan" article link list, laurel monogram, license line.
3. **Topbar** (sticky) — kicker, nav (Paket / Destinasi / Jurnal / Tentang),
   brand-variant "Mulai Rencana" button, burger menu on mobile.
4. **Hero** — rounded card, `hero-kaaba.jpg` as `next/image` fill,
   `object-cover object-bottom` (hands must stay in frame), olive scrim
   stronger on the left; headline + floating booking bar (Select bulan,
   Select jamaah, brand button "Cek Ketersediaan").
5. **Trust strip** — 4 items with icons: Izin Resmi Kemenag / rating / 24/7 /
   Dana Terlindungi.
6. **Pair rows** (signature, v3) — 4 rows of `[package card | destination card
   340px]`, equal height, 18px gap. Category filter above (Semua / Hemat /
   Premium / Keluarga) hides the whole row. Pairs: Reguler+Haram,
   Nyaman(featured)+Nabawi, Keluarga+Jabal Nur, Express+Quba.
7. **Destinasi Ziarah Lainnya** — grid of 5: Jabal Uhud, Masjid Qiblatain,
   Jabal Tsur, Padang Arafah, Masjid Aisyah (Tan'im) — olive gradient
   placeholders until photos exist.
8. **Articles** — 3 cards + auto-load on scroll from a static pool
   (IntersectionObserver; "Memuat…" → "Anda sudah melihat semuanya ✦").
9. **CTA** — olive panel, geometric SVG pattern overlay, email Input + brand button.
10. **Footer** — license line + links.

## Tokens (Tailwind v4 `@theme`)

```css
--color-brand-900: #333a28;  --color-brand-700: #48503b;
--color-brand-600: #5c6647;  --color-brand-100: #e7e8de;
--color-gold: #c98a3a;       --color-gold-soft: #f0e2cb;
--color-paper: #f6f4ee;      --color-line: #e4e2d8;
```

Fonts via `next/font/google`: Fraunces (500/600 + italic) as `--font-serif`,
Plus Jakarta Sans as `--font-sans`.

Brand button variant: `linear-gradient(135deg,#e8b552 0%,#f4d27a 45%,#d69a3c 100%)`,
text `#3a2708`, gold glow shadow, diagonal glint sweep on hover (disabled under
`prefers-reduced-motion`).

## shadcn/ui mapping

| Element | Component |
| ------- | --------- |
| All CTAs | `Button` + new `brand` CVA variant |
| Package card | `Card` family |
| Badges (Hemat / Paling Diminatı / Langsung) | `Badge` variants |
| Category filter | `ToggleGroup` (single-select) |
| Booking-bar dropdowns | `Select` |
| CTA email field | `Input` |
| Sidebar dividers | `Separator` |
| Destination cards | custom: `Card` + `next/image` fill + gradient overlay |
| Icons | lucide-react (Calendar, Plane, Building2, Luggage, User, MapPin, ShieldCheck, Star, Clock, CreditCard) |

## Suggested component layout

```
apps/web/src/features/landing/
  components/  landing-shell, landing-sidebar, landing-topbar, hero,
               booking-bar*, trust-strip, package-destination-rows*,
               package-card, destination-card, more-destinations,
               articles-feed*, article-card, landing-cta, landing-footer
  data/        packages.ts, destinations.ts, articles.ts   (typed constants)
```

`*` = `'use client'`; everything else server components. Route: the public
unauthenticated root page — follow `apps/web/AGENTS.md` for where public pages
live in the Next-Elite route groups.

## Quality gates

`pnpm typecheck` + `pnpm lint` (Biome) + `pnpm test` clean; no writes to
generated dirs; `backbone.yml` updated if new top-level structure is added;
strings via next-intl; semantic landmarks + alt text; gold focus-visible rings.

## Claude Code prompt

Run `/bootstrap`, then:

```
Implement the TawafSai landing page in apps/web.

Load prd/landing/CONTEXT.md, prd/landing/01-design-spec.md, and
prd/landing/design-reference.html (visual source of truth — match its layout,
spacing, palette, and Indonesian copy exactly). Follow apps/web/AGENTS.md.
Work ONLY in apps/web; no API, db, or shared-contract changes.

1. Add tokens + fonts per the spec (Tailwind v4 @theme, next/font).
2. Add the `brand` Button variant (gold shine per spec).
3. Build the components in the spec's layout, using the shadcn mapping and
   lucide-react icons.
4. Typed static data files; copy from the reference verbatim into next-intl
   messages — do not invent copy.
5. Implement pair rows (equal height, filter hides whole rows), mobile order
   swap, bottom-anchored hero image, and the auto-loading articles feed.
6. Verify: pnpm typecheck && pnpm lint && pnpm test. Compare against
   design-reference.html in the browser and fix drift before finishing.
```
