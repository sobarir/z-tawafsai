import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '../id';
import { user } from './auth';

/**
 * Your application tables live here.
 * `posts` is a minimal example showing FKs against Better Auth's user table.
 */

export const post = pgTable('post', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content'),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
