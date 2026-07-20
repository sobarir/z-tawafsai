import type {
  Airline,
  Airport,
  City,
  Currency,
  Flight,
  Property,
  RoomType,
  Season,
  TravelProvider,
} from '@repo/shared';
import type { ComboboxOption } from '@/components/ui/combobox';

export function toAirportOptions(airports: Airport[]): ComboboxOption[] {
  return airports.map((a) => ({
    value: a.airportCode,
    label: `${a.airportCode} — ${a.name}`,
  }));
}

/** Feeds pickers that store a city code (e.g. airport.cityCode). */
export function toCityOptions(cities: City[]): ComboboxOption[] {
  return cities.map((c) => ({
    value: c.cityCode,
    label: c.name,
  }));
}

/** Feeds pickers that store a free-text city name (e.g. listing.destination). */
export function toCityNameOptions(cities: City[]): ComboboxOption[] {
  return cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));
}

export function toAirlineOptions(airlines: Airline[]): ComboboxOption[] {
  return airlines.map((a) => ({
    value: a.airlineCode,
    label: `${a.airlineCode} — ${a.name}`,
  }));
}

export function toFlightOptions(flights: Flight[]): ComboboxOption[] {
  return flights.map((f) => {
    const timeStr = f.departureTimeLocal || 'Unknown Time';
    return {
      value: f.id,
      label: `${f.operatingAirline}${f.flightNumber} (${f.originAirport}→${f.destAirport}) · ${timeStr}`,
    };
  });
}

export function toCurrencyOptions(currencies: Currency[]): ComboboxOption[] {
  return currencies.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
  }));
}

export function toPropertyOptions(properties: Property[]): ComboboxOption[] {
  return properties.map((p) => ({
    value: p.propertyCode,
    label: p.displayName,
  }));
}

export function toSeasonOptions(seasons: Season[]): ComboboxOption[] {
  return seasons.map((s) => ({
    value: s.id,
    label: s.name,
  }));
}

export function toRoomTypeOptions(roomTypes: RoomType[]): ComboboxOption[] {
  return roomTypes.map((r) => ({
    value: r.id,
    label: r.name,
  }));
}

export function toProviderOptions(
  providers: TravelProvider[],
): ComboboxOption[] {
  return providers.map((p) => ({ value: p.id, label: p.name }));
}
