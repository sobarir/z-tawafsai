# 31 — Design Direction & Tokens

> This is the design brief for Claude Code. Follow the tokens exactly; derive
> every color and type decision from here. The goal is a search UI that could not
> be mistaken for a generic OTA or for a templated AI page.

## Subject, audience, job

- **Subject:** a search tool for umrah/pilgrimage travel — properties near the
  Haramain and bundled packages.
- **Audience:** Indonesian pilgrims and their families planning a spiritually
  significant, often once-in-a-lifetime trip. Many are non-technical, price-
  sensitive, and browsing on mid-range Android phones. Calm, trustworthy, and
  legible matters more than flashy.
- **The page's one job:** let someone find a stay or package for their dates and
  see what it honestly costs. Nothing else.

## Deliberate anti-defaults

The skill warns against three AI-default looks: cream + serif + terracotta;
near-black + acid accent; broadsheet hairline columns. This brief explicitly
avoids all three. In particular **terracotta/clay accents are banned here** —
they read as the Claude default, not a choice, and they clash with the subject.

## Palette (4–6 named hex — use exactly)

Grounded in the materials of the subject: pale limestone of Makkah/Madinah
architecture, the deep green long associated with the tradition, and a restrained
gold used only as a hairline accent (never fills).

| token              | hex       | role                                            |
|--------------------|-----------|-------------------------------------------------|
| `--limestone`      | `#F3EFE7` | page background — warm pale stone, NOT cream #F4F1EA |
| `--ink`            | `#1B2A24` | primary text — near-black with a green undertone|
| `--haram-green`    | `#0E5C42` | primary brand / CTAs / active states            |
| `--haram-green-dk` | `#0A4131` | pressed/hover, headers                          |
| `--gold-line`      | `#C6A15B` | hairline accent ONLY — dividers, focus ring, price underline. Never a fill. |
| `--muted`          | `#6B7A73` | secondary text, native-currency line            |

Surfaces are `--limestone`; cards are a touch lighter (`#FBF9F4`) with a 1px
`--gold-line` at 25% opacity, no heavy shadows. Depth comes from the hairline and
generous whitespace, not drop shadows.

**Implementation:** wire these as CSS variables / Tailwind v4 theme extensions scoped to the
`hotel-search` feature (e.g. `--color-limestone`, `--color-haram-green`), not raw hex
scattered through components. This is a deliberately distinct visual identity for this
feature (per the brief above) — it does not reuse or replace the app's existing semantic
tokens (`bg-background`, `text-muted-foreground`, etc.), it sits alongside them.

## Typography (2 roles + data)

- **Display / headings:** a humanist serif with warmth and authority — e.g.
  **"Amiri"** or **"Marcellus"** for the hero and section titles. Used with
  restraint (hero, listing names). This nods to the Arabic calligraphic tradition
  without pastiche.
- **Body / UI:** a clean, highly legible humanist sans — e.g. **"Plus Jakarta
  Sans"** (apt: Indonesian-designed, excellent Latin legibility on Android) for
  all controls, labels, and card body.
- **Prices / data:** a tabular-figure treatment (use the sans with
  `font-variant-numeric: tabular-nums`) so prices align in the results column.

Type scale: clear steps, generous line-height on body (1.6) for readers scanning
carefully. Sentence case throughout (per the writing rules), never ALL CAPS.

## Layout concept

Two-pane search results, calm and scannable:

```
┌───────────────────────────────────────────────┐
│  [ compact search bar — editable, sticky ]     │  ← the current query, always visible
├──────────────┬────────────────────────────────┤
│  RefineRail  │   ResultsList                   │
│  sort        │   ┌──────────────────────────┐  │
│  price min   │   │ ResultCard (property)    │  │
│  price max   │   │  name · ★★★★             │  │
│  kind        │   │  ﷼400/night × 5 = ﷼2,000 │  │
│              │   └──────────────────────────┘  │
│              │   ┌──────────────────────────┐  │
│              │   │ ResultCard (package)     │  │
│              │   │  9 nights · total ﷼X     │  │  ← no /night line for packages
│              │   └──────────────────────────┘  │
└──────────────┴────────────────────────────────┘
```

On mobile the RefineRail collapses into a bottom sheet triggered by a "Refine"
button; the search bar becomes a single-column editable summary.

## Signature element (the one memorable thing)

**The price line as a "mizan" (balance).** Each card's price sits above a single
`--gold-line` hairline rule, and the breakdown reads as a small honest ledger:
`per night × nights ——— total`, or for packages a single `total` with the
included-scope beneath. The gold hairline is the *only* place gold appears, so
the price — the honest cost, the thing pilgrims most need to trust — is what the
eye is drawn to on every card. Spend the boldness here; keep everything else
quiet. No other decorative flourishes.

## Motion (restrained)

One page-load reveal on the results list: cards fade+rise 8px, staggered ~40ms,
once. Hover on a card lifts the gold hairline to full opacity. That's it. Full
static fallback under `prefers-reduced-motion`. No ambient animation, no parallax
— the audience and subject call for calm, not spectacle.

## Copy voice (from the skill's writing rules)

- Plain, warm, sentence case. Name things by what the pilgrim controls.
- CTA is consistent through the flow: the card says "View details", the detail
  page says "Request this" (stub) — never a fake "Book now".
- Empty state directs: "No stays match these dates in Madinah. Try widening your
  dates or switching to packages." — not "Oops, nothing found."
- Prices are never dressed up. Show the honest total; show the native price
  plainly when currency was converted.

## What to hand-build (don't pull a UI kit)

SearchForm controls, ResultCard, the price/mizan block, RefineRail, EmptyState.
~6 primitives, each doing one job, styled from these tokens.
