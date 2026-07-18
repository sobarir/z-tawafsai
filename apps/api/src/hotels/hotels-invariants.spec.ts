import { createDb, schema } from '@repo/db';
import { eq } from 'drizzle-orm';
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
  it('every property has at least one room type', async () => {
    const properties = await db.select().from(schema.property);
    for (const property of properties) {
      const roomTypes = await db
        .select()
        .from(schema.roomType)
        .where(eq(schema.roomType.propertyCode, property.propertyCode));
      expect(roomTypes.length).toBeGreaterThan(0);
    }
  });

  it('every rate rule has a non-null room_type_id', async () => {
    const properties = await db.select().from(schema.property);
    for (const property of properties) {
      const rateRules = await db
        .select()
        .from(schema.rateRule)
        .where(eq(schema.rateRule.propertyCode, property.propertyCode));
      for (const rule of rateRules) {
        expect(rule.roomTypeId).not.toBeNull();
      }
    }
  });

  it('occupancy bands do not overlap within the same (property, season, room type)', async () => {
    const allRules = await db.select().from(schema.rateRule);
    const groups = new Map<string, typeof allRules>();
    for (const rule of allRules) {
      const key = `${rule.propertyCode}:${rule.seasonId}:${rule.roomTypeId}`;
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
