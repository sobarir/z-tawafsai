# 11 — Data Model (Drizzle spec)

> TEMPLATE: source of truth for the schema. When the schema changes, **this file changes in the
> same commit** — a stale data-model doc is worse than no doc. Delete the file entirely if the
> domain adds no tables (e.g. a marketing page).

These {{n}} tables + {{m}} enums live in `packages/db/src/schema/app.ts` (copy the `post` pattern
per `packages/db/AGENTS.md`), alongside the existing tables already there — check for name
collisions before choosing a table name.

Repo-wide rules that apply here without restating per column: all IDs are ULID via `createId()`
from `@repo/db`, or a natural key when the outside world already assigns a standard code for the
entity (an ISO or industry code) — never UUID, never serial. All
timestamps `timestamp({ withTimezone: true })`. Money is integer minor units + an ISO currency
code — never a float type.

## Enums

```
{{enum_name}} : '{{value}}' | '{{value}}'
```

> TEMPLATE: add a one-line note for any enum whose values are labels rather than behavior
> switches — that distinction stops a later session from branching on a display string.

## 1. `{{table_name}}` ({{natural key: <col> | ULID}}) — {{one-line role}}

| column | type | constraints |
|--------|------|-------------|
| {{id}} | {{text PK (ULID) / varchar(3) PK}} | |
| {{col}} | {{type}} | {{NOT NULL, FK → other.col, CHECK …}} |
| created_at | timestamptz NOT NULL | default now() |
| updated_at | timestamptz NOT NULL | default now() |

- UNIQUE `({{cols}})` — {{what duplicate this prevents}}.
- Index on `({{cols}})` — {{which query this serves}}.

## 2. `{{table_name}}` …

> TEMPLATE: repeat one `##` section per table, in dependency order (reference data first, the
> entity that FKs into everything last). Keep headings at depth 2 — h4 is a signal the table
> deserves its own doc.

## Cross-entity invariants (assert in tests, not FK-expressible)

> TEMPLATE: the rules Postgres cannot enforce. Each becomes a test in `14-scenarios.md` or an
> `*-invariants.spec.ts`. If you cannot name any, you probably have not modeled the domain yet.

- {{invariant}} — asserted by {{test}}.
- {{invariant}} — asserted by {{test}}.

## Reference data reused from elsewhere

> TEMPLATE: list the existing tables this domain FKs into rather than duplicating. A new
> free-text column that shadows a reference table already in `packages/db` is a review failure —
> if the master table is missing a row this domain needs, seed that row instead.

- `{{table}}` — {{where it lives, what this domain uses it for}}

## Schema-generation prompt (paste to kick off Step 3)

> TEMPLATE: a self-contained prompt the first build session pastes verbatim. It should name the
> file to edit, the pattern to copy, the exact tables/enums, and the constraints — so the session
> does not re-derive them from prose.

```
Add the {{domain}} schema to packages/db/src/schema/app.ts, following the existing `post`
pattern. Create {{n}} tables and {{m}} enums exactly as specified in prd/{{domain}}/11-data-model.md:
{{table list}}.
Rules: ULIDs via createId() or natural keys (never UUID/serial); every timestamp
withTimezone: true; money as integer minor units + currency code (never float); export
$inferSelect/$inferInsert for every table. Then run pnpm db:generate and commit the migration.
Do not touch packages/db/drizzle/ by hand.
```
