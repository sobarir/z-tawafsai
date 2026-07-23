# 31 — Design Direction & Tokens

> TEMPLATE: **rarely needed — confirm with the user before creating this file.**
>
> The default is that a new domain uses the app's existing design system: semantic tokens plus
> the vendored shadcn primitives. A domain-specific visual identity has a real cost — two brands
> inside one product read to users as two products, and the second identity has to be maintained
> against every future change to the first.
>
> So: write this file **only** when the user has explicitly asked for a distinct visual identity
> for this domain, and record that request verbatim in `CONTEXT.md`'s Confirmed decisions. A
> public marketing surface is the usual legitimate case; an in-app feature almost never is.
> Otherwise delete this file — using the shared design system needs no doc.

## Why this domain deviates

> TEMPLATE: quote the user's request and the scope of the deviation — which routes, and whether
> app-shell chrome (sidebar, header) is included or stays default.

{{quoted request, date}}

## Subject, audience, job

{{who is looking at this and what one thing they should feel or do}}

## Palette

> TEMPLATE: 4–6 named hex values, used exactly. Add them as CSS variables in `globals.css` under
> a single scoped class — never inline `style={{}}` on a shadcn component, whose variants set
> backgrounds via `!important` classes that silently beat the inline style, leaving no error and
> no visible cause.

| Token | Hex | Used for |
|-------|-----|----------|
| `--{{name}}` | `#{{hex}}` | {{…}} |

## Typography

> TEMPLATE: two roles max (display + body) plus the data/tabular treatment. Fonts must be both
> declared in `app/fonts.ts` **and** referenced in `layout.tsx` — an exported-but-unreferenced
> font loads nothing, and the page quietly falls back to the default while looking plausible.

- **Display:** {{font}} — {{where}}
- **Body:** {{font}} — {{where}}

## Layout & signature element

{{the one memorable thing this surface has that a default template would not}}

## Motion

Restrained; entirely inside `@media (prefers-reduced-motion: no-preference)`.

## Anti-defaults

> TEMPLATE: what to deliberately avoid so the result does not read as a stock template.

- {{…}}
