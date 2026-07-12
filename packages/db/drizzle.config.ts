import 'dotenv/config';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Also load the monorepo root .env when running from packages/db
config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/saas',
  },
});
