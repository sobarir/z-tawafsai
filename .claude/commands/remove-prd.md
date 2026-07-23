---
description: Retire a domain's PRD — delete prd/<domain>/ and its map entries. Docs only; never touches code, schema, or data
---

# /remove-prd `<domain>`

Retires a domain's **documentation**. Deletes `prd/<domain>/` and the two places that index it.

**Scope wall: docs only.** Never delete or modify code, DB schema, migrations, seed data, API
modules, web features, or i18n as part of this command — the PRD and the implementation have
separate lifecycles here, and a doc cleanup that silently drops working code is unrecoverable
from the user's point of view. If the code should go too, that is a separate request, made
explicitly.

## What gets deleted

1. `prd/<domain>/` — the whole folder.
2. `backbone.yml` — its entry under `prd.domains`.
3. `prd/README.md` — its row in the Domains table.

Then run `pnpm check:backbone && pnpm check:instructions`. Nothing else should change; if
`git status` shows a file outside those three, it was not part of this command — revert it.

## Before deleting: rescue what outlived the doc

`CONTEXT.md` usually records decisions that still govern live code — a repo-wide bug fix, a
convention, a constraint that is not derivable from reading the source. Deleting the folder
destroys the *reasoning* while the code it explains stays in the repo.

So read `prd/<domain>/CONTEXT.md` and `00-overview.md` first, and report anything that is still
load-bearing:

- decisions that apply repo-wide → offer to move them into the root `AGENTS.md`;
- constraints specific to code that is staying → say so plainly, and ask where they should live;
- history that only described the build → safe to lose with the folder.

Report that list, then **wait for confirmation** before deleting — the user may be retiring a
finished domain's paperwork, or may not realize the folder is the only record of a live
constraint. Those need different answers, and only the user can tell them apart.

## If the code is staying

Say so explicitly in the final report: name what remains implemented but now undocumented, so
it is a known state rather than a surprise months later. An implemented domain with no PRD is a
legitimate choice — an accidental one is not.
