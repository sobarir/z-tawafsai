import { monotonicFactory } from 'ulidx';

const generate = monotonicFactory();

/**
 * The ID generator for EVERY generated identifier in the system:
 * Drizzle primary keys (via $defaultFn) and Better Auth records
 * (via advanced.database.generateId in packages/auth).
 *
 * ULID: 26-char Crockford base32, lexicographically sortable by creation
 * time (monotonic within the same millisecond), URL-safe, index-friendly.
 * Example: 01JZWJXQ4E4C6H4B8Z3T9G0R7M
 */
export const createId = (): string => generate();
