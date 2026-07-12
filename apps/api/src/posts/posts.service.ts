import { Inject, Injectable } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type { CreatePostInput, Post } from '@repo/shared';
import { desc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type PostRow = typeof schema.post.$inferSelect;

/** Map a DB row to the wire format (dates as ISO strings) */
const toPost = (row: PostRow): Post => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class PostsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listByAuthor(authorId: string): Promise<Post[]> {
    const rows = await this.db
      .select()
      .from(schema.post)
      .where(eq(schema.post.authorId, authorId))
      .orderBy(desc(schema.post.createdAt));
    return rows.map(toPost);
  }

  async create(authorId: string, input: CreatePostInput): Promise<Post> {
    const [created] = await this.db
      .insert(schema.post)
      .values({
        title: input.title,
        content: input.content ?? null,
        authorId,
      })
      .returning();
    return toPost(created);
  }
}
