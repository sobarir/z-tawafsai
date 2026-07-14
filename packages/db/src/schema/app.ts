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

// Flight schedule & inventory domain — see /prd/flights/11-data-model.md for the full spec.

export const mctScope = pgEnum('mct_scope', ['DD', 'DI', 'ID', 'II']);
export const legRole = pgEnum('leg_role', ['FULL', 'TECHNICAL_STOP']);
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
    departureTime: timestamp('departure_time', {
      withTimezone: true,
    }).notNull(),
    arrivalTime: timestamp('arrival_time', { withTimezone: true }).notNull(),
    aircraftType: varchar('aircraft_type', { length: 10 }),
    status: flightStatus('status').notNull().default('ACTIVE'),
    // Flat, admin-managed price for OTA-style search display/sorting — not a
    // fare class or fare construction; see /prd/flights/00-overview.md Goal 7.
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
    uniqueIndex('flights_carrier_number_departure_unique').on(
      table.operatingAirline,
      table.flightNumber,
      table.departureTime,
    ),
    index('idx_flights_origin_dep').on(
      table.originAirport,
      table.departureTime,
    ),
    index('idx_flights_dest_arr').on(table.destAirport, table.arrivalTime),
    check(
      'flights_arrival_after_departure',
      sql`${table.arrivalTime} > ${table.departureTime}`,
    ),
    check('flights_price_non_negative', sql`${table.price} >= 0`),
  ],
);

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
    role: legRole('role').notNull(),
    depAirport: varchar('dep_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    arrAirport: varchar('arr_airport', { length: 3 })
      .notNull()
      .references(() => airports.airportCode),
    departureTime: timestamp('departure_time', {
      withTimezone: true,
    }).notNull(),
    arrivalTime: timestamp('arrival_time', { withTimezone: true }).notNull(),
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
    check(
      'flight_legs_arrival_after_departure',
      sql`${table.arrivalTime} > ${table.departureTime}`,
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

export const mctRules = pgTable(
  'mct_rules',
  {
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
    arrivalTerminal: varchar('arrival_terminal', { length: 5 }),
    departureTerminal: varchar('departure_terminal', { length: 5 }),
    mctMinutes: integer('mct_minutes').notNull(),
    maxConnectionMinutes: integer('max_connection_minutes')
      .notNull()
      .default(1440),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_mct_lookup').on(
      table.arrivalAirport,
      table.departureAirport,
      table.scope,
    ),
    check('mct_rules_mct_minutes_positive', sql`${table.mctMinutes} > 0`),
    check(
      'mct_rules_max_gte_mct',
      sql`${table.maxConnectionMinutes} >= ${table.mctMinutes}`,
    ),
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

// Hotel & package search domain — see /prd/hotels/11-data-model.md for the full spec.

export const listingKind = pgEnum('listing_kind', ['property', 'package']);
export const seasonName = pgEnum('season_name', [
  'standard',
  'peak',
  'ramadan',
  'hajj',
  'promo',
]);

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

export const listing = pgTable(
  'listing',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    kind: listingKind('kind').notNull(),
    displayName: text('display_name').notNull(),
    destination: text('destination').notNull(),
    countryCode: char('country_code', { length: 2 }).notNull(),
    heroImageUrl: text('hero_image_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('idx_listing_destination').on(table.destination),
    index('idx_listing_kind').on(table.kind),
    index('idx_listing_active_kind').on(table.isActive, table.kind),
  ],
);

// 1:1 with a `kind='property'` listing. `property_code` is a natural key
// (e.g. 'JED-WFH'), matching this repo's convention for stable domain codes.
export const property = pgTable(
  'property',
  {
    propertyCode: text('property_code').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .unique()
      .references(() => listing.id),
    starRating: integer('star_rating'),
    address: text('address'),
  },
  (table) => [
    check(
      'property_star_rating_range',
      sql`${table.starRating} IS NULL OR (${table.starRating} BETWEEN 1 AND 5)`,
    ),
  ],
);

// 1:1 with a `kind='package'` listing. `package` is a reserved word in strict
// mode JS, so the export binding is `travelPackage`; the table name stays `package`.
export const travelPackage = pgTable(
  'package',
  {
    packageCode: text('package_code').primaryKey(),
    listingId: text('listing_id')
      .notNull()
      .unique()
      .references(() => listing.id),
    durationNights: integer('duration_nights').notNull(),
    includes: text('includes'),
  },
  (table) => [
    check('package_duration_positive', sql`${table.durationNights} > 0`),
  ],
);

export const roomType = pgTable(
  'room_type',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    propertyCode: text('property_code')
      .notNull()
      .references(() => property.propertyCode),
    name: text('name').notNull(),
    maxOccupancy: integer('max_occupancy').notNull(),
  },
  (table) => [
    uniqueIndex('room_type_property_name_unique').on(
      table.propertyCode,
      table.name,
    ),
    index('idx_room_type_property').on(table.propertyCode),
    check('room_type_max_occupancy_positive', sql`${table.maxOccupancy} > 0`),
  ],
);

// Non-overlap within a listing is enforced by a Postgres EXCLUDE constraint
// (daterange + btree_gist) — Drizzle's schema builder has no API for EXCLUDE,
// so it's added via a hand-written custom migration, not expressed here.
// See drizzle/<timestamp>_season_no_overlap.sql.
export const season = pgTable(
  'season',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    listingId: text('listing_id')
      .notNull()
      .references(() => listing.id),
    name: seasonName('name').notNull(),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('idx_season_listing_start').on(table.listingId, table.startDate),
    check('season_end_after_start', sql`${table.endDate} > ${table.startDate}`),
  ],
);

export const rateRule = pgTable(
  'rate_rule',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    listingId: text('listing_id')
      .notNull()
      .references(() => listing.id),
    seasonId: text('season_id')
      .notNull()
      .references(() => season.id),
    // NULL for packages, required for properties.
    roomTypeId: text('room_type_id').references(() => roomType.id),
    minOccupancy: integer('min_occupancy').notNull(),
    maxOccupancy: integer('max_occupancy').notNull(),
    // Minor units. Per-night for properties, total for packages — the
    // distinction is carried by the parent listing's `kind`, not this table.
    amount: integer('amount').notNull(),
    currency: char('currency', { length: 3 })
      .notNull()
      .references(() => currency.code),
  },
  (table) => [
    index('idx_rate_rule_listing_season').on(table.listingId, table.seasonId),
    check(
      'rate_rule_max_gte_min',
      sql`${table.maxOccupancy} >= ${table.minOccupancy}`,
    ),
    check('rate_rule_amount_non_negative', sql`${table.amount} >= 0`),
    uniqueIndex('rate_rule_band_unique').on(
      table.listingId,
      table.seasonId,
      table.roomTypeId,
      table.minOccupancy,
      table.maxOccupancy,
    ),
    // Partial unique for the package case: Postgres treats NULLs as distinct
    // in a plain UNIQUE constraint, so the base index above never catches
    // colliding package bands (room_type_id always NULL for those rows).
    uniqueIndex('rate_rule_band_unique_no_room_type')
      .on(
        table.listingId,
        table.seasonId,
        table.minOccupancy,
        table.maxOccupancy,
      )
      .where(sql`${table.roomTypeId} IS NULL`),
  ],
);

// Combines a specific flight with a specific hotel property into one
// admin-curated, flat-priced offering — a display/catalog product, not a
// booking (no fares/PNR/seats). See prd/hotels/CONTEXT.md for the decision.
export const flightHotelPackage = pgTable('travel_package', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  flightId: varchar('flight_id', { length: 26 })
    .notNull()
    .references(() => flights.id),
  propertyCode: text('property_code')
    .notNull()
    .references(() => property.propertyCode),
  durationNights: integer('duration_nights').notNull(),
  heroImageUrl: text('hero_image_url'),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' })
    .notNull()
    .default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

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
export type MctRule = typeof mctRules.$inferSelect;
export type NewMctRule = typeof mctRules.$inferInsert;
export type InterlineAgreement = typeof interlineAgreements.$inferSelect;
export type NewInterlineAgreement = typeof interlineAgreements.$inferInsert;

export type Currency = typeof currency.$inferSelect;
export type NewCurrency = typeof currency.$inferInsert;
export type FxRate = typeof fxRate.$inferSelect;
export type NewFxRate = typeof fxRate.$inferInsert;
export type Listing = typeof listing.$inferSelect;
export type NewListing = typeof listing.$inferInsert;
export type Property = typeof property.$inferSelect;
export type NewProperty = typeof property.$inferInsert;
export type TravelPackage = typeof travelPackage.$inferSelect;
export type NewTravelPackage = typeof travelPackage.$inferInsert;
export type RoomType = typeof roomType.$inferSelect;
export type NewRoomType = typeof roomType.$inferInsert;
export type Season = typeof season.$inferSelect;
export type NewSeason = typeof season.$inferInsert;
export type FlightHotelPackage = typeof flightHotelPackage.$inferSelect;
export type NewFlightHotelPackage = typeof flightHotelPackage.$inferInsert;
export type RateRule = typeof rateRule.$inferSelect;
export type NewRateRule = typeof rateRule.$inferInsert;
