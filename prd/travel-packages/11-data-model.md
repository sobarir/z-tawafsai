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
- Property `destination` field (hotels domain, admin UI only) — a `ComboboxFormField`
  populated from `useListCities()` constrains input to known city names. **`destination` itself
  is still a free-text `varchar` column on `property`, not a FK to `city`** — the combobox is a UX
  constraint, not a data-integrity one. A property's `destination` string is not guaranteed to
  match a `city.name` exactly (no validation ties them together). A travel package reaches its
  cities via `travel_package_stay → property.destination`, not a field of its own.
- `TravelPackagesService.resolveCityNames()` — resolves a technical-stop's transit airport to a
  city name for the "transit in {city}" badge on the public card.

## Enums

- `travel_package_type` — `umrah` | `umrah_plus` | `hajj`.
- `travel_package_meal_plan` — `full_board` | `half_board` | `room_only`.
- `travel_package_inclusion_kind` — `included` | `excluded`.

## `travel_package` (table `travel_package`, Drizzle export `flightHotelPackage` — see the naming
note in `00-overview.md`)

A package is one operating flight plus **one or more ordered city stays** (Makkah + Madinah for
umrah; a third city for `umrah_plus`), held in the `travel_package_stay` child table below — the
package row no longer carries a single `propertyCode`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID via `createId()` | |
| `type` | `travel_package_type` default `'umrah'` | |
| `title` | `varchar(200)` | |
| `description` | `text`, nullable | |
| `flightId` | `varchar(26)` FK → `flights.id` | The specific operating flight (routing/airline display). One per package. |
| `durationNights` | `integer` | Admin-set total; the service rejects a package whose stay nights don't sum to it. |
| `mealPlan` | `travel_package_meal_plan`, nullable | |
| `heroImageUrl` | `text`, nullable | |
| `price` | `numeric(10,2)` default `0` | Flat price, admin-set — not derived from the flight/hotel pricing. |
| `currency` | `varchar(3)` default `'USD'` | |
| `isActive` | `boolean` default `true` | Public list filters to `isActive` client-side. |
| `createdAt` / `updatedAt` | `timestamptz` | |

`flightId` is `ON DELETE no action`. All child tables below FK to `travel_package.id` with
`ON DELETE cascade`, so deleting a package removes its stays/departures/inclusions/itinerary.

No FX conversion, seasonal pricing, or occupancy-band logic — one flat price, one currency. A
package is a curated marketing bundle, not a priced hotel listing or a booking (no fares/PNR/seats;
occupancy tiers and real inventory stay out — see `00-overview.md` non-goals).

### `travel_package_stay` (child, `ON DELETE cascade`)

One ordered city stay. Reuses the hotels-domain `property` (which already carries `starRating` and
distance-to-Haram/Nabawi), so no lodging detail is duplicated.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID | |
| `packageId` | `text` FK → `travel_package.id` | |
| `propertyCode` | `text` FK → `property.property_code` | |
| `sequence` | `integer` | 1 = first city. Unique per package (`travel_package_stay_seq_unique`). |
| `nights` | `integer` | `CHECK nights > 0`. Sum across stays must equal `durationNights`. |

### `travel_package_departure` (child, `ON DELETE cascade`)

A dated group departure. `seatsNote` is a free-text **display** string ("Sisa 4 seat"), NOT an
inventory count — this keeps the domain a catalog, not a booking engine.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID | |
| `packageId` | `text` FK → `travel_package.id` | |
| `departureDate` | `date` | |
| `returnDate` | `date`, nullable | `CHECK returnDate IS NULL OR returnDate >= departureDate`. |
| `seatsNote` | `text`, nullable | |

### `travel_package_inclusion` (child, `ON DELETE cascade`)

Ordered included/excluded line items (visa, ground transport, ziyarah, muthawwif, manasik,
perlengkapan, …).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID | |
| `packageId` | `text` FK → `travel_package.id` | |
| `kind` | `travel_package_inclusion_kind` | `included` / `excluded`. |
| `label` | `text` | |
| `sequence` | `integer` | Display order. |

### `travel_package_itinerary_day` (child, `ON DELETE cascade`)

Day-by-day program. Contract-supported; not yet surfaced in the admin form (a follow-up UI item).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` PK, ULID | |
| `packageId` | `text` FK → `travel_package.id` | |
| `dayNumber` | `integer` | Unique per package; `CHECK dayNumber > 0`. |
| `title` | `text` | |
| `description` | `text`, nullable | |

## Response enrichment (computed at read time, not stored)

`TravelPackagesService.enrich()` batch-loads all child tables (grouped by `packageId`) plus the
flight/property joins, building the arrays the API returns (`flightHotelPackageSchema` in
`packages/shared/src/index.ts`):

- `flight.airlineName` — joined from `airlines` by `operatingAirline` code (falls back to the raw
  code if the airline row is missing).
- `flight.isDirect` / `flight.transitAirport` / `flight.transitCityName` — derived from
  `flight_legs`: more than one leg means an internal technical stop (not a cross-flight
  connection — see `/prd/flights/01-glossary.md`); the first leg's arrival airport is the transit
  point, its city name resolved via `airports.city_code` → `city.name`.
- `stays[]` — each stay joined to `property` for `displayName` / `destination` / `starRating` /
  `distanceMeters` / `distanceNote`, ordered by `sequence`.
- `departures[]`, `inclusions[]`, `itinerary[]` — the child rows, ordered.

A package whose flight row is missing is dropped from the list rather than throwing; a stay whose
property row is missing is skipped.

## Write path

`create`/`update` run in a transaction: the package row is upserted, then each provided child
collection is replaced wholesale (delete + reinsert). `assertNightsMatch` reads the final
in-transaction state and throws `BadRequestException` (rolling back) if stay nights don't sum to
`durationNights`. On `PATCH`, an omitted child collection is left untouched.

## Zod contracts

`packages/shared/src/index.ts`:
- `citySchema` / `createCitySchema` / `updateCitySchema` — `cityCodeSchema` is a 3-letter code
  validator (`letterCodeSchema('city code')`).
- `travelPackageTypeSchema` / `travelPackageMealPlanSchema` / `travelPackageInclusionKindSchema`.
- `flightHotelPackageSchema` (response — nested `flight` summary + `stays`/`departures`/
  `inclusions`/`itinerary` arrays) / `createFlightHotelPackageSchema` /
  `updateFlightHotelPackageSchema` (request — flat FK/scalar fields with nested request arrays; no
  enriched summaries). Nights-sum validation is server-side, not in the schema.
