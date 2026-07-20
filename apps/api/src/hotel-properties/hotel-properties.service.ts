import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreatePropertyInput,
  Property,
  UpdatePropertyInput,
} from '@repo/shared';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type PropertyRow = typeof schema.property.$inferSelect;

const toProperty = (row: PropertyRow): Property => ({
  propertyCode: row.propertyCode,
  type: row.type,
  starRating: row.starRating,
  address: row.address,
  displayName: row.displayName,
  destination: row.destination,
  countryCode: row.countryCode,
  heroImageUrl: row.heroImageUrl,
  distanceMeters: row.distanceMeters,
  distanceNote: row.distanceNote,
  contactPhone: row.contactPhone,
  contactEmail: row.contactEmail,
  isActive: row.isActive,
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class HotelPropertiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Property[]> {
    const rows = await this.db.select().from(schema.property);
    return rows.map(toProperty);
  }

  async findByCode(propertyCode: string): Promise<Property> {
    const [row] = await this.db
      .select()
      .from(schema.property)
      .where(eq(schema.property.propertyCode, propertyCode));
    if (!row) {
      throw new NotFoundException(`Property ${propertyCode} not found`);
    }
    return toProperty(row);
  }

  async create(input: CreatePropertyInput): Promise<Property> {


    const [row] = await this.db
      .insert(schema.property)
      .values({
        type: input.type,
        starRating: input.starRating ?? null,
        address: input.address ?? null,
        displayName: input.displayName,
        destination: input.destination,
        countryCode: input.countryCode,
        heroImageUrl: input.heroImageUrl ?? null,
        distanceMeters: input.distanceMeters ?? null,
        distanceNote: input.distanceNote ?? null,
        contactPhone: input.contactPhone ?? null,
        contactEmail: input.contactEmail ?? null,
        isActive: input.isActive ?? true,
      })
      .returning();
    return toProperty(row);
  }

  async update(
    propertyCode: string,
    input: UpdatePropertyInput,
  ): Promise<Property> {
    await this.findByCode(propertyCode);

    const [row] = await this.db
      .update(schema.property)
      .set(input)
      .where(eq(schema.property.propertyCode, propertyCode))
      .returning();
    return toProperty(row);
  }

  async remove(propertyCode: string): Promise<void> {
    await this.findByCode(propertyCode);
    await this.db
      .delete(schema.property)
      .where(eq(schema.property.propertyCode, propertyCode));
  }
}
