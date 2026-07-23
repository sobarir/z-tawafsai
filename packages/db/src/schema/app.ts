import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  char,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createId } from '../id';
import { user } from './auth';

/**
 * Your application tables live here.
 * `posts` is a minimal example showing FKs against Better Auth's user table.
 */

export const post = pgTable('post', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  content: text('content'),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Flight schedule & inventory domain.

export const mctScope = pgEnum('mct_scope', ['DD', 'DI', 'ID', 'II']);
export const flightStatus = pgEnum('flight_status', [
  'ACTIVE',
  'SUSPENDED',
  'SEASONAL',
]);

export const city = pgTable(
  'city',
  {
    cityCode: varchar('city_code', { length: 3 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex('idx_city_name').on(table.name)],
);

export const airports = pgTable(
  'airports',
  {
    airportCode: varchar('airport_code', { length: 3 }).primaryKey(),
    icaoCode: varchar('icao_code', { length: 4 }),
    name: varchar('name', { length: 100 }).notNull(),
    cityCode: varchar('city_code', { length: 3 })
      .notNull()
      .references(() => city.cityCode),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    timezone: varchar('timezone', { length: 50 }).notNull(),
    latitude: numeric('latitude', { precision: 9, scale: 6, mode: 'number' }),
    longitude: numeric('longitude', { precision: 9, scale: 6, mode: 'number' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('idx_airports_city_code').on(table.cityCode)],
);

export const airlines = pgTable('airlines', {
  airlineCode: varchar('airline_code', { length: 2 }).primaryKey(),
  icaoCode: varchar('icao_code', { length: 3 }),
  name: varchar('name', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const flights = pgTable(
  'flights',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => createId()),
    operatingAirline: varchar('operating_airline', { length: 2 })
      .notNull()
      .references(() => airlines.airlineCode),
    flightNumber: varchar('flight_number', { length: 4 }).notNull(),
    originAirport: varchar('origin_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    destAirport: varchar('dest_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    departureTimeLocal: varchar('departure_time_local', {
      length: 5,
    }).notNull(),
    arrivalTimeLocal: varchar('arrival_time_local', { length: 5 }).notNull(),
    arrivalDayOffset: integer('arrival_day_offset').notNull().default(0),
    aircraftType: varchar('aircraft_type', { length: 10 }),
    status: flightStatus('status').notNull().default('ACTIVE'),
    // Flat, admin-managed price for OTA-style search display/sorting — not a
    // fare class or fare construction.
    price: numeric('price', { precision: 10, scale: 2, mode: 'number' })
      .notNull()
      .default(0),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('flights_carrier_number_unique').on(
      table.operatingAirline,
      table.flightNumber,
    ),
    index('idx_flights_origin_dep').on(
      table.originAirport,
      table.departureTimeLocal,
    ),
    index('idx_flights_dest_arr').on(table.destAirport, table.arrivalTimeLocal),
    check('flights_price_non_negative', sql`${table.price} >= 0`),
  ],
);

// A leg row exists ONLY to describe a technical stop. A nonstop flight has zero
// leg rows: its route and times already live on `flights`, so a leg per flight
// would be a stored copy of derived data that drifts when the flight is edited.
export const flightLegs = pgTable(
  'flight_legs',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => createId()),
    flightId: varchar('flight_id', { length: 26 })
      .notNull()
      .references(() => flights.id, { onDelete: 'cascade' }),
    legSequence: integer('leg_sequence').notNull(),
    depAirport: varchar('dep_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    arrAirport: varchar('arr_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    departureTimeLocal: varchar('departure_time_local', {
      length: 5,
    }).notNull(),
    arrivalTimeLocal: varchar('arrival_time_local', { length: 5 }).notNull(),
    departureDayOffset: integer('departure_day_offset').notNull().default(0),
    arrivalDayOffset: integer('arrival_day_offset').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('flight_legs_flight_sequence_unique').on(
      table.flightId,
      table.legSequence,
    ),
  ],
);

export const flightMarketing = pgTable(
  'flight_marketing',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => createId()),
    flightId: varchar('flight_id', { length: 26 })
      .notNull()
      .references(() => flights.id, { onDelete: 'cascade' }),
    marketingAirline: varchar('marketing_airline', { length: 2 })
      .notNull()
      .references(() => airlines.airlineCode),
    marketingNumber: varchar('marketing_number', { length: 4 }).notNull(),
    isOperatingCarrier: boolean('is_operating_carrier')
      .notNull()
      .default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('flight_marketing_unique').on(
      table.marketingAirline,
      table.marketingNumber,
      table.flightId,
    ),
    // Partial index: at most one operating-carrier marketing row per flight.
    uniqueIndex('flight_marketing_one_operating_carrier')
      .on(table.flightId)
      .where(sql`${table.isOperatingCarrier}`),
  ],
);

export const interlineAgreements = pgTable(
  'interline_agreements',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => createId()),
    inboundAirline: varchar('inbound_airline', { length: 2 })
      .notNull()
      .references(() => airlines.airlineCode),
    outboundAirline: varchar('outbound_airline', { length: 2 })
      .notNull()
      .references(() => airlines.airlineCode),
    bagThroughChecked: boolean('bag_through_checked').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Directional: A→B and B→A are separate rows; this also serves as the
    // hot-path lookup index at validation time.
    uniqueIndex('idx_interline_lookup').on(
      table.inboundAirline,
      table.outboundAirline,
    ),
    check(
      'interline_agreements_inbound_ne_outbound',
      sql`${table.inboundAirline} <> ${table.outboundAirline}`,
    ),
  ],
);

export const mctRules = pgTable('mct_rules', {
  id: varchar('id', { length: 26 })
    .primaryKey()
    .$defaultFn(() => createId()),
  arrivalAirport: varchar('arrival_airport', { length: 3 })
    .notNull()
    .references(() => airports.airportCode),
  departureAirport: varchar('departure_airport', { length: 3 })
    .notNull()
    .references(() => airports.airportCode),
  scope: mctScope('scope').notNull(),
  arrivalAirline: varchar('arrival_airline', { length: 2 }).references(
    () => airlines.airlineCode,
  ),
  departureAirline: varchar('departure_airline', { length: 2 }).references(
    () => airlines.airlineCode,
  ),
  arrivalTerminal: varchar('arrival_terminal', { length: 10 }),
  departureTerminal: varchar('departure_terminal', { length: 10 }),
  mctMinutes: integer('mct_minutes').notNull(),
  maxConnectionMinutes: integer('max_connection_minutes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Hotel search domain — see /prd/hotels/11-data-model.md for the full spec.

export const propertyType = pgEnum('property_type', [
  'hotel',
  'apartment',
  'house',
]);

// Travel-package (umrah) domain enums — see /prd/travel-packages/11-data-model.md.
export const travelPackageType = pgEnum('travel_package_type', [
  'umrah',
  'umrah_plus',
  'hajj',
]);
export const travelPackageMealPlan = pgEnum('travel_package_meal_plan', [
  'full_board',
  'half_board',
  'room_only',
]);
export const travelPackageInclusionKind = pgEnum(
  'travel_package_inclusion_kind',
  ['included', 'excluded'],
);
// Back-office seat inventory: only `confirmed` bookings count against a
// departure's quota; `cancelled` rows are retained for history but free the seat.
export const travelPackageBookingStatus = pgEnum(
  'travel_package_booking_status',
  ['confirmed', 'cancelled'],
);

export const currency = pgTable('currency', {
  code: char('code', { length: 3 }).primaryKey(),
  minorUnit: integer('minor_unit').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
});

export const fxRate = pgTable(
  'fx_rate',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    baseCurrency: char('base_currency', { length: 3 })
      .notNull()
      .references(() => currency.code),
    quoteCurrency: char('quote_currency', { length: 3 })
      .notNull()
      .references(() => currency.code),
    ratePpm: bigint('rate_ppm', { mode: 'number' }).notNull(),
    asOf: timestamp('as_of', { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex('fx_rate_base_quote_unique').on(
      table.baseCurrency,
      table.quoteCurrency,
    ),
    check(
      'fx_rate_base_ne_quote',
      sql`${table.baseCurrency} <> ${table.quoteCurrency}`,
    ),
  ],
);

// `property_code` is a ULID.
export const property = pgTable(
  'property',
  {
    propertyCode: varchar('property_code', { length: 26 })
      .primaryKey()
      .$defaultFn(() => createId()),
    type: propertyType('type').notNull(),
    displayName: text('display_name').notNull(),
    destination: text('destination').notNull(),
    countryCode: char('country_code', { length: 2 }).notNull(),
    heroImageUrl: text('hero_image_url'),
    starRating: integer('star_rating'),
    address: text('address'),
    // Approximate distance to the property's relevant landmark (e.g. Masjid
    // Al-Haram / Masjid An-Nabawi for Makkah/Madinah hotels), plus a
    // free-text qualifier (walk time, shuttle requirement, etc).
    distanceMeters: integer('distance_meters'),
    distanceNote: text('distance_note'),
    contactPhone: text('contact_phone'),
    contactEmail: text('contact_email'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_property_destination').on(table.destination),
    index('idx_property_type').on(table.type),
    index('idx_property_active_type').on(table.isActive, table.type),
    check(
      'property_star_rating_range',
      sql`${table.starRating} IS NULL OR (${table.starRating} BETWEEN 1 AND 5)`,
    ),
  ],
);

// Reference/master data — a global catalog of room categories, not tied to any
// property. `max_occupancy` is the category default; rate rules carry their own
// occupancy band. See prd/hotels/11-data-model.md.
export const roomType = pgTable(
  'room_type',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name').notNull(),
    maxOccupancy: integer('max_occupancy').notNull(),
  },
  (table) => [
    uniqueIndex('room_type_name_unique').on(table.name),
    check('room_type_max_occupancy_positive', sql`${table.maxOccupancy} > 0`),
  ],
);

// Reference/master data — a global catalog of season labels (peak, ramadan,
// hajj, promo). The dated window that actually selects a season lives per
// property on `season_window`; Standard is the absence of a season (null).
export const season = pgTable(
  'season',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 50 }).notNull(),
  },
  (table) => [uniqueIndex('season_name_unique').on(table.name)],
);

// Per-property dated window that maps a stay date to a global `season`.
// Non-overlap within a property is enforced by a Postgres EXCLUDE constraint
// (daterange + btree_gist) — Drizzle's schema builder has no API for EXCLUDE,
// so it's added via a hand-written custom migration, not expressed here.
// See drizzle/<timestamp>_season_window_no_overlap.sql. Two windows of the same
// season type per property are allowed (e.g. two promo periods); only overlap
// is forbidden.
export const seasonWindow = pgTable(
  'season_window',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    propertyCode: varchar('property_code', { length: 26 })
      .notNull()
      .references(() => property.propertyCode, { onUpdate: 'cascade' }),
    seasonId: text('season_id')
      .notNull()
      .references(() => season.id),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('idx_season_window_property_start').on(
      table.propertyCode,
      table.startDate,
    ),
    check(
      'season_window_end_after_start',
      sql`${table.endDate} > ${table.startDate}`,
    ),
  ],
);

export const rateRule = pgTable(
  'rate_rule',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    propertyCode: varchar('property_code', { length: 26 })
      .notNull()
      .references(() => property.propertyCode, { onUpdate: 'cascade' }),
    // Nullable: a season-less rate rule is the Standard (base) rate, used
    // whenever no dated season covers the stay (or a season has no matching
    // band). See prd/hotels/13-resolver-and-search.md.
    seasonId: text('season_id').references(() => season.id),
    roomTypeId: text('room_type_id')
      .notNull()
      .references(() => roomType.id),
    minOccupancy: integer('min_occupancy').notNull(),
    maxOccupancy: integer('max_occupancy').notNull(),
    // Minor units, always per-night.
    amount: integer('amount').notNull(),
    currency: char('currency', { length: 3 })
      .notNull()
      .references(() => currency.code),
  },
  (table) => [
    index('idx_rate_rule_property_season').on(
      table.propertyCode,
      table.seasonId,
    ),
    check(
      'rate_rule_max_gte_min',
      sql`${table.maxOccupancy} >= ${table.minOccupancy}`,
    ),
    check('rate_rule_amount_non_negative', sql`${table.amount} >= 0`),
    // nullsNotDistinct so two season-less (Standard) bands for the same
    // property/room/occupancy still collide (Postgres treats NULLs as distinct
    // by default, which would let duplicate standard bands through).
    unique('rate_rule_band_unique')
      .on(
        table.propertyCode,
        table.seasonId,
        table.roomTypeId,
        table.minOccupancy,
        table.maxOccupancy,
      )
      .nullsNotDistinct(),
  ],
);

export const journeyDirection = pgEnum('journey_direction', [
  'OUTBOUND',
  'INBOUND',
]);

// An umrah travel company (operator) the agent markets packages for. Each
// travel_package references one provider; the agent earns a per-seat commission
// (travel_package.fee_per_seat) on every confirmed booking of that package.
export const travelProvider = pgTable('travel_provider', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 200 }).notNull(),
  // e.g. the Kemenag PPIU licence number.
  licenseNumber: varchar('license_number', { length: 100 }),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  website: text('website'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Combines a specific flight with one or more ordered city stays (Makkah +
// Madinah for umrah, plus a third city for umrah_plus) into one admin-curated,
// flat-priced offering — a display/catalog product, not a booking (no
// fares/PNR/seats). Stays/departures/inclusions/itinerary live in the child
// tables below. See prd/travel-packages/11-data-model.md for the decision.
export const flightHotelPackage = pgTable('travel_package', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  type: travelPackageType('type').notNull().default('umrah'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  durationNights: integer('duration_nights').notNull(),
  mealPlan: travelPackageMealPlan('meal_plan'),
  heroImageUrl: text('hero_image_url'),
  // Uploaded marketing flyer (image or PDF), served from the API uploads dir.
  flyerUrl: text('flyer_url'),
  // The umrah travel company organizing this package. Nullable so an unassigned
  // package is allowed; ON DELETE set null keeps packages when a provider is removed.
  providerId: text('provider_id').references(() => travelProvider.id, {
    onDelete: 'set null',
  }),
  // Flat commission the agent earns per pax sold, in the package `currency`.
  feePerSeat: numeric('fee_per_seat', {
    precision: 10,
    scale: 2,
    mode: 'number',
  }),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' })
    .notNull()
    .default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  // Curated flag: featured packages surface on the public landing page's
  // "Paket" cards. Independent of isActive — a package must be both active and
  // featured to appear there.
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// One ordered city stay within a package — reuses the hotels-domain `property`
// (which already carries star rating + distance to the Haram/Nabawi), so no
// lodging detail is duplicated here.
export const travelPackageStay = pgTable(
  'travel_package_stay',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    packageId: text('package_id')
      .notNull()
      .references(() => flightHotelPackage.id, { onDelete: 'cascade' }),
    cityCode: varchar('city_code', { length: 3 })
      .notNull()
      .references(() => city.cityCode),
    propertyCode: varchar('property_code', { length: 26 })
      .notNull()
      .references(() => property.propertyCode, { onUpdate: 'cascade' }),
    sequence: integer('sequence').notNull(),
    nights: integer('nights').notNull(),
  },
  (table) => [
    uniqueIndex('travel_package_stay_seq_unique').on(
      table.packageId,
      table.sequence,
    ),
    index('idx_travel_package_stay_package').on(table.packageId),
    check('travel_package_stay_nights_positive', sql`${table.nights} > 0`),
  ],
);

// A dated group departure. `totalSeats` is a back-office seat quota (null =
// untracked); `seatsNote` remains a free-text display override. Confirmed
// bookings in travel_package_booking count against totalSeats.
export const travelPackageDeparture = pgTable(
  'travel_package_departure',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    packageId: text('package_id')
      .notNull()
      .references(() => flightHotelPackage.id, { onDelete: 'cascade' }),
    departureDate: date('departure_date', { mode: 'string' }).notNull(),
    returnDate: date('return_date', { mode: 'string' }),
    seatsNote: text('seats_note'),
    totalSeats: integer('total_seats'),
    availableSeats: integer('available_seats'),
    price: numeric('price', { precision: 10, scale: 2, mode: 'number' })
      .notNull()
      .default(0),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  },
  (table) => [
    index('idx_travel_package_departure_package').on(table.packageId),
    check(
      'travel_package_departure_return_after_departure',
      sql`${table.returnDate} IS NULL OR ${table.returnDate} >= ${table.departureDate}`,
    ),
    check(
      'travel_package_departure_available_seats_nonneg',
      sql`${table.availableSeats} IS NULL OR ${table.availableSeats} >= 0`,
    ),
    check(
      'travel_package_departure_total_seats_nonneg',
      sql`${table.totalSeats} IS NULL OR ${table.totalSeats} >= 0`,
    ),
  ],
);

// Junction table linking a travel package departure to a Journey (list of flights)
export const travelPackageDepartureFlight = pgTable(
  'travel_package_departure_flight',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    departureId: text('departure_id')
      .notNull()
      .references(() => travelPackageDeparture.id, { onDelete: 'cascade' }),
    flightId: varchar('flight_id', { length: 26 })
      .notNull()
      .references(() => flights.id),
    direction: journeyDirection('direction').notNull(),
    sequence: integer('sequence').notNull(),
  },
  (table) => [
    index('idx_travel_package_departure_flight_dep').on(table.departureId),
    uniqueIndex('travel_package_departure_flight_seq_unique').on(
      table.departureId,
      table.direction,
      table.sequence,
    ),
    check(
      'travel_package_departure_flight_seq_positive',
      sql`${table.sequence} > 0`,
    ),
  ],
);

// A back-office reservation record against a departure. Confirmed rows consume
// the departure's seat quota; the service rejects a booking that would overbook.
// Admin-only — never exposed on the anonymous public package list (customer PII).
export const travelPackageBooking = pgTable(
  'travel_package_booking',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    departureId: text('departure_id')
      .notNull()
      .references(() => travelPackageDeparture.id, { onDelete: 'cascade' }),
    customerName: text('customer_name').notNull(),
    pax: integer('pax').notNull(),
    phone: text('phone'),
    notes: text('notes'),
    status: travelPackageBookingStatus('status').notNull().default('confirmed'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_travel_package_booking_departure').on(table.departureId),
    check('travel_package_booking_pax_positive', sql`${table.pax} > 0`),
  ],
);

// An ordered included/excluded line item (visa, ground transport, ziyarah,
// muthawwif, manasik, perlengkapan, ...).
export const travelPackageInclusion = pgTable(
  'travel_package_inclusion',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    packageId: text('package_id')
      .notNull()
      .references(() => flightHotelPackage.id, { onDelete: 'cascade' }),
    kind: travelPackageInclusionKind('kind').notNull(),
    label: text('label').notNull(),
    sequence: integer('sequence').notNull(),
  },
  (table) => [
    index('idx_travel_package_inclusion_package').on(table.packageId),
  ],
);

// One day of the day-by-day program.
export const travelPackageItineraryDay = pgTable(
  'travel_package_itinerary_day',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    packageId: text('package_id')
      .notNull()
      .references(() => flightHotelPackage.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    title: text('title').notNull(),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('travel_package_itinerary_day_unique').on(
      table.packageId,
      table.dayNumber,
    ),
    check(
      'travel_package_itinerary_day_number_positive',
      sql`${table.dayNumber} > 0`,
    ),
  ],
);

export type Airport = typeof airports.$inferSelect;
export type NewAirport = typeof airports.$inferInsert;
export type Airline = typeof airlines.$inferSelect;
export type NewAirline = typeof airlines.$inferInsert;
export type Flight = typeof flights.$inferSelect;
export type NewFlight = typeof flights.$inferInsert;
export type FlightLeg = typeof flightLegs.$inferSelect;
export type NewFlightLeg = typeof flightLegs.$inferInsert;
export type FlightMarketing = typeof flightMarketing.$inferSelect;
export type NewFlightMarketing = typeof flightMarketing.$inferInsert;
export type InterlineAgreement = typeof interlineAgreements.$inferSelect;
export type NewInterlineAgreement = typeof interlineAgreements.$inferInsert;

export type Currency = typeof currency.$inferSelect;
export type NewCurrency = typeof currency.$inferInsert;
export type FxRate = typeof fxRate.$inferSelect;
export type NewFxRate = typeof fxRate.$inferInsert;
export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
export type RoomType = typeof roomType.$inferSelect;
export type NewRoomType = typeof roomType.$inferInsert;
export type Season = typeof season.$inferSelect;
export type NewSeason = typeof season.$inferInsert;
export type FlightHotelPackage = typeof flightHotelPackage.$inferSelect;
export type NewFlightHotelPackage = typeof flightHotelPackage.$inferInsert;
export type TravelPackageStay = typeof travelPackageStay.$inferSelect;
export type NewTravelPackageStay = typeof travelPackageStay.$inferInsert;
export type TravelPackageDeparture = typeof travelPackageDeparture.$inferSelect;
export type NewTravelPackageDeparture =
  typeof travelPackageDeparture.$inferInsert;
export type TravelPackageInclusion = typeof travelPackageInclusion.$inferSelect;
export type NewTravelPackageInclusion =
  typeof travelPackageInclusion.$inferInsert;
export type TravelPackageItineraryDay =
  typeof travelPackageItineraryDay.$inferSelect;
export type NewTravelPackageItineraryDay =
  typeof travelPackageItineraryDay.$inferInsert;
export type TravelPackageBooking = typeof travelPackageBooking.$inferSelect;
export type NewTravelPackageBooking = typeof travelPackageBooking.$inferInsert;
export type TravelProvider = typeof travelProvider.$inferSelect;
export type NewTravelProvider = typeof travelProvider.$inferInsert;
export type RateRule = typeof rateRule.$inferSelect;
export type NewRateRule = typeof rateRule.$inferInsert;
