import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load app-local .env first, then fall back to the monorepo root .env
config();
config({ path: resolve(__dirname, '../../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[api] Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  API_PORT: Number(process.env.API_PORT ?? 3001),
  WEB_URL: process.env.WEB_URL ?? 'http://localhost:3000',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  ADMIN_EMAILS: (process.env.AUTH_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};
