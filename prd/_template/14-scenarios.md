# 14 — Golden Scenarios (definition of done)

> TEMPLATE: these are **the oracle** — the behavior is correct iff these pass. Write them before
> the implementation, from the user's stated cases. If the user cannot name concrete cases with
> expected outputs, the feature is not specified yet; ask rather than inventing them.

{{n}} Vitest scenarios, all green. Each uses fixed fixtures from `15-seed-data.md`. They live as
colocated `apps/api/src/{{domain}}/*.spec.ts` files — the repo convention is a spec sitting next
to the service it tests — run via `pnpm --filter api test`.

| ID | Scenario | Asserts |
|----|----------|---------|
| S1 | {{concrete case with real values}} | {{exact expected output}} |
| S2 | {{…}} | {{…}} |
| S3 | {{a boundary: the value one step either side of a threshold}} | {{…}} |
| S4 | {{a negative case — the thing that must be excluded/rejected}} | {{…}} |

## Coverage matrix

> TEMPLATE: every capability from `00-overview.md`'s In-scope list appears in the left column,
> and every row has at least one scenario. An empty cell is an untested feature.

| Concern | Covered by |
|---------|------------|
| {{capability}} | S1, S3 |
| {{capability}} | S2 |

## Rules for the scenarios

- No network, no real clock — inject dates and external values as fixtures.
- Assert exact values, not shapes or ranges ({{integer minor units, exact ISO strings}}).
- Each scenario names its expected outcome explicitly (see `01-glossary.md`'s outcome table).
- If a scenario needs data the seed does not provide, extend `15-seed-data.md` — never hardcode a
  magic row inside the test, or the seed and the tests drift apart.
- When a scenario breaks because the seed legitimately changed, fix the scenario **and log why in
  `CONTEXT.md`** — a silently retuned assertion is how an oracle stops being one.
