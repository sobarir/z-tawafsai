import { z } from 'zod';

/**
 * ULID: 26 chars, Crockford base32 (no I, L, O, U).
 * All generated IDs in this system are ULIDs — app tables and auth records.
 */
export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Invalid ULID');

/**
 * Contracts shared between apps/web and apps/api.
 *
 * - apps/api derives NestJS DTOs from these via nestjs-zod (validation +
 *   OpenAPI schemas), see apps/api/src/posts/posts.dto.ts
 * - apps/web gets typed TanStack Query hooks generated from the resulting
 *   OpenAPI spec via Orval
 *
 * Note: these describe the JSON wire format — dates are ISO strings.
 */

export const postSchema = z.object({
  id: ulidSchema,
  title: z.string(),
  content: z.string().nullable(),
  authorId: ulidSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Post = z.infer<typeof postSchema>;

export const postListSchema = z.array(postSchema);

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10_000).optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullish(),
  emailVerified: z.boolean(),
  role: z.string().nullish(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const meResponseSchema = z.object({
  user: sessionUserSchema,
});
export type MeResponse = z.infer<typeof meResponseSchema>;
