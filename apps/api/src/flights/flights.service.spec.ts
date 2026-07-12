import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { createDb, schema } from '@repo/db';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { FlightsService } from './flights.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const service = new FlightsService(db);

// A flight number not used by prd/15-seed-data.md, so tests never collide with seeded rows.
const TEST_NUMBER = '999';
const TEST_AIRLINE = 'NH';

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

describe('FlightsService', () => {
  beforeEach(cleanup);
  afterAll(cleanup);

  it('auto-creates one FULL leg for a single-leg flight', async () => {
    const created = await service.create({
      operatingAirline: TEST_AIRLINE,
      flightNumber: TEST_NUMBER,
      originAirport: 'CGK',
      destAirport: 'NRT',
      departureTime: '2026-07-01T01:00:00+07:00',
      arrivalTime: '2026-07-01T10:00:00+09:00',
    });

    expect(created.legs).toHaveLength(1);
    expect(created.legs[0]).toMatchObject({
      legSequence: 1,
      role: 'FULL',
      depAirport: 'CGK',
      arrAirport: 'NRT',
    });
  });

  it('creates a technical-stop flight with contiguous legs (S7 shape)', async () => {
    const created = await service.create({
      operatingAirline: TEST_AIRLINE,
      flightNumber: TEST_NUMBER,
      originAirport: 'CGK',
      destAirport: 'LHR',
      departureTime: '2026-06-01T01:00:00+07:00',
      arrivalTime: '2026-06-01T20:00:00+01:00',
      legs: [
        {
          role: 'TECHNICAL_STOP',
          depAirport: 'CGK',
          arrAirport: 'BKK',
          departureTime: '2026-06-01T01:00:00+07:00',
          arrivalTime: '2026-06-01T04:15:00+07:00',
        },
        {
          role: 'TECHNICAL_STOP',
          depAirport: 'BKK',
          arrAirport: 'LHR',
          departureTime: '2026-06-01T05:30:00+07:00',
          arrivalTime: '2026-06-01T20:00:00+01:00',
        },
      ],
    });

    expect(created.legs).toHaveLength(2);
    expect(created.legs.map((leg) => leg.legSequence)).toEqual([1, 2]);

    const flightRows = await db
      .select()
      .from(schema.flights)
      .where(eq(schema.flights.id, created.id));
    expect(flightRows).toHaveLength(1);

    const legRows = await db
      .select()
      .from(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, created.id));
    expect(legRows).toHaveLength(2);
  });

  it('rejects a first leg that does not depart from the flight origin', async () => {
    await expect(
      service.create({
        operatingAirline: TEST_AIRLINE,
        flightNumber: TEST_NUMBER,
        originAirport: 'CGK',
        destAirport: 'LHR',
        departureTime: '2026-06-01T01:00:00+07:00',
        arrivalTime: '2026-06-01T20:00:00+01:00',
        legs: [
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'SIN',
            arrAirport: 'BKK',
            departureTime: '2026-06-01T01:00:00+07:00',
            arrivalTime: '2026-06-01T04:15:00+07:00',
          },
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'BKK',
            arrAirport: 'LHR',
            departureTime: '2026-06-01T05:30:00+07:00',
            arrivalTime: '2026-06-01T20:00:00+01:00',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a last leg that does not arrive at the flight destination', async () => {
    await expect(
      service.create({
        operatingAirline: TEST_AIRLINE,
        flightNumber: TEST_NUMBER,
        originAirport: 'CGK',
        destAirport: 'LHR',
        departureTime: '2026-06-01T01:00:00+07:00',
        arrivalTime: '2026-06-01T20:00:00+01:00',
        legs: [
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'CGK',
            arrAirport: 'BKK',
            departureTime: '2026-06-01T01:00:00+07:00',
            arrivalTime: '2026-06-01T04:15:00+07:00',
          },
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'BKK',
            arrAirport: 'CDG',
            departureTime: '2026-06-01T05:30:00+07:00',
            arrivalTime: '2026-06-01T20:00:00+02:00',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects non-contiguous legs', async () => {
    await expect(
      service.create({
        operatingAirline: TEST_AIRLINE,
        flightNumber: TEST_NUMBER,
        originAirport: 'CGK',
        destAirport: 'LHR',
        departureTime: '2026-06-01T01:00:00+07:00',
        arrivalTime: '2026-06-01T20:00:00+01:00',
        legs: [
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'CGK',
            arrAirport: 'SIN',
            departureTime: '2026-06-01T01:00:00+07:00',
            arrivalTime: '2026-06-01T02:15:00+08:00',
          },
          {
            role: 'TECHNICAL_STOP',
            depAirport: 'BKK',
            arrAirport: 'LHR',
            departureTime: '2026-06-01T05:30:00+07:00',
            arrivalTime: '2026-06-01T20:00:00+01:00',
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a duplicate flight (carrier + number + departure)', async () => {
    await service.create({
      operatingAirline: TEST_AIRLINE,
      flightNumber: TEST_NUMBER,
      originAirport: 'CGK',
      destAirport: 'NRT',
      departureTime: '2026-07-01T01:00:00+07:00',
      arrivalTime: '2026-07-01T10:00:00+09:00',
    });

    await expect(
      service.create({
        operatingAirline: TEST_AIRLINE,
        flightNumber: TEST_NUMBER,
        originAirport: 'CGK',
        destAirport: 'NRT',
        departureTime: '2026-07-01T01:00:00+07:00',
        arrivalTime: '2026-07-01T10:00:00+09:00',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('updates and deletes a flight, cascading to its legs', async () => {
    const created = await service.create({
      operatingAirline: TEST_AIRLINE,
      flightNumber: TEST_NUMBER,
      originAirport: 'CGK',
      destAirport: 'NRT',
      departureTime: '2026-07-01T01:00:00+07:00',
      arrivalTime: '2026-07-01T10:00:00+09:00',
    });

    const updated = await service.update(created.id, { status: 'SUSPENDED' });
    expect(updated.status).toBe('SUSPENDED');

    await service.remove(created.id);
    await expect(service.findById(created.id)).rejects.toThrow(
      NotFoundException,
    );

    const legRows = await db
      .select()
      .from(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, created.id));
    expect(legRows).toHaveLength(0);
  });
});
