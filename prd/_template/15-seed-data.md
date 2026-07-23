# 15 — Seed Data (idempotent)

> TEMPLATE: exact demo rows, specified precisely enough that two agents implementing this file
> produce the same database. Vague seed data ("a few sample rows") makes `14-scenarios.md`
> unassertable. Implemented in `packages/db/src/seed.ts`, in a transaction, idempotent — the
> gate is that `pnpm db:seed` twice leaves row counts unchanged.

## Reference data

> TEMPLATE: rows this domain needs from reference tables it does not own. If a row is missing
> from a master table, **seed it there** — never fall back to a free-text column.

| Table | Rows |
|-------|------|
| `{{table}}` | {{exact values}} |

## {{Entity}} fixtures

### {{CODE-1}} — "{{Name}}"

| field | value |
|-------|-------|
| {{col}} | {{exact value}} |
| {{col}} | {{exact value}} |

> TEMPLATE: give each fixture a short stable handle (`F1`, `{{CODE-1}}`) and use that handle in
> `14-scenarios.md` — so a scenario reads "S4: {{CODE-1}} across a {{threshold}} boundary"
> rather than restating the data and drifting from it.

### {{CODE-2}} — "{{Name}}"

{{…}}

## Notes

- Every FK resolves; no fixture depends on a row this file does not create.
- Values are chosen so the golden scenarios produce **distinguishable** results — if two
  fixtures price identically, a scenario asserting the difference proves nothing.
- Real-world source data (a supplied list, a route dossier) is transcribed, not invented; where a
  value had to be derived rather than sourced, say so here **and** in `CONTEXT.md`.
- Any dated window must cover the full range the app's other seeded data uses. A window that
  expires before the dates users actually search makes the entire domain look empty while every
  test still passes — check the ranges in `packages/db/src/seed.ts` before choosing dates.
