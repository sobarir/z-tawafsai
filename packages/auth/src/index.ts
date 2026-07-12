import type { Database } from '@repo/db';
import { createId } from '@repo/db';
import * as schema from '@repo/db/schema';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';

export interface CreateAuthOptions {
  db: Database;
  /** 32+ char secret. Generate with: openssl rand -base64 32 */
  secret: string;
  /** Public URL of the auth server (the NestJS API), e.g. http://localhost:3001 */
  baseURL: string;
  /** Origins allowed to talk to the auth server (your web app URL) */
  trustedOrigins?: string[];
  /** Comma-separated emails that get the admin role on sign-up (fallback RBAC) */
  adminEmails?: string[];
  google?: {
    clientId: string;
    clientSecret: string;
  };
  /**
   * Production: set to your apex domain (e.g. ".yourapp.com") so the session
   * cookie is shared between yourapp.com (web) and api.yourapp.com (api).
   * Leave undefined in local dev — localhost ports share cookies already.
   */
  cookieDomain?: string;
}

export function createAuth(options: CreateAuthOptions) {
  const {
    db,
    secret,
    baseURL,
    trustedOrigins = [],
    adminEmails = [],
    google,
    cookieDomain,
  } = options;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    baseURL,
    secret,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: google
      ? {
          google: {
            clientId: google.clientId,
            clientSecret: google.clientSecret,
          },
        }
      : undefined,
    databaseHooks: {
      user: {
        create: {
          // Promote allow-listed emails to admin on sign-up.
          // After first sign-up, the `role` column in the DB is the source
          // of truth (manage it via the Better Auth admin plugin API).
          before: async (user) => {
            const isAdmin = adminEmails.includes(user.email.toLowerCase());
            return {
              data: { ...user, role: isAdmin ? 'admin' : 'user' },
            };
          },
        },
      },
    },
    plugins: [admin()],
    advanced: {
      database: {
        // ULIDs for every Better Auth record (user, session, account, ...)
        // — same generator as the Drizzle app tables (packages/db).
        generateId: () => createId(),
      },
      ...(cookieDomain
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: cookieDomain,
            },
            defaultCookieAttributes: {
              secure: true,
              sameSite: 'none' as const,
            },
          }
        : {}),
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth['$Infer']['Session'];
export type SessionUser = Session['user'];
