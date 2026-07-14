import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateCurrencyInput,
  Currency,
  UpdateCurrencyInput,
} from '@repo/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type CurrencyRow = typeof schema.currency.$inferSelect;

const toCurrency = (row: CurrencyRow): Currency => ({ ...row });

@Injectable()
export class HotelCurrenciesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Currency[]> {
    const rows = await this.db
      .select()
      .from(schema.currency)
      .orderBy(asc(schema.currency.code));
    return rows.map(toCurrency);
  }

  async findByCode(code: string): Promise<Currency> {
    const [row] = await this.db
      .select()
      .from(schema.currency)
      .where(eq(schema.currency.code, code));
    if (!row) {
      throw new NotFoundException(`Currency ${code} not found`);
    }
    return toCurrency(row);
  }

  async create(input: CreateCurrencyInput): Promise<Currency> {
    const [existing] = await this.db
      .select({ code: schema.currency.code })
      .from(schema.currency)
      .where(eq(schema.currency.code, input.code));
    if (existing) {
      throw new ConflictException(`Currency ${input.code} already exists`);
    }
    const [created] = await this.db
      .insert(schema.currency)
      .values(input)
      .returning();
    return toCurrency(created);
  }

  async update(code: string, input: UpdateCurrencyInput): Promise<Currency> {
    await this.findByCode(code);
    const [updated] = await this.db
      .update(schema.currency)
      .set(input)
      .where(eq(schema.currency.code, code))
      .returning();
    return toCurrency(updated);
  }

  async remove(code: string): Promise<void> {
    await this.findByCode(code);
    await this.db.delete(schema.currency).where(eq(schema.currency.code, code));
  }
}
