import type { Flight } from '@repo/shared';

// Mirrors the API's journey-duration reference (apps/api/.../journey-duration.ts):
// schedule times are date-agnostic, so a fixed instant resolves each zone's
// offset deterministically. Kept in sync so a stored selection renders the same
// elapsed time the search returned.
const DURATION_REFERENCE = new Date('2025-06-15T12:00:00Z');
const MINUTES_PER_DAY = 24 * 60;

function parseLocalTime(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Minutes east of UTC for an IANA zone at the reference instant. */
function tzOffsetMinutes(timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(DURATION_REFERENCE);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtc - DURATION_REFERENCE.getTime()) / 60_000);
}

/** "GA 874 · MH 152" — the marketing labels of a journey's flights. */
export function journeyFlightNumbers(flights: Flight[]): string {
  return flights
    .map((f) => `${f.operatingAirline} ${f.flightNumber}`)
    .join(' · ');
}

export interface DisplayItinerary {
  departureTimeLocal: string;
  originAirport: string;
  arrivalTimeLocal: string;
  arrivalDayOffset: number;
  destAirport: string;
  durationMins: number;
  stops: number;
}

/**
 * Reconstruct the display fields of a stored journey (an ordered flight list)
 * the way the search does: total stops, cumulative day offset (adding a day when
 * a connection crosses midnight), and a timezone-aware elapsed duration.
 */
export function buildDisplayItinerary(
  flights: Flight[],
  tzByAirport: Map<string, string>,
): DisplayItinerary | null {
  const first = flights[0];
  const last = flights[flights.length - 1];
  if (!first || !last) return null;

  let stops = flights.length - 1;
  let arrivalDayOffset = 0;
  let prev: Flight | null = null;
  for (const flight of flights) {
    stops += flight.legs.length - 1;
    arrivalDayOffset += flight.arrivalDayOffset;
    if (
      prev &&
      parseLocalTime(flight.departureTimeLocal) <
        parseLocalTime(prev.arrivalTimeLocal)
    ) {
      arrivalDayOffset += 1;
    }
    prev = flight;
  }

  const localSpan =
    parseLocalTime(last.arrivalTimeLocal) +
    arrivalDayOffset * MINUTES_PER_DAY -
    parseLocalTime(first.departureTimeLocal);
  const originTz = tzByAirport.get(first.originAirport);
  const destTz = tzByAirport.get(last.destAirport);
  const durationMins =
    originTz && destTz
      ? localSpan - (tzOffsetMinutes(destTz) - tzOffsetMinutes(originTz))
      : localSpan;

  return {
    departureTimeLocal: first.departureTimeLocal,
    originAirport: first.originAirport,
    arrivalTimeLocal: last.arrivalTimeLocal,
    arrivalDayOffset,
    destAirport: last.destAirport,
    durationMins,
    stops,
  };
}
