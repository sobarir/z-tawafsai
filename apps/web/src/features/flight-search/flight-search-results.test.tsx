import type { Flight, FlightItinerary } from '@repo/shared';
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
    technicalStop: 'Technical stop',
    groundTimeIn: '{duration} on the ground in {airport}',
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
  departureTimeLocal: '09:00',
  arrivalTimeLocal: '17:15',
  arrivalDayOffset: 0,
  aircraftType: '77W',
  status: 'ACTIVE',
  price: 570,
  currency: 'USD',
  // Nonstop: legs describe technical stops only, so there are none.
  legs: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const directItinerary: FlightItinerary = {
  flights: [directFlight],
  stopCount: 0,
  totalPrice: directFlight.price,
  currency: directFlight.currency,
  departureTimeLocal: directFlight.departureTimeLocal,
  arrivalTimeLocal: directFlight.arrivalTimeLocal,
  arrivalDayOffset: directFlight.arrivalDayOffset,
  totalDurationMinutes: 375,
};

/** CGK -> BKK -> LHR under one flight number: BKK is a technical stop. */
const toBangkok: Flight['legs'][number] = {
  id: 'leg-1',
  flightId: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  legSequence: 1,
  depAirport: 'CGK',
  arrAirport: 'BKK',
  departureTimeLocal: '01:00',
  arrivalTimeLocal: '09:30',
  departureDayOffset: 0,
  arrivalDayOffset: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const toLondon: Flight['legs'][number] = {
  ...toBangkok,
  id: 'leg-2',
  legSequence: 2,
  depAirport: 'BKK',
  arrAirport: 'LHR',
  departureTimeLocal: '10:30',
  arrivalTimeLocal: '20:00',
};

const technicalStopFlight: Flight = {
  ...directFlight,
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  operatingAirline: 'NH',
  flightNumber: '10',
  destAirport: 'LHR',
  departureTimeLocal: '01:00',
  arrivalTimeLocal: '20:00',
  arrivalDayOffset: 0,
  price: 950,
  legs: [toBangkok, toLondon],
};

const technicalStopItinerary: FlightItinerary = {
  flights: [technicalStopFlight],
  // The API counts the technical stop itself, so a 2-leg flight reports 1 —
  // this fixture previously said 0 and relied on the view double counting it.
  stopCount: 1,
  totalPrice: technicalStopFlight.price,
  currency: technicalStopFlight.currency,
  departureTimeLocal: technicalStopFlight.departureTimeLocal,
  arrivalTimeLocal: technicalStopFlight.arrivalTimeLocal,
  arrivalDayOffset: technicalStopFlight.arrivalDayOffset,
  totalDurationMinutes: 1140,
};

const connectingFirstLeg: Flight = {
  ...directFlight,
  id: 'leg-first',
  operatingAirline: 'MH',
  flightNumber: '725',
  originAirport: 'CGK',
  destAirport: 'KUL',
  departureTimeLocal: '01:00',
  arrivalTimeLocal: '03:15',
  arrivalDayOffset: 0,
  price: 180,
  legs: [],
};

const connectingSecondLeg: Flight = {
  ...directFlight,
  id: 'leg-second',
  operatingAirline: 'MH',
  flightNumber: '152',
  originAirport: 'KUL',
  destAirport: 'JED',
  departureTimeLocal: '06:00',
  arrivalTimeLocal: '16:30',
  arrivalDayOffset: 0,
  price: 580,
  legs: [],
};

const connectingItinerary: FlightItinerary = {
  flights: [connectingFirstLeg, connectingSecondLeg],
  stopCount: 1,
  totalPrice: connectingFirstLeg.price + connectingSecondLeg.price,
  currency: 'USD',
  departureTimeLocal: connectingFirstLeg.departureTimeLocal,
  arrivalTimeLocal: connectingSecondLeg.arrivalTimeLocal,
  arrivalDayOffset: connectingSecondLeg.arrivalDayOffset,
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

  it('shows ground time at a technical stop, but never a connection badge', () => {
    renderResults(
      <FlightSearchResults
        results={[technicalStopItinerary]}
        isFetching={false}
        isFetched={true}
      />,
    );
    // BKK arrival 09:30 -> departure 10:30 on the same day.
    expect(screen.getByText('Technical stop')).toBeInTheDocument();
    expect(screen.getByText(/1h 0m on the ground in BKK/)).toBeInTheDocument();
    // The passenger keeps one flight number and stays onboard — nothing to
    // connect to and no bags to re-check.
    expect(screen.queryByText('Connection')).not.toBeInTheDocument();
    expect(screen.queryByText(/layover in/)).not.toBeInTheDocument();
  });

  it('measures ground time across a day boundary using the legs day offsets', () => {
    // Arrives 23:30, departs 00:30 the next day: one hour, not minus 23.
    const overnight: FlightItinerary = {
      ...technicalStopItinerary,
      flights: [
        {
          ...technicalStopFlight,
          legs: [
            { ...toBangkok, arrivalTimeLocal: '23:30', arrivalDayOffset: 0 },
            { ...toLondon, departureTimeLocal: '00:30', departureDayOffset: 1 },
          ],
        },
      ],
    };
    renderResults(
      <FlightSearchResults
        results={[overnight]}
        isFetching={false}
        isFetched={true}
      />,
    );
    expect(screen.getByText(/1h 0m on the ground in BKK/)).toBeInTheDocument();
  });

  it('shows no technical-stop detail for a nonstop flight', () => {
    renderResults(
      <FlightSearchResults
        results={[directItinerary]}
        isFetching={false}
        isFetched={true}
      />,
    );
    expect(screen.queryByText('Technical stop')).not.toBeInTheDocument();
    expect(screen.queryByText(/on the ground in/)).not.toBeInTheDocument();
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
