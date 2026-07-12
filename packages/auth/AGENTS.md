# packages/auth — Better Auth config

> Repo-wide paths and boundaries: root `backbone.yml` — read it before exploring with `find`/`grep`/`ls`.

`createAuth(options)` builds the Better Auth server instance used by `apps/api`. Drizzle adapter (`provider: 'pg'`) + `admin()` plugin (adds `user.role`, banning, impersonation).

## Conventions

- Config only — mounting, CORS, and guards live in `apps/api`; HTTP concerns here would couple the config to one adapter.
- All record IDs are ULIDs via `advanced.database.generateId` → `createId()` from `@repo/db`. Never remove or replace it — the whole system assumes time-sortable ULID ids.
- `AUTH_ADMIN_EMAILS` promotion happens in the `databaseHooks.user.create.before` hook; after first sign-up the DB `role` column is the source of truth.
- Keep `trustedOrigins` an array with every web origin — the Fastify CORS fallback in nestjs-better-auth does not support functions.
- Cross-subdomain cookies in prod: set `COOKIE_DOMAIN=.yourapp.com` (wired via the `cookieDomain` option; sets Secure + SameSite=None).

## Boundaries

- Adding a plugin (organization, twoFactor, stripe, ...)? Its tables must land in `packages/db/src/schema/auth.ts` first (`npx @better-auth/cli@latest generate` shows the columns) — missing columns fail at sign-in, not at build.
- Client-side plugin counterparts go in `apps/web/src/features/auth/lib/auth-client.ts` — server plugins alone do not expose client methods.
