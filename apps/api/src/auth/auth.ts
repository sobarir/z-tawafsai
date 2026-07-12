import { createAuth } from '@repo/auth';
import { createDb } from '@repo/db';
import { env } from '../env';

/**
 * The Better Auth singleton.
 *
 * Note: this creates its own db connection because AuthModule.forRoot()
 * needs the instance before Nest's DI container boots. The pooled
 * DatabaseModule provider is what your feature modules should inject.
 */
export const auth = createAuth({
  db: createDb(env.DATABASE_URL),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.WEB_URL],
  adminEmails: env.ADMIN_EMAILS,
  google:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        }
      : undefined,
  cookieDomain: env.COOKIE_DOMAIN,
});
