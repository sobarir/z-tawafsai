# 13 — {{Core logic}} & API surface

> TEMPLATE: **optional**, and rename it to what it actually is — `13-<the-algorithm>.md`, named
> after the computation it specifies. Include it when the domain has an algorithm worth
> specifying separately from the schema, or an API surface with more than trivial CRUD. Pure CRUD
> over the tables in `11-data-model.md` does not need this file.

## Helpers (build first, unit-test hard)

> TEMPLATE: the small pure functions everything else stands on (money math, FX, date/gap
> arithmetic). Specify signature + rounding/overflow rules. These get unit tests before any
> endpoint exists — a bug here is invisible and everywhere.

```ts
{{fnName}}({{args}}): {{return}}
```

- {{rule — e.g. rounding happens exactly once, at display conversion}}
- {{rule — e.g. all intermediate math in integer minor units}}

## {{The algorithm}}

> TEMPLATE: ordered, deterministic steps with named terminal outcomes. State explicitly whether
> it is **pure** (no DB access inside). Prefer a pure function plus a thin service that feeds it
> rows — that split is what makes the golden scenarios cheap to write and fast to run.

1. {{step}}
2. {{step}}
3. → `{{OUTCOME}}`

## Endpoints

> TEMPLATE: one block per route. The Zod contract lives in `packages/shared` — this is the spec
> it is written from, not a second source of truth. Every route needs an explicit
> `@ApiOperation({ operationId })` or the generated hook name is garbage.

### `{{METHOD}} /{{path}}`

- **Query/body:** {{fields, types, defaults}}
- **Returns:** {{shape}}
- **Auth:** {{gated by the global AuthGuard / admin-only / public}}
- **operationId:** `{{operationId}}`
- **Failure modes:** {{what 4xx means here; what is silently omitted from a 200 instead}}

## Validation

> TEMPLATE: what is rejected at the boundary vs. what is a legitimate empty result. Getting this
> line wrong is how a search endpoint starts throwing 400s at users with unusual but valid input.

- {{rejected → 400}}
- {{valid but yields nothing → 200 with an empty list}}
