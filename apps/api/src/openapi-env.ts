/**
 * Imported first by openapi.ts: spec generation must work without real
 * infrastructure (CI, fresh clones), and Better Auth/Drizzle connect lazily,
 * so placeholders are safe here.
 */
process.env.DATABASE_URL ??=
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';
process.env.BETTER_AUTH_SECRET ??=
  'openapi-generation-placeholder-secret-32-chars';
