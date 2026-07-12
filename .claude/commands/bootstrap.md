---
description: Orient in this repo before any work — load the map, check state, report a mental model
---

# /bootstrap — session initialization

Orientation only: do not modify any file during bootstrap. Non-Claude agents follow the same flow manually.

```mermaid
flowchart TD
    A["Read backbone.yml — the project map"] --> B["Read root AGENTS.md — invariants + routing table"]
    B --> C["Run: git status && git log -5 --oneline"]
    C --> D{"Task area clear from the user's request?"}
    D -- yes --> E["Read that area's AGENTS.md only (routing table)"]
    D -- no --> F["Infer from files mentioned, or ask which area"]
    F --> E
    E --> G["Run: pnpm check:backbone — verify the map is current"]
    G --> H["Report the mental model, then wait for confirmation"]
```

## Report format

Keep it under 12 lines:

1. **Stack** — one line (from backbone.yml, not from exploring).
2. **Task area** — which scoped AGENTS.md was loaded and why.
3. **Repo state** — branch, dirty files, last commit; flag uncommitted `openapi.json`/`generated/` drift.
4. **Constraints in effect** — the 2–4 boundaries most relevant to this task.
5. **Plan** — numbered steps, referencing the area's Mermaid workflow.

## Rules

- Never explore with `find`/`grep`/`ls` during bootstrap — backbone.yml already maps the topology; exploration burns the context this command exists to save.
- Never skip the report — the user corrects a wrong mental model in seconds; a wrong implementation costs the session.
