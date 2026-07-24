import type { FlightHotelPackage } from '@repo/shared';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import enMessages from '../../../messages/en.json';
import { TravelPackageCard } from './travel-package-card';

type PackageDeparture = FlightHotelPackage['departures'][number];
type PackageFlight = PackageDeparture['outboundFlights'][number];

const directFlight: PackageFlight = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  operatingAirline: 'SV',
  airlineName: 'Saudia',
  flightNumber: '817',
  originAirport: 'CGK',
  destAirport: 'JED',
  departureTimeLocal: '09:00',
  arrivalTimeLocal: '15:30',
  arrivalDayOffset: 0,
  isDirect: true,
  transitAirport: null,
  transitCityName: null,
};

const departure: PackageDeparture = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FB0',
  outboundFlights: [directFlight],
  inboundFlights: [],
  departureDate: '2026-09-14',
  returnDate: '2026-09-23',
  seatsNote: null,
  totalSeats: 40,
  availableSeats: 12,
  bookedSeats: 4,
  price: 32_000_000,
  currency: 'IDR',
};

const basePackage: FlightHotelPackage = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  type: 'umrah',
  title: 'Umrah September',
  description: 'Nine nights, direct from Jakarta.',
  heroImageUrl: null,
  flyerUrl: null,
  providerId: null,
  providerName: null,
  feePerSeat: null,
  price: 32_000_000,
  currency: 'IDR',
  durationNights: 9,
  mealPlan: 'full_board',
  isActive: true,
  isFeatured: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  stays: [
    {
      cityCode: 'MAK',
      propertyCode: '01ARZ3NDEKTSV4RRFFQ69G5FB1',
      displayName: 'Swissotel Makkah',
      destination: 'Makkah',
      starRating: 5,
      distanceMeters: 300,
      distanceNote: 'Less than',
      sequence: 1,
      nights: 5,
    },
    {
      cityCode: 'MED',
      propertyCode: '01ARZ3NDEKTSV4RRFFQ69G5FB2',
      displayName: 'Saja Almadinah Hotel',
      destination: 'Madinah',
      starRating: 4,
      distanceMeters: 450,
      distanceNote: 'Approx.',
      sequence: 2,
      nights: 4,
    },
  ],
  departures: [departure],
  inclusions: [
    { kind: 'included', label: 'Visa and insurance' },
    { kind: 'excluded', label: 'Personal expenses' },
  ],
  itinerary: [],
};

const renderCard = (item: FlightHotelPackage) =>
  render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <TravelPackageCard item={item} locale="en" />
    </NextIntlClientProvider>,
  );

describe('TravelPackageCard', () => {
  it('renders the stays, departure and inclusions of a direct package', () => {
    renderCard(basePackage);

    expect(screen.getByText('Umrah September')).toBeInTheDocument();

    // Each stay carries its distance qualifier: "Less than" -> <, "Approx." -> ±.
    expect(screen.getByText('Swissotel Makkah')).toBeInTheDocument();
    expect(screen.getByText('< 300m')).toBeInTheDocument();
    expect(screen.getByText('Saja Almadinah Hotel')).toBeInTheDocument();
    expect(screen.getByText('± 450m')).toBeInTheDocument();

    expect(screen.getByText('Saudia')).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();

    // availableSeats - bookedSeats, shown alongside the departure date.
    expect(screen.getByText(/8 seats left/)).toBeInTheDocument();

    expect(screen.getByText('Visa and insurance')).toBeInTheDocument();
    expect(screen.getByText('Personal expenses')).toBeInTheDocument();
  });

  it('labels a transit flight with its transit city', () => {
    renderCard({
      ...basePackage,
      departures: [
        {
          ...departure,
          outboundFlights: [
            {
              ...directFlight,
              isDirect: false,
              transitAirport: 'KUL',
              transitCityName: 'Kuala Lumpur',
            },
          ],
        },
      ],
    });

    expect(
      screen.getByText('Transit in Kuala Lumpur (KUL)'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Direct')).not.toBeInTheDocument();
  });

  it('falls back to the seats note when the departure has no quota', () => {
    renderCard({
      ...basePackage,
      departures: [
        {
          ...departure,
          availableSeats: null,
          seatsNote: 'Ask for availability',
        },
      ],
    });

    expect(screen.getByText(/Ask for availability/)).toBeInTheDocument();
  });
});
