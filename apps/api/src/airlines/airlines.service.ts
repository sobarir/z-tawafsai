import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  Airline,
  CreateAirlineInput,
  UpdateAirlineInput,
} from '@repo/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type AirlineRow = typeof schema.airlines.$inferSelect;

const toAirline = (row: AirlineRow): Airline => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class AirlinesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Airline[]> {
    const rows = await this.db
      .select()
      .from(schema.airlines)
      .orderBy(asc(schema.airlines.airlineCode));
    return rows.map(toAirline);
  }

  async findByCode(airlineCode: string): Promise<Airline> {
    const [row] = await this.db
      .select()
      .from(schema.airlines)
      .where(eq(schema.airlines.airlineCode, airlineCode));
    if (!row) {
      throw new NotFoundException(`Airline ${airlineCode} not found`);
    }
    return toAirline(row);
  }

  async create(input: CreateAirlineInput): Promise<Airline> {
    const [existing] = await this.db
      .select({ airlineCode: schema.airlines.airlineCode })
      .from(schema.airlines)
      .where(eq(schema.airlines.airlineCode, input.airlineCode));
    if (existing) {
      throw new ConflictException(
        `Airline ${input.airlineCode} already exists`,
      );
    }
    const [created] = await this.db
      .insert(schema.airlines)
      .values(input)
      .returning();
    return toAirline(created);
  }

  async update(
    airlineCode: string,
    input: UpdateAirlineInput,
  ): Promise<Airline> {
    await this.findByCode(airlineCode);
    const [updated] = await this.db
      .update(schema.airlines)
      .set(input)
      .where(eq(schema.airlines.airlineCode, airlineCode))
      .returning();
    return toAirline(updated);
  }

  async remove(airlineCode: string): Promise<void> {
    await this.findByCode(airlineCode);
    await this.db
      .delete(schema.airlines)
      .where(eq(schema.airlines.airlineCode, airlineCode));
  }
}
