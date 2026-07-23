# PRD index

This repo can carry more than one product initiative at once. Each one gets its own subfolder
under `prd/`, and each subfolder is self-contained: its own numbered docs, its own `CONTEXT.md`
(the living-state doc for that domain — read it at the start of any session touching that domain).

There is no shared, cross-domain `CONTEXT.md`. If you're not sure which domain a task belongs to,
ask before picking one.

## Domains

_None yet._ Add a row here for each domain as it is created — keep it to one line, and keep the
Status column honest (in progress / complete / superseded), since this table is what tells a new
session which domains exist at all.

| Domain | Folder | Status | Start here |
| --- | --- | --- | --- |
| — | — | — | — |

## Adding a new domain

Run `/add-prd <domain> <description>` (or follow `.claude/commands/add-prd.md` manually). It
works from **`prd/_template/`** — a blank skeleton of the numbered docs every domain here uses,
with each file explaining what belongs in it. `prd/_template/README.md` is the authority: it
carries the intake questions to ask before writing anything, which docs are required vs.
optional, and the numbering convention.

What the command does, and what to do by hand without it:

1. Copy `prd/_template/` to `prd/<domain>/`, dropping the docs that domain doesn't need and
   deleting the template's own `README.md`.
2. Answer the intake questions with the user, then fill the docs in order — strip every
   `> TEMPLATE:` line and `{{placeholder}}` as you go.
3. `CONTEXT.md` is the one file every session in that domain reads first — keep it current.
4. Add a row to the table above.
5. Add the domain to `backbone.yml`'s `prd.domains` map, then run `pnpm check:backbone`.
6. Get the PRD approved before writing any code — the PRD is its own deliverable.

Never mix two domains' docs in one folder, and never let one domain's `CONTEXT.md` track another
domain's state — that's exactly the confusion this structure exists to avoid.

## Removing a domain

Run `/remove-prd <domain>` (or follow `.claude/commands/remove-prd.md` manually). It
retires the domain's **documentation only**: `prd/<domain>/`, its `backbone.yml` entry, and its
row in the table above. Code, schema, migrations, seed data, and i18n are never touched — the PRD
and the implementation have separate lifecycles here, so removing the paperwork is not a
statement about the code. Deleting the code is a separate, explicit request.

One check runs first: `CONTEXT.md` often holds decisions that still govern live code, and the
folder may be their only record. Anything still load-bearing gets reported — and offered a home
in the root `AGENTS.md` — before the folder goes.
