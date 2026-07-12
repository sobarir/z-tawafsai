import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { FlightsService } from '../flights/flights.service';
import { FlightMarketingService } from './flight-marketing.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const flights = new FlightsService(db);
const service = new FlightMarketingService(db, flights);

// A flight number not used by prd/15-seed-data.md, so tests never collide with seeded rows.
const TEST_NUMBER = '998';
const TEST_AIRLINE = 'GA';

async function cleanup() {
  await db
    .delete(schema.flights)
    .where(
      and(
        eq(schema.flights.operatingAirline, TEST_AIRLINE),
        eq(schema.flights.flightNumber, TEST_NUMBER),
      ),
    );
}

async function createTestFlight() {
  return flights.create({
    operatingAirline: TEST_AIRLINE,
    flightNumber: TEST_NUMBER,
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-08-01T01:00:00+07:00',
    arrivalTime: '2026-08-01T10:00:00+09:00',
  });
}

describe('FlightMarketingService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('rejects an operating-carrier row whose airline does not match the flight', async () => {
    const flight = await createTestFlight();
    await expect(
      service.create({
        flightId: flight.id,
        marketingAirline: 'NH',
        marketingNumber: '1',
        isOperatingCarrier: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a second operating-carrier row for the same flight', async () => {
    const flight = await createTestFlight();
    await service.create({
      flightId: flight.id,
      marketingAirline: TEST_AIRLINE,
      marketingNumber: TEST_NUMBER,
      isOperatingCarrier: true,
    });

    await expect(
      service.create({
        flightId: flight.id,
        marketingAirline: TEST_AIRLINE,
        marketingNumber: '997',
        isOperatingCarrier: true,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects a duplicate (airline, number, flight) marketing row', async () => {
    const flight = await createTestFlight();
    await service.create({
      flightId: flight.id,
      marketingAirline: 'NH',
      marketingNumber: '1',
    });

    await expect(
      service.create({
        flightId: flight.id,
        marketingAirline: 'NH',
        marketingNumber: '1',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('resolves a codeshare marketing number to the one operating flight (S10)', async () => {
    const flight = await createTestFlight();
    await service.create({
      flightId: flight.id,
      marketingAirline: TEST_AIRLINE,
      marketingNumber: TEST_NUMBER,
      isOperatingCarrier: true,
    });
    await service.create({
      flightId: flight.id,
      marketingAirline: 'NH',
      marketingNumber: '996',
    });
    await service.create({
      flightId: flight.id,
      marketingAirline: 'KL',
      marketingNumber: '995',
    });

    const resolved = await service.resolveOperatingFlight('NH', '996');
    expect(resolved.id).toBe(flight.id);
    expect(resolved.operatingAirline).toBe(TEST_AIRLINE);

    const resolvedByOwnNumber = await service.resolveOperatingFlight(
      TEST_AIRLINE,
      TEST_NUMBER,
    );
    expect(resolvedByOwnNumber.id).toBe(flight.id);

    const flightRows = await db
      .select()
      .from(schema.flights)
      .where(eq(schema.flights.id, flight.id));
    expect(flightRows).toHaveLength(1);
  });

  it('throws NotFoundException resolving an unknown marketing number', async () => {
    await expect(service.resolveOperatingFlight('ZZ', '0000')).rejects.toThrow(
      NotFoundException,
    );
  });
});
