import type { Airline, Airport, CreateFlightInput } from '@repo/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, type Mock, vi } from 'vitest';
import { FlightForm } from './flight-form';

const messages = {
  common: { cancel: 'Cancel', save: 'Save' },
  schedule: {
    flights: {
      status: {
        ACTIVE: 'Active',
        SUSPENDED: 'Suspended',
        SEASONAL: 'Seasonal',
      },
      fields: {
        operatingAirline: 'Operating airline',
        flightNumber: 'Flight number',
        flightNumberPlaceholder: 'e.g. 874',
        originAirport: 'Origin airport',
        destAirport: 'Destination airport',
        departureTime: 'Departure time',
        arrivalTime: 'Arrival time',
        aircraftType: 'Aircraft type',
        aircraftTypePlaceholder: 'e.g. B738',
        price: 'Price',
        currency: 'Currency',
        currencyPlaceholder: 'e.g. USD',
        status: 'Status',
        multiLeg: 'Technical stop (multiple legs)',
        legDepAirport: 'Leg departure',
        legArrAirport: 'Leg arrival',
        legDeparture: 'Leg departure time',
        legArrival: 'Leg arrival time',
        addLeg: 'Add leg',
        removeLeg: 'Remove leg',
        departureDayOffset: '+ Days (Dep)',
        arrivalDayOffset: '+ Days (Arr)',
      },
    },
  },
};

const airports: Airport[] = ['DXB', 'JED', 'RUH'].map((code) => ({
  airportCode: code,
  icaoCode: null,
  name: `${code} Airport`,
  cityCode: code,
  countryCode: 'AE',
  timezone: 'Asia/Dubai',
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}));

const airlines: Airline[] = [
  {
    airlineCode: 'EK',
    icaoCode: null,
    name: 'Emirates',
    countryCode: 'AE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

/** A complete nonstop flight — `legs` omitted, as the contract expects. */
const nonstopValues: CreateFlightInput = {
  operatingAirline: 'EK',
  flightNumber: '9911',
  originAirport: 'DXB',
  destAirport: 'JED',
  departureTimeLocal: '08:30',
  arrivalTimeLocal: '10:45',
  arrivalDayOffset: 0,
  aircraftType: undefined,
  status: 'ACTIVE',
  price: 500,
  currency: 'USD',
  legs: undefined,
};

type SubmitMock = Mock<(values: CreateFlightInput) => Promise<void>>;

const renderForm = (
  onSubmit: SubmitMock,
  defaultValues: CreateFlightInput = nonstopValues,
) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FlightForm
        mode="create"
        airports={airports}
        airlines={airlines}
        defaultValues={defaultValues}
        submitting={false}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />
    </NextIntlClientProvider>,
  );

describe('FlightForm', () => {
  // Regression: useFieldArray materializes the undefined `legs` default as `[]`,
  // which the contract's `.min(2)` rejected at the `legs` root — a path with no
  // FormMessage, so Save silently did nothing on every nonstop flight.
  it('submits a nonstop flight with no legs', async () => {
    const onSubmit: SubmitMock = vi.fn().mockResolvedValue(undefined);
    renderForm(onSubmit);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          operatingAirline: 'EK',
          flightNumber: '9911',
          originAirport: 'DXB',
          destAirport: 'JED',
        }),
      );
    });
    expect(onSubmit.mock.calls[0]?.[0].legs).toBeUndefined();
  });

  it('keeps the legs of a technical-stop flight', async () => {
    const onSubmit: SubmitMock = vi.fn().mockResolvedValue(undefined);
    renderForm(onSubmit, {
      ...nonstopValues,
      legs: [
        {
          depAirport: 'DXB',
          arrAirport: 'RUH',
          departureTimeLocal: '08:30',
          arrivalTimeLocal: '09:30',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
        {
          depAirport: 'RUH',
          arrAirport: 'JED',
          departureTimeLocal: '10:00',
          arrivalTimeLocal: '10:45',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0].legs).toHaveLength(2);
  });
});
