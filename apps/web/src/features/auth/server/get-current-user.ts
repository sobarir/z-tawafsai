import 'server-only';

import { headers } from 'next/headers';
import { env } from '@/libs/env';
import { getPermissionsForRole, getRoleFromEmail } from '../rbac/roles';
import type { AuthUser, UserRole } from '../types';

interface GetSessionResponse {
  session: { id: string; userId: string; expiresAt: string } | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    /** Managed by the Better Auth admin plugin on the API */
    role?: string | null;
  } | null;
}

/**
 * Validates the session against the NestJS API (the Better Auth server)
 * by forwarding the incoming request's cookies to /api/auth/get-session.
 *
 * The web app stays database-free: the API is the single source of truth.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get('cookie');
    if (!cookie) return null;

    const response = await fetch(
      `${env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
      {
        headers: { cookie },
        cache: 'no-store',
      },
    );
    if (!response.ok) return null;

    const data = (await response.json()) as GetSessionResponse | null;
    if (!data?.user?.email) return null;

    const { id, email, role: dbRole } = data.user;
    const role: UserRole =
      dbRole === 'admin'
        ? 'admin'
        : getRoleFromEmail(email, env.AUTH_ADMIN_EMAILS);

    return {
      id: id ?? email,
      email,
      role,
      permissions: getPermissionsForRole(role),
    };
  } catch {
    return null;
  }
}
