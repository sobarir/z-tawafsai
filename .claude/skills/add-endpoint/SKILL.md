---
name: add-endpoint
description: Add or change a NestJS API endpoint end to end (Zod contract → DTO → controller → generated frontend hook). Use when the user asks for a new endpoint, route, or API field, or when the web app needs data that no generated hook provides.
---

# Add or change an API endpoint

The contract pipeline is one loop — never implement only one end of it.

```mermaid
flowchart TD
    A["Define/edit Zod schema in packages/shared/src/index.ts"] --> B{"Needs a new table or column?"}
    B -- yes --> C["packages/db flow: edit schema/app.ts → pnpm db:generate → commit migration"]
    B -- no --> D["DTO in apps/api/src/FEATURE/FEATURE.dto.ts: class XDto extends createZodDto(xSchema)"]
    C --> D
    D --> E["Controller: @ApiTags + @ApiOperation({ operationId }) + @ApiOkResponse({ type: XDto })"]
    E --> F["Service: @Inject(DATABASE), Drizzle query via schema from @repo/db, Date → toISOString()"]
    F --> G["pnpm generate:api — emits openapi.json + Orval hooks"]
    G --> H["Web: use the new generated hook from src/libs/api/generated/endpoints"]
    H --> I["Verify: pnpm typecheck && pnpm lint && pnpm --filter web test"]
```

## Hard rules

- `operationId` names the generated hook (`listPosts` → `useListPosts`) — omit it and Orval invents an unstable name.
- IDs: never set `id` on inserts — ULIDs come from the schema `$defaultFn`; contracts validate them with `ulidSchema`.
- Dates: `z.iso.datetime()` in contracts, `.toISOString()` in services — `Date` breaks OpenAPI generation.
- Copy `apps/api/src/posts/` for the file shape; register the module in `app.module.ts`.
- Commit code + `openapi.json` + regenerated hooks together — CI fails on contract drift.

## Verification

```bash
pnpm generate:api
pnpm typecheck && pnpm lint
git status   # spec + generated hooks must be staged with the change
```
