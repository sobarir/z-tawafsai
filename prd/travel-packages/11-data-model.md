# Data model

## `city` (new reference entity, table `city`, Drizzle export `city`)

| Column | Type | Notes |
| --- | --- | --- |
| `cityCode` | `varchar(3)` PK | Natural key, e.g. `JED`, `NYC`, `LON` — not a ULID (matches the repo's airport/airline-code convention for domain-entity natural keys). |
| `name` | `varchar(100)` | Unique (`idx_city_name`). |
| `countryCode` | `varchar(2)` | ISO 3166-1 alpha-2. |
| `createdAt` / `updatedAt` | `timestamptz` | |

Consumers:
- `airports.city_code` — FK added in migration `0006_outstanding_maginty.sql`. Airports previously
  stored no structured city link; this is the first FK from the flights domain into City.
- Property/Package `destination` field (hotels domain, admin UI only) — a `ComboboxFormField`
  populated from `useListCities()` constrains input to known city names. **`destination` itself
  is still a free-text `varchar` column on `property`/`package`, not a FK to `city`** — the
  combobox is a UX constraint, not a data-integrity one. A property/package's `destination` string
  is not guaranteed to match a `city.name` exactly (no validation ties them together).
- `TravelPackagesService.resolveCityNames()` — resolves a technical-stop's transit airport to a
  city name for the "transit in {city}" badge on the public card.

## `travel_package` (table `travel_package`, Drizzle export `flightHotelPackage` — see the naming
note in `00-overview.md`)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID via `createId()` | |
| `title` | `varchar(200)` | |
| `description` | `text`, nullable | |
| `flightId` | `varchar(26)` FK → `flights.id` | The specific operating flight. |
| `propertyCode` | `text` FK → `property.property_code` | The specific hotel property. |
| `durationNights` | `integer` | |
| `heroImageUrl` | `text`, nullable | |
| `price` | `numeric(10,2)` default `0` | Flat price, admin-set — not derived from the flight or property's own pricing. |
| `currency` | `varchar(3)` default `'USD'` | |
| `isActive` | `boolean` default `true` | Public list filters to `isActive` client-side. |
| `createdAt` / `updatedAt` | `timestamptz` | |

Both FKs are `ON DELETE no action` — deleting a referenced flight or property is blocked at the DB
level while a travel package references it, so a dangling `flightId`/`propertyCode` shouldn't
occur in practice.

No FX conversion, seasonal pricing, or occupancy-band logic here — one price, one currency, set
once by an admin. Deliberately simpler than hotels' rate-rule resolver: a travel package is a
curated marketing bundle, not a priced hotel listing.

## Response enrichment (computed at read time, not stored)

`TravelPackagesService.enrich()` joins out from each `travel_package` row to build the nested
`flight` and `property` summary objects the API actually returns (`flightHotelPackageSchema` in
`packages/shared/src/index.ts`):

- `flight.airlineName` — joined from `airlines` by `operatingAirline` code (falls back to the raw
  code if the airline row is missing).
- `flight.isDirect` / `flight.transitAirport` / `flight.transitCityName` — derived from
  `flight_legs`: more than one leg means an internal technical stop (not a cross-flight
  connection — see `/prd/flights/01-glossary.md`); the first leg's arrival airport is the transit
  point, its city name resolved via `airports.city_code` → `city.name`.
- `property.displayName` / `destination` / `starRating` — joined from `property` + its 1:1
  `listing` row.

If a property's `listing` row is somehow missing, `enrich()` silently drops that package from the
list rather than throwing — belt-and-suspenders given the FK constraints above should prevent it.

## Zod contracts

`packages/shared/src/index.ts`:
- `citySchema` / `createCitySchema` / `updateCitySchema` — `cityCodeSchema` is a 3-letter code
  validator (`letterCodeSchema('city code')`), reused pattern from `airportCodeSchema`/
  `currencyCodeSchema`.
- `flightHotelPackageSchema` (response, includes nested `flight`/`property` summaries) /
  `createFlightHotelPackageSchema` / `updateFlightHotelPackageSchema` (request — flat FK fields
  only, no nested objects).
