import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { buildFlightLegs } from './flights.service';

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
