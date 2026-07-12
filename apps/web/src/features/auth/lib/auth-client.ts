import { createAuthClient } from 'better-auth/react';
import { env } from '@/libs/env';

/**
 * Auth requests go to the NestJS API, which owns Better Auth
 * (mounted at {NEXT_PUBLIC_API_URL}/api/auth/*).
 */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
});
