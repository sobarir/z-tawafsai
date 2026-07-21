import type { FlightHotelPackage } from '@repo/shared';

type Departure = FlightHotelPackage['departures'][number];

/** Return the chronologically first departure, or undefined when none exist. */
export function getEarliestDeparture(
  departures: Departure[],
): Departure | undefined {
  if (departures.length === 0) return undefined;
  return [...departures].sort(
    (a, b) =>
      new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime(),
  )[0];
}
