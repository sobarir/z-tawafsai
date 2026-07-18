# Landing Page — Overview

Public marketing landing page for TawafSai (umrah marketplace). Audience: Indonesian /
SE Asian pilgrims. Brand personality: modern and trustworthy — fintech-grade clarity,
not luxury-brochure mysticism. All copy is Bahasa Indonesia.

## Goals

1. **Soft-sell** — packages presented alongside genuinely useful content (ziarah
   destinations, umrah guides/news), like a travel site, not a hard-sell brochure.
2. **Trust** — real photography (Ka'bah door hero, actual destination photos),
   honest specifics (named hotels with real distances, airline + direct-flight flag),
   Kemenag license visibility.
3. **SEO foundation** — keyword-rich internal article links in a persistent sidebar
   ("Panduan Pilihan": tawaf, sai, Masjidil Haram, Masjid Nabawi, visa, persiapan).
   The sidebar aids discovery/internal linking only; ranking work happens on the
   article pages themselves (out of scope here — see Non-goals).

## Scope (v1)

- Static landing page in `apps/web` only. No backend, no new endpoints, no DB.
- Content (packages, destinations, articles) as typed static data arrays —
  shaped so swapping to Orval-generated hooks later is a data-only change.
- Working client-side interactions: package category filter, article feed
  auto-load (from a static pool), booking-bar selects (UI only, no submit).

## Non-goals (v1)

- Booking flow, payments, auth-gated features — separate domains.
- Real article pages — required for actual SEO ranking, planned as the next
  domain increment (`prd/articles/` or extension of this one).
- CMS / admin editing of landing content.
- API endpoints for packages/destinations/articles — follows the repo's
  Zod → OpenAPI → Orval loop when content goes dynamic.

## Reference assets

- Approved visual prototype: `prd/landing/design-reference.html` (version v3).
- Photos: `apps/web/public/images/landing/` — hero-kaaba.jpg, dest-haram.jpg,
  dest-nabawi.jpg, dest-jabalnur.jpg, dest-quba.jpg.

## Placeholder data — replace before launch

Prices, hotel names, airlines, review counts ("4.9/5 dari 2.100+"), and the
Kemenag license number ("No. XXXX") are prototype placeholders — publishing
unverified claims (especially the license) damages exactly the trust this page
exists to build. Keep them in data files so replacement is data-only.
