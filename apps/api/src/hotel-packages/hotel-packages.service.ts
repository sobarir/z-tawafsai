import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Database } from '@repo/db';
import { schema } from '@repo/db';
import type {
  CreatePackageInput,
  Package,
  UpdatePackageInput,
} from '@repo/shared';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.module';

type ListingRow = typeof schema.listing.$inferSelect;
type TravelPackageRow = typeof schema.travelPackage.$inferSelect;

const toPackage = (
  listingRow: ListingRow,
  packageRow: TravelPackageRow,
): Package => ({
  packageCode: packageRow.packageCode,
  listingId: listingRow.id,
  durationNights: packageRow.durationNights,
  includes: packageRow.includes,
  displayName: listingRow.displayName,
  destination: listingRow.destination,
  countryCode: listingRow.countryCode,
  heroImageUrl: listingRow.heroImageUrl,
  isActive: listingRow.isActive,
  createdAt: listingRow.createdAt.toISOString(),
});

/**
 * A package is a `listing` (kind='package') 1:1 with a `package` row —
 * always read/written together, never as two separate admin screens. See
 * /prd/hotels/11-data-model.md.
 */
@Injectable()
export class HotelPackagesService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async list(): Promise<Package[]> {
    const rows = await this.db
      .select({ listing: schema.listing, travelPackage: schema.travelPackage })
      .from(schema.travelPackage)
      .innerJoin(
        schema.listing,
        eq(schema.travelPackage.listingId, schema.listing.id),
      );
    return rows.map((row) => toPackage(row.listing, row.travelPackage));
  }

  private async findRows(
    packageCode: string,
  ): Promise<{ listing: ListingRow; travelPackage: TravelPackageRow }> {
    const [row] = await this.db
      .select({ listing: schema.listing, travelPackage: schema.travelPackage })
      .from(schema.travelPackage)
      .innerJoin(
        schema.listing,
        eq(schema.travelPackage.listingId, schema.listing.id),
      )
      .where(eq(schema.travelPackage.packageCode, packageCode));
    if (!row) {
      throw new NotFoundException(`Package ${packageCode} not found`);
    }
    return row;
  }

  async findByCode(packageCode: string): Promise<Package> {
    const { listing, travelPackage } = await this.findRows(packageCode);
    return toPackage(listing, travelPackage);
  }

  async create(input: CreatePackageInput): Promise<Package> {
    const [existing] = await this.db
      .select({ packageCode: schema.travelPackage.packageCode })
      .from(schema.travelPackage)
      .where(eq(schema.travelPackage.packageCode, input.packageCode));
    if (existing) {
      throw new ConflictException(
        `Package ${input.packageCode} already exists`,
      );
    }

    return this.db.transaction(async (tx) => {
      const [listingRow] = await tx
        .insert(schema.listing)
        .values({
          kind: 'package',
          displayName: input.displayName,
          destination: input.destination,
          countryCode: input.countryCode,
          heroImageUrl: input.heroImageUrl ?? null,
          isActive: input.isActive ?? true,
        })
        .returning();
      const [packageRow] = await tx
        .insert(schema.travelPackage)
        .values({
          packageCode: input.packageCode,
          listingId: listingRow.id,
          durationNights: input.durationNights,
          includes: input.includes ?? null,
        })
        .returning();
      return toPackage(listingRow, packageRow);
    });
  }

  async update(
    packageCode: string,
    input: UpdatePackageInput,
  ): Promise<Package> {
    const { listing, travelPackage } = await this.findRows(packageCode);

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

      let updatedPackage = travelPackage;
      if (input.durationNights !== undefined || input.includes !== undefined) {
        const [row] = await tx
          .update(schema.travelPackage)
          .set({
            durationNights: input.durationNights,
            includes: input.includes,
          })
          .where(eq(schema.travelPackage.packageCode, packageCode))
          .returning();
        updatedPackage = row;
      }

      return toPackage(updatedListing, updatedPackage);
    });
  }

  async remove(packageCode: string): Promise<void> {
    const { listing } = await this.findRows(packageCode);
    await this.db.transaction(async (tx) => {
      await tx
        .delete(schema.travelPackage)
        .where(eq(schema.travelPackage.packageCode, packageCode));
      await tx.delete(schema.listing).where(eq(schema.listing.id, listing.id));
    });
  }
}
