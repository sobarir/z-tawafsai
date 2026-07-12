import { env } from '@/libs/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : `Request failed with status ${status}`,
    );
    this.name = 'ApiError';
  }
}

/**
 * Orval mutator: every generated hook goes through this.
 * - Prefixes the NestJS API origin
 * - Always sends credentials (Better Auth session cookie)
 * - Normalizes errors into ApiError({ status, body }) — the body carries the
 *   API's structured error envelope (statusCode, message, requestId, issues).
 */
export const customFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${url}`, {
    ...options,
    credentials: 'include',
  });

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const body = isJson
    ? await response.json().catch(() => undefined)
    : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
};
