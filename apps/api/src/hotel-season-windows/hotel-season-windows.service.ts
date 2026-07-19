import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateSeasonWindowInput,
  SeasonWindow,
  UpdateSeasonWindowInput,
} from '@repo/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type SeasonWindowRow = typeof schema.seasonWindow.$inferSelect;

const toSeasonWindow = (row: SeasonWindowRow): SeasonWindow => ({ ...row });

/** Postgres exclusion-constraint violation — see season_window_no_overlap in drizzle/0021_season_window_no_overlap.sql. */
const EXCLUSION_VIOLATION = '23P01';

/** Drizzle wraps the raw pg error in DrizzleQueryError.cause — the pg error code lives there, not on the top-level error. */
function isExclusionViolation(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } };
  return (
    err?.code === EXCLUSION_VIOLATION ||
    err?.cause?.code === EXCLUSION_VIOLATION
  );
}

const OVERLAP_MESSAGE =
  'This date range overlaps an existing season window for the same property';

@Injectable()
export class HotelSeasonWindowsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<SeasonWindow[]> {
    const rows = await this.db
      .select()
      .from(schema.seasonWindow)
      .orderBy(
        asc(schema.seasonWindow.propertyCode),
        asc(schema.seasonWindow.startDate),
      );
    return rows.map(toSeasonWindow);
  }

  async findById(id: string): Promise<SeasonWindow> {
    const [row] = await this.db
      .select()
      .from(schema.seasonWindow)
      .where(eq(schema.seasonWindow.id, id));
    if (!row) {
      throw new NotFoundException(`Season window ${id} not found`);
    }
    return toSeasonWindow(row);
  }

  async create(input: CreateSeasonWindowInput): Promise<SeasonWindow> {
    try {
      const [created] = await this.db
        .insert(schema.seasonWindow)
        .values(input)
        .returning();
      return toSeasonWindow(created);
    } catch (error) {
      if (isExclusionViolation(error)) {
        throw new ConflictException(OVERLAP_MESSAGE);
      }
      throw error;
    }
  }

  async update(
    id: string,
    input: UpdateSeasonWindowInput,
  ): Promise<SeasonWindow> {
    await this.findById(id);
    try {
      const [updated] = await this.db
        .update(schema.seasonWindow)
        .set(input)
        .where(eq(schema.seasonWindow.id, id))
        .returning();
      return toSeasonWindow(updated);
    } catch (error) {
      if (isExclusionViolation(error)) {
        throw new ConflictException(OVERLAP_MESSAGE);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db
      .delete(schema.seasonWindow)
      .where(eq(schema.seasonWindow.id, id));
  }
}
