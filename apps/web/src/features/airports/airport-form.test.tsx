import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AirportForm } from './airport-form';

const messages = {
  common: { cancel: 'Cancel', save: 'Save', loading: 'Loading...' },
  schedule: {
    airports: {
      fields: {
        airportCode: 'IATA code',
        airportCodePlaceholder: 'e.g. JFK',
        icaoCode: 'ICAO code',
        icaoCodePlaceholder: 'e.g. KJFK',
        name: 'Name',
        namePlaceholder: 'e.g. John F. Kennedy International',
        cityCode: 'City code',
        cityCodePlaceholder: 'e.g. NYC',
        countryCode: 'Country code',
        countryCodePlaceholder: 'e.g. US',
        timezone: 'Timezone',
        timezonePlaceholder: 'e.g. America/New_York',
        latitude: 'Latitude',
        longitude: 'Longitude',
      },
    },
  },
};

const cityOptions = [{ value: 'NYC', label: 'NYC — New York' }];

const renderForm = (ui: ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe('AirportForm', () => {
  it('rejects submission when required fields are missing', async () => {
    const onSubmit = vi.fn();
    renderForm(
      <AirportForm
        cityOptions={cityOptions}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('submits the entered values when the form is valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderForm(
      <AirportForm
        cityOptions={cityOptions}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        submitting={false}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('e.g. JFK'), {
      target: { value: 'jfk' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('e.g. John F. Kennedy International'),
      { target: { value: 'John F. Kennedy International' } },
    );
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'NYC — New York' }));
    fireEvent.change(screen.getByPlaceholderText('e.g. US'), {
      target: { value: 'us' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. America/New_York'), {
      target: { value: 'America/New_York' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          airportCode: 'JFK',
          cityCode: 'NYC',
          countryCode: 'US',
          timezone: 'America/New_York',
        }),
      );
    });
  });

  it('disables the natural-key field when editing an existing airport', () => {
    renderForm(
      <AirportForm
        cityOptions={cityOptions}
        airport={{
          airportCode: 'JFK',
          icaoCode: 'KJFK',
          name: 'John F. Kennedy International',
          cityCode: 'NYC',
          countryCode: 'US',
          timezone: 'America/New_York',
          latitude: 40.64,
          longitude: -73.78,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitting={false}
      />,
    );

    expect(screen.getByDisplayValue('JFK')).toBeDisabled();
  });
});
