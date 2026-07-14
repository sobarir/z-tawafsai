import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateSeasonInput,
  Season,
  UpdateSeasonInput,
} from '@repo/shared';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type SeasonRow = typeof schema.season.$inferSelect;

const toSeason = (row: SeasonRow): Season => ({ ...row });

/** Postgres exclusion-constraint violation — see season_no_overlap in drizzle/0004_hotels_season_no_overlap.sql. */
const EXCLUSION_VIOLATION = '23P01';

/** Drizzle wraps the raw pg error in DrizzleQueryError.cause — the pg error code lives there, not on the top-level error. */
function isExclusionViolation(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } };
  return (
    err?.code === EXCLUSION_VIOLATION ||
    err?.cause?.code === EXCLUSION_VIOLATION
  );
}

@Injectable()
export class HotelSeasonsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Season[]> {
    const rows = await this.db.select().from(schema.season);
    return rows.map(toSeason);
  }

  async findById(id: string): Promise<Season> {
    const [row] = await this.db
      .select()
      .from(schema.season)
      .where(eq(schema.season.id, id));
    if (!row) {
      throw new NotFoundException(`Season ${id} not found`);
    }
    return toSeason(row);
  }

  async create(input: CreateSeasonInput): Promise<Season> {
    try {
      const [created] = await this.db
        .insert(schema.season)
        .values(input)
        .returning();
      return toSeason(created);
    } catch (error) {
      if (isExclusionViolation(error)) {
        throw new ConflictException(
          'This date range overlaps an existing season for the same listing',
        );
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateSeasonInput): Promise<Season> {
    await this.findById(id);
    try {
      const [updated] = await this.db
        .update(schema.season)
        .set(input)
        .where(eq(schema.season.id, id))
        .returning();
      return toSeason(updated);
    } catch (error) {
      if (isExclusionViolation(error)) {
        throw new ConflictException(
          'This date range overlaps an existing season for the same listing',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.season).where(eq(schema.season.id, id));
  }
}
