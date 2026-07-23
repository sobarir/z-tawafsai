# PRD index

This repo can carry more than one product initiative at once. Each one gets its own subfolder
under `prd/`, and each subfolder is self-contained: its own numbered docs, its own `CONTEXT.md`
(the living-state doc for that domain — read it at the start of any session touching that domain).

There is no shared, cross-domain `CONTEXT.md`. If you're not sure which domain a task belongs to,
ask before picking one.

## Domains

This table lists the domains **under construction**, not every domain the app has. A PRD is a
starting point with a defined end: once the domain ships, its folder is retired (see *Retiring a
shipped domain* below) and it disappears from here. So a domain listed here has an authoritative
PRD to follow; a domain that is implemented but absent is finished, and its code — with its
comments and tests — is the source of truth. An empty table means everything has shipped.

Add a row when a domain's PRD lands; remove it when the domain retires. Keep it to one line, and
keep the Status column honest (in progress / blocked / ready to retire).

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

## Retiring a shipped domain

Retirement is the last step of every PRD, not an afterthought — it is the final step in the
domain's own `20-steps.md`. Before the folder goes, four things move out of it:

1. **Golden scenarios → tests.** Every scenario exists as a spec that runs in `pnpm test`. This is
   the hard gate: executable specs cannot drift, and a scenario that never became a test was never
   verified in the first place.
2. **Conventions that generalize → the scoped `AGENTS.md`** for the app they govern.
3. **Decisions that look like bugs → a comment at the line that implements them**, with the reason
   and, where one exists, the test that fails if someone "corrects" it.
4. **Non-goals → a `// Scope: … Not in scope: …` block** atop the domain's API module. Nothing in
   source distinguishes "deliberately absent" from "not built yet", so without this a later
   session reads the gap as a to-do and starts building what the PRD ruled out.

Then run `/remove-prd <domain>`. Nothing is lost by deleting: `git log --diff-filter=D --
prd/<domain>/` finds the removal and `git show <sha>^:prd/<domain>/CONTEXT.md` restores any file.
The point is to take a document that stops matching reality out of the reading path — the harm in
a stale PRD is that agents keep believing it, not that it exists.

## Removing a domain that was never built

Run `/remove-prd <domain>` (or follow `.claude/commands/remove-prd.md` manually). It
retires the domain's **documentation only**: `prd/<domain>/`, its `backbone.yml` entry, and its
row in the table above. Code, schema, migrations, seed data, and i18n are never touched — the PRD
and the implementation have separate lifecycles here, so removing the paperwork is not a
statement about the code. Deleting the code is a separate, explicit request.

One check runs first: `CONTEXT.md` often holds decisions that still govern live code, and the
folder may be their only record. Anything still load-bearing gets reported — and offered a home
in the root `AGENTS.md` — before the folder goes.
