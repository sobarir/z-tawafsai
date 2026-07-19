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
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type SeasonRow = typeof schema.season.$inferSelect;

const toSeason = (row: SeasonRow): Season => ({ ...row });

@Injectable()
export class HotelSeasonsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Season[]> {
    const rows = await this.db
      .select()
      .from(schema.season)
      .orderBy(asc(schema.season.name));
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
    const [existing] = await this.db
      .select({ id: schema.season.id })
      .from(schema.season)
      .where(eq(schema.season.name, input.name));
    if (existing) {
      throw new ConflictException(`Season "${input.name}" already exists`);
    }
    const [created] = await this.db
      .insert(schema.season)
      .values(input)
      .returning();
    return toSeason(created);
  }

  async update(id: string, input: UpdateSeasonInput): Promise<Season> {
    await this.findById(id);
    if (input.name) {
      const [clash] = await this.db
        .select({ id: schema.season.id })
        .from(schema.season)
        .where(eq(schema.season.name, input.name));
      if (clash && clash.id !== id) {
        throw new ConflictException(`Season "${input.name}" already exists`);
      }
    }
    const [updated] = await this.db
      .update(schema.season)
      .set(input)
      .where(eq(schema.season.id, id))
      .returning();
    return toSeason(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.season).where(eq(schema.season.id, id));
  }
}
