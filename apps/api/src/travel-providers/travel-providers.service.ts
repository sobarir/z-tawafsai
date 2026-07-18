import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreateTravelProviderInput,
  TravelProvider,
  UpdateTravelProviderInput,
} from '@repo/shared';
import { asc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type TravelProviderRow = typeof schema.travelProvider.$inferSelect;

const toProvider = (row: TravelProviderRow): TravelProvider => ({
  ...row,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

@Injectable()
export class TravelProvidersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<TravelProvider[]> {
    const rows = await this.db
      .select()
      .from(schema.travelProvider)
      .orderBy(asc(schema.travelProvider.name));
    return rows.map(toProvider);
  }

  async findById(id: string): Promise<TravelProvider> {
    const [row] = await this.db
      .select()
      .from(schema.travelProvider)
      .where(eq(schema.travelProvider.id, id));
    if (!row) {
      throw new NotFoundException(`Travel provider ${id} not found`);
    }
    return toProvider(row);
  }

  async create(input: CreateTravelProviderInput): Promise<TravelProvider> {
    const [created] = await this.db
      .insert(schema.travelProvider)
      .values({
        name: input.name,
        licenseNumber: input.licenseNumber ?? null,
        contactPhone: input.contactPhone ?? null,
        contactEmail: input.contactEmail ?? null,
        website: input.website ?? null,
        isActive: input.isActive ?? true,
      })
      .returning();
    return toProvider(created);
  }

  async update(
    id: string,
    input: UpdateTravelProviderInput,
  ): Promise<TravelProvider> {
    await this.findById(id);
    const [updated] = await this.db
      .update(schema.travelProvider)
      .set(input)
      .where(eq(schema.travelProvider.id, id))
      .returning();
    return toProvider(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    // travel_package.provider_id is ON DELETE set null — packages survive,
    // simply becoming unassigned.
    await this.db
      .delete(schema.travelProvider)
      .where(eq(schema.travelProvider.id, id));
  }
}
