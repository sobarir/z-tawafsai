import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateFxRateInput,
  FxRate,
  UpdateFxRateInput,
} from '@repo/shared';
import { and, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type FxRateRow = typeof schema.fxRate.$inferSelect;

const toFxRate = (row: FxRateRow): FxRate => ({
  ...row,
  asOf: row.asOf.toISOString(),
});

@Injectable()
export class HotelFxRatesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<FxRate[]> {
    const rows = await this.db.select().from(schema.fxRate);
    return rows.map(toFxRate);
  }

  async findById(id: string): Promise<FxRate> {
    const [row] = await this.db
      .select()
      .from(schema.fxRate)
      .where(eq(schema.fxRate.id, id));
    if (!row) {
      throw new NotFoundException(`FX rate ${id} not found`);
    }
    return toFxRate(row);
  }

  async create(input: CreateFxRateInput): Promise<FxRate> {
    const [existing] = await this.db
      .select({ id: schema.fxRate.id })
      .from(schema.fxRate)
      .where(
        and(
          eq(schema.fxRate.baseCurrency, input.baseCurrency),
          eq(schema.fxRate.quoteCurrency, input.quoteCurrency),
        ),
      );
    if (existing) {
      throw new ConflictException(
        `FX rate ${input.baseCurrency}->${input.quoteCurrency} already exists`,
      );
    }
    const [created] = await this.db
      .insert(schema.fxRate)
      .values({ ...input, asOf: new Date(input.asOf) })
      .returning();
    return toFxRate(created);
  }

  async update(id: string, input: UpdateFxRateInput): Promise<FxRate> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.fxRate)
      .set({ ...input, asOf: input.asOf ? new Date(input.asOf) : undefined })
      .where(eq(schema.fxRate.id, id))
      .returning();
    return toFxRate(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.db.delete(schema.fxRate).where(eq(schema.fxRate.id, id));
  }
}
