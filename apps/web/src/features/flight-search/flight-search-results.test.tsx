import type { ConnectionResult, Flight, FlightItinerary } from '@repo/shared';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { FlightSearchResults } from './flight-search-results';

const messages = {
  flightSearch: {
    loading: 'Searching...',
    noResults: 'No flights found for this route and date.',
    resultsCount:
      '{count, plural, one {# flight found} other {# flights found}}',
    aircraft: 'Aircraft',
    duration: 'Duration',
    direct: 'Direct',
    stopsCount: '{count, plural, one {# stop} other {# stops}}',
    viaAirports: 'via {airports}',
    connection: 'Connection',
    stopover: 'Stopover',
    layoverIn: '{duration} layover in {airport}',
    interlineConnection: 'Interline connection',
    bagThroughChecked: 'Bags checked through',
  },
};

const renderResults = (ui: ReactElement) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

const directFlight: Flight = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  operatingAirline: 'GA',
  flightNumber: '874',
  originAirport: 'CGK',
  destAirport: 'NRT',
  departureTime: '2026-06-05T09:00:00+07:00',
  arrivalTime: '2026-06-05T17:15:00+09:00',
  aircraftType: '77W',
  status: 'ACTIVE',
  price: 570,
  currency: 'USD',
  legs: [
    {
      id: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
      flightId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      legSequence: 1,
      role: 'FULL',
      depAirport: 'CGK',
      arrAirport: 'NRT',
      departureTime: '2026-06-05T09:00:00+07:00',
      arrivalTime: '2026-06-05T17:15:00+09:00',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const directItinerary: FlightItinerary = {
  flights: [directFlight],
  connections: [],
  stopCount: 0,
  totalPrice: directFlight.price,
  currency: directFlight.currency,
  departureTime: directFlight.departureTime,
  arrivalTime: directFlight.arrivalTime,
  totalDurationMinutes: 375,
};

const technicalStopFlight: Flight = {
  ...directFlight,
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  operatingAirline: 'NH',
  flightNumber: '10',
  destAirport: 'LHR',
  departureTime: '2026-06-01T01:00:00+07:00',
  arrivalTime: '2026-06-01T20:00:00+01:00',
  price: 950,
  legs: [
    {
      id: 'leg-1',
      flightId: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
      legSequence: 1,
      role: 'TECHNICAL_STOP',
      depAirport: 'CGK',
      arrAirport: 'BKK',
      departureTime: '2026-06-01T01:00:00+07:00',
      arrivalTime: '2026-06-01T04:15:00+07:00',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'leg-2',
      flightId: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
      legSequence: 2,
      role: 'TECHNICAL_STOP',
      depAirport: 'BKK',
      arrAirport: 'LHR',
      departureTime: '2026-06-01T05:30:00+07:00',
      arrivalTime: '2026-06-01T20:00:00+01:00',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

const technicalStopItinerary: FlightItinerary = {
  flights: [technicalStopFlight],
  connections: [],
  stopCount: 0,
  totalPrice: technicalStopFlight.price,
  currency: technicalStopFlight.currency,
  departureTime: technicalStopFlight.departureTime,
  arrivalTime: technicalStopFlight.arrivalTime,
  totalDurationMinutes: 1140,
};

const connectingFirstLeg: Flight = {
  ...directFlight,
  id: 'leg-first',
  operatingAirline: 'MH',
  flightNumber: '725',
  originAirport: 'CGK',
  destAirport: 'KUL',
  departureTime: '2026-08-08T01:00:00Z',
  arrivalTime: '2026-08-08T03:15:00Z',
  price: 180,
  legs: [
    {
      id: 'leg-first-1',
      flightId: 'leg-first',
      legSequence: 1,
      role: 'FULL',
      depAirport: 'CGK',
      arrAirport: 'KUL',
      departureTime: '2026-08-08T01:00:00Z',
      arrivalTime: '2026-08-08T03:15:00Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

const connectingSecondLeg: Flight = {
  ...directFlight,
  id: 'leg-second',
  operatingAirline: 'MH',
  flightNumber: '152',
  originAirport: 'KUL',
  destAirport: 'JED',
  departureTime: '2026-08-08T06:00:00Z',
  arrivalTime: '2026-08-08T16:30:00Z',
  price: 580,
  legs: [
    {
      id: 'leg-second-1',
      flightId: 'leg-second',
      legSequence: 1,
      role: 'FULL',
      depAirport: 'KUL',
      arrAirport: 'JED',
      departureTime: '2026-08-08T06:00:00Z',
      arrivalTime: '2026-08-08T16:30:00Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

const connectionResult: ConnectionResult = {
  prevFlightId: 'leg-first',
  nextFlightId: 'leg-second',
  kind: 'connection',
  gapMinutes: 165,
  sameMetroInterAirport: false,
  isInterline: false,
  bagThroughChecked: true,
  appliedMctRuleId: 'rule-1',
  appliedInterlineId: null,
  reason: 'CONNECTION',
};

const connectingItinerary: FlightItinerary = {
  flights: [connectingFirstLeg, connectingSecondLeg],
  connections: [connectionResult],
  stopCount: 1,
  totalPrice: connectingFirstLeg.price + connectingSecondLeg.price,
  currency: 'USD',
  departureTime: connectingFirstLeg.departureTime,
  arrivalTime: connectingSecondLeg.arrivalTime,
  totalDurationMinutes: 930,
};

describe('FlightSearchResults', () => {
  it('renders nothing before a search has run', () => {
    const { container } = renderResults(
      <FlightSearchResults
        results={undefined}
        isFetching={false}
        isFetched={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the empty-results message when the search returns nothing', () => {
    renderResults(
      <FlightSearchResults results={[]} isFetching={false} isFetched={true} />,
    );
    expect(
      screen.getByText('No flights found for this route and date.'),
    ).toBeInTheDocument();
  });

  it('renders a direct itinerary with route, duration, and formatted price', () => {
    renderResults(
      <FlightSearchResults
        results={[directItinerary]}
        isFetching={false}
        isFetched={true}
      />,
    );
    expect(screen.getByText(/GA874/)).toBeInTheDocument();
    expect(screen.getByText(/CGK/)).toBeInTheDocument();
    expect(screen.getByText(/NRT/)).toBeInTheDocument();
    expect(screen.getByText('$570.00')).toBeInTheDocument();
    expect(screen.getByText('Direct')).toBeInTheDocument();
    // 09:00+07:00 -> 02:00Z; 17:15+09:00 -> 08:15Z; elapsed 6h15m.
    expect(screen.getByText(/6h 15m/)).toBeInTheDocument();
  });

  it('renders a technical-stop flight with a stop count and via-airport breakdown', () => {
    renderResults(
      <FlightSearchResults
        results={[technicalStopItinerary]}
        isFetching={false}
        isFetched={true}
      />,
    );
    expect(screen.getByText(/1 stop/)).toBeInTheDocument();
    expect(screen.getByText(/via BKK/)).toBeInTheDocument();
  });

  it('renders a one-stop connecting itinerary with both legs, the connection badge, and the combined price', () => {
    renderResults(
      <FlightSearchResults
        results={[connectingItinerary]}
        isFetching={false}
        isFetched={true}
      />,
    );
    expect(screen.getByText(/MH725/)).toBeInTheDocument();
    expect(screen.getByText(/MH152/)).toBeInTheDocument();
    expect(screen.getByText(/via KUL/)).toBeInTheDocument();
    expect(screen.getByText('Connection')).toBeInTheDocument();
    expect(screen.getByText(/layover in KUL/)).toBeInTheDocument();
    expect(screen.getByText('Bags checked through')).toBeInTheDocument();
    expect(screen.getByText('$760.00')).toBeInTheDocument();
  });
});
