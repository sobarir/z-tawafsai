import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
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

export const airports = pgTable(
  'airports',
  {
    airportCode: varchar('airport_code', { length: 3 }).primaryKey(),
    icaoCode: varchar('icao_code', { length: 4 }),
    name: varchar('name', { length: 100 }).notNull(),
    cityCode: varchar('city_code', { length: 3 }).notNull(),
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
