# 30 — Frontend Architecture

> TEMPLATE: **optional** — only if the domain has UI. Delete for a backend-only domain.

## Stack

`apps/web` as it already exists: Next.js 16 App Router, React 19 Server Components by default,
Tailwind v4 + shadcn/ui, TanStack Query through the **generated** Orval hooks
(`src/libs/api/generated/` — never hand-written fetches), next-intl for every string.

**Data access is read-through the generated hooks only.** `apps/web` never touches the database
and never adds a data API route — the API is the single data owner.

## Routes

> TEMPLATE: the repo's permission-slot pattern is `(protected)/@admin/…` and `(protected)/@user/…`.
> An admin-only screen exists under `@admin` alone; anything both roles see needs a page in both
> slots. Decide per route — a route that silently appears in the wrong slot is a permission bug.

| Route | Slot | Purpose |
|-------|------|---------|
| `(protected)/@admin/{{path}}` | admin | {{…}} |
| `(protected)/@user/{{path}}` | user | {{…}} |

- URL is the state for search/filter screens — every filter round-trips through query params so a
  link reproduces the view. But buffer in-progress input in local state and commit only on
  submit/blur: committing every keystroke to the URL re-renders the Server Component mid-type and
  clobbers what the user is typing.

## Component tree (build these primitives, nothing more)

> TEMPLATE: name the components before building. Anything not on this list is YAGNI until a
> second screen needs it.

```
features/{{domain}}/
  {{domain}}-form.tsx        — {{…}}
  {{domain}}-results.tsx     — {{…}}
  {{domain}}-detail.tsx      — {{…}}
```

## Reuse before writing

Before creating anything, read what `apps/web/src/components/shared/`, `src/hooks/`, and
`src/libs/utils.ts` already provide, plus the closest existing feature folder. Admin CRUD screens
here are assembled from shared table/dialog/mutation primitives — a bespoke table or dialog is a
review failure, and a parallel copy trips `pnpm check:dupes` at 2%.

Comboboxes, dialogs, and every other primitive come from the vendored **real shadcn** components
— never hand-roll one. A hand-rolled equivalent misses the accessibility and event-handling
behavior the real component carries, and the resulting bugs surface only in the browser.

## Display rules

> TEMPLATE: the formatting decisions that must be consistent across every screen — money, dates,
> timezones, empty states, truncation. Write them once here rather than per component.

- {{rule}}
- {{rule}}

## Accessibility & quality floor (non-negotiable)

- Keyboard-reachable and focus-visible on every interactive element.
- Real labels on every input; icon-only buttons carry an accessible name.
- Motion lives inside `@media (prefers-reduced-motion: no-preference)` so reduced motion is the
  unstyled default, not a branch that can be got wrong.
- No horizontal overflow at 360px width.
- Zero new Biome a11y warnings.

## Out of scope (frontend)

- {{…}}
