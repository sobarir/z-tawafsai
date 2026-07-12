import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  Airport,
  CreateAirportInput,
  UpdateAirportInput,
} from '@repo/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type AirportRow = typeof schema.airports.$inferSelect;

const toAirport = (row: AirportRow): Airport => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class AirportsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Airport[]> {
    const rows = await this.db
      .select()
      .from(schema.airports)
      .orderBy(asc(schema.airports.airportCode));
    return rows.map(toAirport);
  }

  async findByCode(airportCode: string): Promise<Airport> {
    const [row] = await this.db
      .select()
      .from(schema.airports)
      .where(eq(schema.airports.airportCode, airportCode));
    if (!row) {
      throw new NotFoundException(`Airport ${airportCode} not found`);
    }
    return toAirport(row);
  }

  async create(input: CreateAirportInput): Promise<Airport> {
    const [existing] = await this.db
      .select({ airportCode: schema.airports.airportCode })
      .from(schema.airports)
      .where(eq(schema.airports.airportCode, input.airportCode));
    if (existing) {
      throw new ConflictException(
        `Airport ${input.airportCode} already exists`,
      );
    }
    const [created] = await this.db
      .insert(schema.airports)
      .values(input)
      .returning();
    return toAirport(created);
  }

  async update(
    airportCode: string,
    input: UpdateAirportInput,
  ): Promise<Airport> {
    await this.findByCode(airportCode);
    const [updated] = await this.db
      .update(schema.airports)
      .set(input)
      .where(eq(schema.airports.airportCode, airportCode))
      .returning();
    return toAirport(updated);
  }

  async remove(airportCode: string): Promise<void> {
    await this.findByCode(airportCode);
    await this.db
      .delete(schema.airports)
      .where(eq(schema.airports.airportCode, airportCode));
  }
}
