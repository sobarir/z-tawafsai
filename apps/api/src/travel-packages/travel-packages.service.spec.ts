import { BadRequestException, NotFoundException } from '@nestjs/common';
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
      type: 'umrah',
      title: TEST_TITLE,
      durationNights: 3,
      price: 999,
      currency: 'USD',
      stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
      departures: [{ flightId: testFlightId, returnDate: '2026-09-04' }],
      inclusions: [{ kind: 'included', label: 'Umrah visa' }],
    });
    expect(created.title).toBe(TEST_TITLE);
    expect(created.departures[0].flight.id).toBe(testFlightId);
    expect(created.stays).toHaveLength(1);
    expect(created.stays[0].propertyCode).toBe(TEST_PROPERTY_CODE);
    expect(created.inclusions[0].label).toBe('Umrah visa');
    expect(created.isFeatured).toBe(false);

    const fetched = await service.findById(created.id);
    expect(fetched.durationNights).toBe(3);

    const updated = await service.update(created.id, {
      price: 1050,
      isFeatured: true,
    });
    expect(updated.price).toBe(1050);
    expect(updated.isFeatured).toBe(true);

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejects a package whose stay nights do not sum to durationNights', async () => {
    await expect(
      service.create({
        type: 'umrah',
        title: TEST_TITLE,
        durationNights: 5,
        price: 999,
        currency: 'USD',
        stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
        departures: [{ flightId: testFlightId }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException for a missing id', async () => {
    await expect(
      service.findById('01ARZ3NDEKTSV4RRFFQ69G5FAV'),
    ).rejects.toThrow(NotFoundException);
  });

  it('tracks seat inventory: bookings decrement remaining, overbooking is rejected, cancelling frees seats', async () => {
    const pkg = await service.create({
      type: 'umrah',
      title: TEST_TITLE,
      durationNights: 3,
      price: 999,
      currency: 'USD',
      stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
      departures: [
        {
          flightId: testFlightId,
          returnDate: '2026-09-04',
          totalSeats: 5,
          availableSeats: 5,
        },
      ],
    });
    const departureId = pkg.departures[0].id;
    expect(pkg.departures[0].totalSeats).toBe(5);
    expect(pkg.departures[0].bookedSeats).toBe(0);
    expect(pkg.departures[0].availableSeats).toBe(5);

    const booking = await service.createBooking({
      departureId,
      customerName: 'Ahmad',
      pax: 3,
    });
    expect(booking.status).toBe('confirmed');

    const afterBooking = await service.findById(pkg.id);
    expect(afterBooking.departures[0].bookedSeats).toBe(3);
    expect(afterBooking.departures[0].availableSeats).toBe(2);

    // Only 2 seats left — a 3-pax booking overbooks and is rejected.
    await expect(
      service.createBooking({ departureId, customerName: 'Budi', pax: 3 }),
    ).rejects.toThrow(BadRequestException);

    // Cancelling frees the seats back to the quota.
    const cancelled = await service.updateBooking(booking.id, {
      status: 'cancelled',
    });
    expect(cancelled.status).toBe('cancelled');
    const afterCancel = await service.findById(pkg.id);
    expect(afterCancel.departures[0].bookedSeats).toBe(0);
    expect(afterCancel.departures[0].availableSeats).toBe(5);

    await service.removeBooking(booking.id);
    await expect(service.findBookingById(booking.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('leaves totalSeats null as untracked (no quota enforcement)', async () => {
    const pkg = await service.create({
      type: 'umrah',
      title: TEST_TITLE,
      durationNights: 3,
      price: 999,
      currency: 'USD',
      stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
      departures: [{ flightId: testFlightId }],
    });
    const departureId = pkg.departures[0].id;
    expect(pkg.departures[0].totalSeats).toBeNull();
    expect(pkg.departures[0].availableSeats).toBeNull();

    // No quota → any pax is accepted; bookedSeats still accumulates.
    await service.createBooking({
      departureId,
      customerName: 'Kholil',
      pax: 999,
    });
    const after = await service.findById(pkg.id);
    expect(after.departures[0].bookedSeats).toBe(999);
    expect(after.departures[0].availableSeats).toBeNull();
  });

  it('upserts departures by id so bookings survive a package update, and blocks removing a booked departure', async () => {
    const pkg = await service.create({
      type: 'umrah',
      title: TEST_TITLE,
      durationNights: 3,
      price: 999,
      currency: 'USD',
      stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
      departures: [
        { flightId: testFlightId, totalSeats: 10, availableSeats: 10 },
      ],
    });
    const departureId = pkg.departures[0].id;
    const booking = await service.createBooking({
      departureId,
      customerName: 'Siti',
      pax: 2,
    });

    // Re-send the departure by id: it keeps the same row (and its booking).
    const updated = await service.update(pkg.id, {
      price: 1200,
      departures: [
        {
          id: departureId,
          flightId: testFlightId,
          totalSeats: 10,
          availableSeats: 8,
        },
      ],
    });
    expect(updated.departures).toHaveLength(1);
    expect(updated.departures[0].id).toBe(departureId);
    expect(updated.departures[0].flight.id).toBe(testFlightId);
    expect(updated.departures[0].bookedSeats).toBe(2);
    expect((await service.findBookingById(booking.id)).id).toBe(booking.id);

    const list = await service.listBookings(departureId);
    expect(list).toHaveLength(1);
    expect(list[0].customerName).toBe('Siti');

    // Dropping the departure while it still has a booking is rejected.
    await expect(service.update(pkg.id, { departures: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('reports agent earnings per provider from confirmed bookings', async () => {
    const [provider] = await db
      .insert(schema.travelProvider)
      .values({ name: '__test__ provider' })
      .returning({ id: schema.travelProvider.id });
    try {
      const pkg = await service.create({
        type: 'umrah',
        title: TEST_TITLE,
        durationNights: 3,
        price: 999,
        currency: 'USD',
        providerId: provider.id,
        feePerSeat: 50,
        stays: [{ propertyCode: TEST_PROPERTY_CODE, sequence: 1, nights: 3 }],
        departures: [{ flightId: testFlightId, totalSeats: 20 }],
      });
      expect(pkg.providerId).toBe(provider.id);
      expect(pkg.providerName).toBe('__test__ provider');
      expect(pkg.feePerSeat).toBe(50);

      await service.createBooking({
        departureId: pkg.departures[0].id,
        customerName: 'Umar',
        pax: 3,
      });
      // Cancelled bookings must not count toward earnings.
      const cancelled = await service.createBooking({
        departureId: pkg.departures[0].id,
        customerName: 'Zaid',
        pax: 2,
      });
      await service.updateBooking(cancelled.id, { status: 'cancelled' });

      const earnings = await service.computeEarnings();
      const row = earnings.find((e) => e.providerId === provider.id);
      expect(row).toBeDefined();
      expect(row?.currency).toBe('USD');
      expect(row?.bookingCount).toBe(1);
      expect(row?.paxCount).toBe(3);
      expect(row?.packageCount).toBe(1);
      expect(row?.totalEarned).toBe(150); // 3 pax × 50
    } finally {
      // Package is cleaned up by TEST_TITLE; drop the provider (set-null on FK).
      await db
        .delete(schema.travelProvider)
        .where(eq(schema.travelProvider.id, provider.id));
    }
  });
});
