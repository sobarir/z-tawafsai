# 01 — Glossary & decision logic

> TEMPLATE: **optional** — include only if the domain has vocabulary that is easy to collapse or
> get wrong: two terms that look interchangeable but drive different behavior, or a word the
> business uses differently from its everyday meaning. A domain that reuses ordinary words does
> not need this file; delete it rather than padding it.
>
> The test for whether a term belongs here: has anyone, or would any agent, plausibly use it to
> mean two different things? If not, it is not a glossary entry.

## Terms

> TEMPLATE: definition first, then the distinction it is most often confused with. Be exact —
> this file is quoted verbatim in later sessions to settle arguments.

- **{{Term}}** — {{definition}}. Not to be confused with {{near-miss term}}, which is
  {{difference}}.
- **{{Term}}** — {{definition}}.

## {{Core algorithm / decision logic}}

> TEMPLATE: if a term is only meaningful through a computation (a price resolution, a connection
> classification), write the algorithm here as ordered steps with named outcomes. Steps must be
> deterministic and side-effect free — this is the thing `14-scenarios.md` asserts against.

1. {{step}}
2. {{step}} → outcome `{{OUTCOME_NAME}}`

## Outcomes (not exceptions — {{filters / classifications}})

> TEMPLATE: name every terminal state, including the failure ones, and say what the caller sees.
> Decide explicitly whether a record the logic cannot handle is *silently omitted from a 200
> response* or *raised as a 4xx* — leave it unwritten and each session will re-decide it
> differently.

| Outcome | Means | Caller sees |
| --- | --- | --- |
| `{{OK}}` | {{…}} | {{…}} |
| `{{NO_X}}` | {{…}} | {{…}} |

## The golden rules

> TEMPLATE: the 3–5 invariants most likely to be violated by a well-meaning refactor. Each with
> an em-dash reason. These get promoted into the root `AGENTS.md` if they survive the build.

1. **{{Rule}}** — {{why breaking it corrupts the model}}
2. **{{Rule}}** — {{why}}
3. **{{X} is DERIVED, never stored** — {{why a column would drift from the truth}}
