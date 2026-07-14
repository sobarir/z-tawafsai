import type {
  Airline,
  Airport,
  City,
  Currency,
  Flight,
  Package,
  Property,
  RoomType,
  Season,
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
    label: `${c.cityCode} — ${c.name}`,
  }));
}

/** Feeds pickers that store a free-text city name (e.g. listing.destination). */
export function toCityNameOptions(cities: City[]): ComboboxOption[] {
  return cities.map((c) => ({
    value: c.name,
    label: `${c.name} (${c.cityCode})`,
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

export function toCurrencyOptions(currencies: Currency[]): ComboboxOption[] {
  return currencies.map((c) => ({
    value: c.code,
    label: `${c.code} — ${c.name}`,
  }));
}

export function toPropertyOptions(properties: Property[]): ComboboxOption[] {
  return properties.map((p) => ({
    value: p.propertyCode,
    label: `${p.propertyCode} — ${p.displayName}`,
  }));
}

/** Properties and packages share the `listing` spine — combine both for any listingId picker. */
export function toListingOptions(
  properties: Property[],
  packages: Package[],
): ComboboxOption[] {
  return [
    ...properties.map((p) => ({
      value: p.listingId,
      label: `${p.displayName} (property, ${p.propertyCode})`,
    })),
    ...packages.map((p) => ({
      value: p.listingId,
      label: `${p.displayName} (package, ${p.packageCode})`,
    })),
  ];
}

export function toSeasonOptions(seasons: Season[]): ComboboxOption[] {
  return seasons.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.startDate} → ${s.endDate})`,
  }));
}

export function toRoomTypeOptions(roomTypes: RoomType[]): ComboboxOption[] {
  return roomTypes.map((r) => ({
    value: r.id,
    label: `${r.propertyCode} — ${r.name}`,
  }));
}
