import { createDb, schema } from '@repo/db';
import { and, eq, isNull } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

/**
 * Cross-entity invariants from prd/hotels/11-data-model.md that aren't
 * FK-expressible in Postgres — asserted here instead, against the live seed.
 */

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);

describe('hotel data-model invariants', () => {
  it('every property listing has at least one room type', async () => {
    const properties = await db.select().from(schema.property);
    for (const property of properties) {
      const roomTypes = await db
        .select()
        .from(schema.roomType)
        .where(eq(schema.roomType.propertyCode, property.propertyCode));
      expect(roomTypes.length).toBeGreaterThan(0);
    }
  });

  it('every rate rule under a property listing has a non-null room_type_id', async () => {
    const properties = await db.select().from(schema.property);
    for (const property of properties) {
      const rateRules = await db
        .select()
        .from(schema.rateRule)
        .where(eq(schema.rateRule.listingId, property.listingId));
      for (const rule of rateRules) {
        expect(rule.roomTypeId).not.toBeNull();
      }
    }
  });

  it('every rate rule under a package listing has a null room_type_id', async () => {
    const packages = await db.select().from(schema.travelPackage);
    for (const pkg of packages) {
      const rateRules = await db
        .select()
        .from(schema.rateRule)
        .where(eq(schema.rateRule.listingId, pkg.listingId));
      for (const rule of rateRules) {
        expect(rule.roomTypeId).toBeNull();
      }
      // Also confirms the partial-unique index's predicate is meaningful:
      // there IS at least one null-room_type_id row per package.
      const nullRoomTypeRules = await db
        .select()
        .from(schema.rateRule)
        .where(
          and(
            eq(schema.rateRule.listingId, pkg.listingId),
            isNull(schema.rateRule.roomTypeId),
          ),
        );
      expect(nullRoomTypeRules.length).toBeGreaterThan(0);
    }
  });

  it('occupancy bands do not overlap within the same (listing, season, room type)', async () => {
    const allRules = await db.select().from(schema.rateRule);
    const groups = new Map<string, typeof allRules>();
    for (const rule of allRules) {
      const key = `${rule.listingId}:${rule.seasonId}:${rule.roomTypeId ?? 'null'}`;
      const group = groups.get(key) ?? [];
      group.push(rule);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      const sorted = [...group].sort((a, b) => a.minOccupancy - b.minOccupancy);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].minOccupancy).toBeGreaterThan(
          sorted[i - 1].maxOccupancy,
        );
      }
    }
  });
});
