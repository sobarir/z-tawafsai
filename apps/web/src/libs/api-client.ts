import { type FetchOptions, ofetch } from 'ofetch';
import type { z } from 'zod';
import { env } from '@/libs/env';

// All data requests go to the NestJS API (which also serves Better Auth).
const baseURL = env.NEXT_PUBLIC_API_URL;

export const apiClient = ofetch.create({
  baseURL: `${baseURL}/api`,
  retry: 1,
  retryDelay: 250,
  credentials: 'include',
  onRequestError({ error }) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[apiClient] request error:', error.message);
    }
  },
});

export type ApiOptions<T> = FetchOptions<'json'> & {
  schema?: z.ZodType<T>;
};

export async function apiFetch<T>(
  url: string,
  options: ApiOptions<T> = {},
): Promise<T> {
  const { schema, ...rest } = options;
  const data = await apiClient<unknown>(url, rest);
  return schema ? schema.parse(data) : (data as T);
}
