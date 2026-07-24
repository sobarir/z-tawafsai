import type { Airline, Airport, Flight } from '@repo/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  emptyFlightFormValues,
  FlightForm,
  flightToFormValues,
} from './flight-form';

const messages = {
  common: { cancel: 'Cancel', save: 'Save', loading: 'Loading...' },
  schedule: {
    flights: {
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
      status: {
        ACTIVE: 'Active',
        SUSPENDED: 'Suspended',
        SEASONAL: 'Seasonal',
      },
    },
  },
};

const airlines: Airline[] = [
  {
    airlineCode: 'EK',
    icaoCode: 'UAE',
    name: 'Emirates',
    countryCode: 'AE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const airport = (airportCode: string, name: string): Airport => ({
  airportCode,
  icaoCode: null,
  name,
  cityCode: 'XXX',
  countryCode: 'ID',
  timezone: 'UTC',
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const airports: Airport[] = [
  airport('CGK', 'Soekarno-Hatta International'),
  airport('DXB', 'Dubai International Airport'),
];

/** A nonstop flight: no leg rows, route and times on the flight itself. */
const nonstopFlight: Flight = {
  id: '01KY5CRPBR6G3RQW7QCWNPEYC7',
  operatingAirline: 'EK',
  flightNumber: '357',
  originAirport: 'CGK',
  destAirport: 'DXB',
  departureTimeLocal: '17:55',
  arrivalTimeLocal: '22:55',
  arrivalDayOffset: 0,
  aircraftType: null,
  status: 'ACTIVE',
  price: 340,
  currency: 'USD',
  legs: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const renderForm = (ui: ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe('FlightForm', () => {
  // Regression: `useFieldArray` materialises `legs` as `[]` even while the
  // multi-leg editor is off, and the schema's `.min(2)` rejected it — with no
  // field to render the array-root error into, Save silently did nothing.
  it('submits a nonstop edit with no legs', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm(
      <FlightForm
        mode="edit"
        airports={airports}
        airlines={airlines}
        defaultValues={flightToFormValues(nonstopFlight)}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          operatingAirline: 'EK',
          flightNumber: '357',
          originAirport: 'CGK',
          destAirport: 'DXB',
          price: 340,
          legs: undefined,
        }),
      );
    });
  });

  it('submits a newly created nonstop flight', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm(
      <FlightForm
        mode="create"
        airports={airports}
        airlines={airlines}
        defaultValues={emptyFlightFormValues}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
      />,
    );

    const [airline, origin, dest] = screen.getAllByRole('combobox');
    fireEvent.click(airline as HTMLElement);
    fireEvent.click(screen.getByRole('option', { name: 'EK — Emirates' }));
    fireEvent.click(origin as HTMLElement);
    fireEvent.click(
      screen.getByRole('option', {
        name: 'CGK — Soekarno-Hatta International',
      }),
    );
    fireEvent.click(dest as HTMLElement);
    fireEvent.click(
      screen.getByRole('option', { name: 'DXB — Dubai International Airport' }),
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. 874'), {
      target: { value: '357' },
    });
    fireEvent.change(screen.getByLabelText('Departure time'), {
      target: { value: '17:55' },
    });
    fireEvent.change(screen.getByLabelText('Arrival time'), {
      target: { value: '22:55' },
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '340' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. USD'), {
      target: { value: 'usd' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          operatingAirline: 'EK',
          flightNumber: '357',
          originAirport: 'CGK',
          destAirport: 'DXB',
          departureTimeLocal: '17:55',
          arrivalTimeLocal: '22:55',
          price: 340,
          currency: 'USD',
          legs: undefined,
        }),
      );
    });
  });
});
