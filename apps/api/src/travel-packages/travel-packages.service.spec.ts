import { NotFoundException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { TravelPackagesService } from './travel-packages.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new TravelPackagesService(db);

// The seeded GA402 CGK->JED flight and Jeddah Waterfront Hotel property —
// real FK anchors so tests don't need to seed their own flight/property.
const TEST_PROPERTY_CODE = 'JED-WFH';
let testFlightId: string;

const TEST_TITLE = '__test__ travel package';

async function cleanup() {
  await db
    .delete(schema.flightHotelPackage)
    .where(eq(schema.flightHotelPackage.title, TEST_TITLE));
}

describe('TravelPackagesService', () => {
  beforeAll(async () => {
    const [flight] = await db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.operatingAirline, 'GA'),
          eq(schema.flights.flightNumber, '402'),
        ),
      );
    if (!flight) {
      throw new Error('Seed data missing: GA402 flight not found');
    }
    testFlightId = flight.id;
  });

  beforeEach(cleanup);
  afterAll(cleanup);

  it('creates, reads, updates, and deletes a travel package', async () => {
    const created = await service.create({
      title: TEST_TITLE,
      flightId: testFlightId,
      propertyCode: TEST_PROPERTY_CODE,
      durationNights: 3,
      price: 999,
      currency: 'USD',
    });
    expect(created.title).toBe(TEST_TITLE);
    expect(created.flight.id).toBe(testFlightId);
    expect(created.property.propertyCode).toBe(TEST_PROPERTY_CODE);

    const fetched = await service.findById(created.id);
    expect(fetched.durationNights).toBe(3);

    const updated = await service.update(created.id, { price: 1050 });
    expect(updated.price).toBe(1050);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws NotFoundException for a missing id', async () => {
    await expect(
      service.findById('01ARZ3NDEKTSV4RRFFQ69G5FAV'),
    ).rejects.toThrow(NotFoundException);
  });
});
