# PRD index

This repo can carry more than one product initiative at once. Each one gets its own subfolder
under `prd/`, and each subfolder is self-contained: its own numbered docs, its own `CONTEXT.md`
(the living-state doc for that domain — read it at the start of any session touching that domain).

There is no shared, cross-domain `CONTEXT.md`. If you're not sure which domain a task belongs to,
ask before picking one.

## Domains

| Domain | Folder | Status | Start here |
| --- | --- | --- | --- |
| Flight schedule & inventory | `prd/flights/` | v1 + v1.1 (pricing/search) complete | `prd/flights/CONTEXT.md` |
| Hotel search & pricing | `prd/hotels/` | not started | `prd/hotels/CONTEXT.md` |

## Adding a new domain

Copy the shape of `prd/flights/`, not its content:

1. Create `prd/<domain>/`.
2. Chunk the new PRD into numbered docs the same way `prd/flights/` does (an overview with goals
   and explicit non-goals, a glossary if the domain has its own vocabulary, a data-model doc, a
   seed-data doc, a scenarios/acceptance doc if there's a golden test set, a steps doc if the build
   is being sequenced session-by-session).
3. Add a `CONTEXT.md` — current step, confirmed decisions, entity/progress checklist, open
   questions. This is the one file every session in that domain reads first.
4. Add a row to the table above.
5. Add the domain to `backbone.yml`'s `prd.domains` map.

Never mix two domains' docs in one folder, and never let one domain's `CONTEXT.md` track another
domain's state — that's exactly the confusion this structure exists to avoid.
