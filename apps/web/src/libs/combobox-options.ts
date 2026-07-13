import type { Airline, Airport, Flight } from '@repo/shared';
import type { ComboboxOption } from '@/components/ui/combobox';

export function toAirportOptions(airports: Airport[]): ComboboxOption[] {
  return airports.map((a) => ({
    value: a.airportCode,
    label: `${a.airportCode} — ${a.name}`,
  }));
}

export function toAirlineOptions(airlines: Airline[]): ComboboxOption[] {
  return airlines.map((a) => ({
    value: a.airlineCode,
    label: `${a.airlineCode} — ${a.name}`,
  }));
}

export function toFlightOptions(flights: Flight[]): ComboboxOption[] {
  return flights.map((f) => ({
    value: f.id,
    label: `${f.operatingAirline}${f.flightNumber} (${f.originAirport}→${f.destAirport})`,
  }));
}
