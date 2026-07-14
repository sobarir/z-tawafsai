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

type ListingRow = typeof schema.listing.$inferSelect;
type PropertyRow = typeof schema.property.$inferSelect;

const toProperty = (
  listingRow: ListingRow,
  propertyRow: PropertyRow,
): Property => ({
  propertyCode: propertyRow.propertyCode,
  listingId: listingRow.id,
  starRating: propertyRow.starRating,
  address: propertyRow.address,
  displayName: listingRow.displayName,
  destination: listingRow.destination,
  countryCode: listingRow.countryCode,
  heroImageUrl: listingRow.heroImageUrl,
  isActive: listingRow.isActive,
  createdAt: listingRow.createdAt.toISOString(),
});

/**
 * A property is a `listing` (kind='property') 1:1 with a `property` row —
 * always read/written together, never as two separate admin screens. See
 * /prd/hotels/11-data-model.md.
 */
@Injectable()
export class HotelPropertiesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Property[]> {
    const rows = await this.db
      .select({ listing: schema.listing, property: schema.property })
      .from(schema.property)
      .innerJoin(
        schema.listing,
        eq(schema.property.listingId, schema.listing.id),
      );
    return rows.map((row) => toProperty(row.listing, row.property));
  }

  private async findRows(
    propertyCode: string,
  ): Promise<{ listing: ListingRow; property: PropertyRow }> {
    const [row] = await this.db
      .select({ listing: schema.listing, property: schema.property })
      .from(schema.property)
      .innerJoin(
        schema.listing,
        eq(schema.property.listingId, schema.listing.id),
      )
      .where(eq(schema.property.propertyCode, propertyCode));
    if (!row) {
      throw new NotFoundException(`Property ${propertyCode} not found`);
    }
    return row;
  }

  async findByCode(propertyCode: string): Promise<Property> {
    const { listing, property } = await this.findRows(propertyCode);
    return toProperty(listing, property);
  }

  async create(input: CreatePropertyInput): Promise<Property> {
    const [existing] = await this.db
      .select({ propertyCode: schema.property.propertyCode })
      .from(schema.property)
      .where(eq(schema.property.propertyCode, input.propertyCode));
    if (existing) {
      throw new ConflictException(
        `Property ${input.propertyCode} already exists`,
      );
    }

    return this.db.transaction(async (tx) => {
      const [listingRow] = await tx
        .insert(schema.listing)
        .values({
          kind: 'property',
          displayName: input.displayName,
          destination: input.destination,
          countryCode: input.countryCode,
          heroImageUrl: input.heroImageUrl ?? null,
          isActive: input.isActive ?? true,
        })
        .returning();
      const [propertyRow] = await tx
        .insert(schema.property)
        .values({
          propertyCode: input.propertyCode,
          listingId: listingRow.id,
          starRating: input.starRating ?? null,
          address: input.address ?? null,
        })
        .returning();
      return toProperty(listingRow, propertyRow);
    });
  }

  async update(
    propertyCode: string,
    input: UpdatePropertyInput,
  ): Promise<Property> {
    const { listing, property } = await this.findRows(propertyCode);

    return this.db.transaction(async (tx) => {
      let updatedListing = listing;
      if (
        input.displayName !== undefined ||
        input.destination !== undefined ||
        input.countryCode !== undefined ||
        input.heroImageUrl !== undefined ||
        input.isActive !== undefined
      ) {
        const [row] = await tx
          .update(schema.listing)
          .set({
            displayName: input.displayName,
            destination: input.destination,
            countryCode: input.countryCode,
            heroImageUrl: input.heroImageUrl,
            isActive: input.isActive,
          })
          .where(eq(schema.listing.id, listing.id))
          .returning();
        updatedListing = row;
      }

      let updatedProperty = property;
      if (input.starRating !== undefined || input.address !== undefined) {
        const [row] = await tx
          .update(schema.property)
          .set({ starRating: input.starRating, address: input.address })
          .where(eq(schema.property.propertyCode, propertyCode))
          .returning();
        updatedProperty = row;
      }

      return toProperty(updatedListing, updatedProperty);
    });
  }

  async remove(propertyCode: string): Promise<void> {
    const { listing } = await this.findRows(propertyCode);
    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.property)
        .where(eq(schema.property.propertyCode, propertyCode));
      await tx.delete(schema.listing).where(eq(schema.listing.id, listing.id));
    });
  }
}
