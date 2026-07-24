import { BadRequestException, ConflictException } from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { ConnectionValidatorService } from './connection-validator.service';
import { buildFlightLegs, FlightsService } from './flights.service';

/** CGK 01:00 -> LHR 20:00, the shape both create and update pass in. */
const header = {
  originAirport: 'CGK',
  destAirport: 'LHR',
  departureTimeLocal: '01:00',
  arrivalTimeLocal: '20:00',
  arrivalDayOffset: 0,
};

const viaBangkok = [
  {
    depAirport: 'CGK',
    arrAirport: 'BKK',
    departureTimeLocal: '01:00',
    arrivalTimeLocal: '09:30',
    departureDayOffset: 0,
    arrivalDayOffset: 0,
  },
  {
    depAirport: 'BKK',
    arrAirport: 'LHR',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '20:00',
    departureDayOffset: 0,
    arrivalDayOffset: 0,
  },
];

describe('buildFlightLegs', () => {
  // A leg row exists only to describe a technical stop. A nonstop flight's route
  // and times already live on the flight itself, so synthesizing a leg spanning
  // it would store a copy of derived data that drifts when the flight is edited.
  it('stores no legs for a nonstop flight', () => {
    expect(buildFlightLegs({ ...header, legs: undefined })).toEqual([]);
    expect(buildFlightLegs({ ...header, legs: [] })).toEqual([]);
  });

  it('keeps the given legs for a technical stop', () => {
    expect(buildFlightLegs({ ...header, legs: viaBangkok })).toEqual(
      viaBangkok,
    );
  });

  it('rejects a first leg that does not depart the flight origin', () => {
    const legs = [{ ...viaBangkok[0], depAirport: 'SIN' }, viaBangkok[1]];
    expect(() => buildFlightLegs({ ...header, legs })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a last leg that does not arrive at the flight destination', () => {
    const legs = [viaBangkok[0], { ...viaBangkok[1], arrAirport: 'CDG' }];
    expect(() => buildFlightLegs({ ...header, legs })).toThrow(
      BadRequestException,
    );
  });

  it('rejects legs that do not connect to each other', () => {
    const legs = [viaBangkok[0], { ...viaBangkok[1], depAirport: 'SIN' }];
    expect(() => buildFlightLegs({ ...header, legs })).toThrow(
      BadRequestException,
    );
  });
});

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new FlightsService(db, new ConnectionValidatorService(db));

// A carrier + number the seed data never uses, so tests never collide with
// seeded rows.
const TEST_AIRLINE = 'EK';
const TEST_NUMBER = '9911';

const testFlight = {
  operatingAirline: TEST_AIRLINE,
  flightNumber: TEST_NUMBER,
  originAirport: 'DXB',
  destAirport: 'JED',
  departureTimeLocal: '08:30',
  arrivalTimeLocal: '10:45',
  arrivalDayOffset: 0,
  price: 500,
  currency: 'USD',
};

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

describe('FlightsService.create', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  // The unique index is (operating_airline, flight_number) with no time column,
  // so a second row at a different departure time is still a duplicate. The
  // conflict must surface as a 409, not as a raw unique violation from Postgres.
  it('rejects a duplicate carrier + flight number at a different departure time', async () => {
    await service.create(testFlight);

    await expect(
      service.create({ ...testFlight, departureTimeLocal: '19:15' }),
    ).rejects.toThrow(ConflictException);
  });
});
