import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateRateRuleInput,
  RateRule,
  UpdateRateRuleInput,
} from '@repo/shared';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type RateRuleRow = typeof schema.rateRule.$inferSelect;

const toRateRule = (row: RateRuleRow): RateRule => ({ ...row });

/** Postgres unique-violation — the band_unique / band_unique_no_room_type indexes. */
const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === UNIQUE_VIOLATION
  );
}

@Injectable()
export class HotelRateRulesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<RateRule[]> {
    const rows = await this.db.select().from(schema.rateRule);
    return rows.map(toRateRule);
  }

  async findById(id: string): Promise<RateRule> {
    const [row] = await this.db
      .select()
      .from(schema.rateRule)
      .where(eq(schema.rateRule.id, id));
    if (!row) {
      throw new NotFoundException(`Rate rule ${id} not found`);
    }
    return toRateRule(row);
  }

  async create(input: CreateRateRuleInput): Promise<RateRule> {
    try {
      const [created] = await this.db
        .insert(schema.rateRule)
        .values({ ...input, roomTypeId: input.roomTypeId ?? null })
        .returning();
      return toRateRule(created);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'A rate rule already exists for this listing/season/room type/occupancy band',
        );
      }
      throw error;
    }
  }

  async update(id: string, input: UpdateRateRuleInput): Promise<RateRule> {
    await this.findById(id);
    try {
      const [updated] = await this.db
        .update(schema.rateRule)
        .set(input)
        .where(eq(schema.rateRule.id, id))
        .returning();
      return toRateRule(updated);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'A rate rule already exists for this listing/season/room type/occupancy band',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.rateRule).where(eq(schema.rateRule.id, id));
  }
}
