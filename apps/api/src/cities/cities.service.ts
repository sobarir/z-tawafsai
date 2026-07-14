import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type { City, CreateCityInput, UpdateCityInput } from '@repo/shared';
import { and, asc, eq, ne } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type CityRow = typeof schema.city.$inferSelect;

const toCity = (row: CityRow): City => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class CitiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<City[]> {
    const rows = await this.db
      .select()
      .from(schema.city)
      .orderBy(asc(schema.city.cityCode));
    return rows.map(toCity);
  }

  async findByCode(cityCode: string): Promise<City> {
    const [row] = await this.db
      .select()
      .from(schema.city)
      .where(eq(schema.city.cityCode, cityCode));
    if (!row) {
      throw new NotFoundException(`City ${cityCode} not found`);
    }
    return toCity(row);
  }

  async create(input: CreateCityInput): Promise<City> {
    const [existing] = await this.db
      .select({ cityCode: schema.city.cityCode })
      .from(schema.city)
      .where(eq(schema.city.cityCode, input.cityCode));
    if (existing) {
      throw new ConflictException(`City ${input.cityCode} already exists`);
    }
    const [nameTaken] = await this.db
      .select({ cityCode: schema.city.cityCode })
      .from(schema.city)
      .where(eq(schema.city.name, input.name));
    if (nameTaken) {
      throw new ConflictException(`City named "${input.name}" already exists`);
    }
    const [created] = await this.db
      .insert(schema.city)
      .values(input)
      .returning();
    return toCity(created);
  }

  async update(cityCode: string, input: UpdateCityInput): Promise<City> {
    await this.findByCode(cityCode);
    if (input.name) {
      const [nameTaken] = await this.db
        .select({ cityCode: schema.city.cityCode })
        .from(schema.city)
        .where(
          and(
            eq(schema.city.name, input.name),
            ne(schema.city.cityCode, cityCode),
          ),
        );
      if (nameTaken) {
        throw new ConflictException(
          `City named "${input.name}" already exists`,
        );
      }
    }
    const [updated] = await this.db
      .update(schema.city)
      .set(input)
      .where(eq(schema.city.cityCode, cityCode))
      .returning();
    return toCity(updated);
  }

  async remove(cityCode: string): Promise<void> {
    await this.findByCode(cityCode);
    await this.db.delete(schema.city).where(eq(schema.city.cityCode, cityCode));
  }
}
