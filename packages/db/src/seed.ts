import { resolve } from 'node:path';
import { config } from 'dotenv';
import { and, eq } from 'drizzle-orm';
import { createDb } from './client';
import * as schema from './schema';

// Also load the monorepo root .env when running from packages/db.
config({ path: resolve(import.meta.dirname, '../../../.env') });

const airports: (typeof schema.airports.$inferInsert)[] = [
  {
    airportCode: 'CGK',
    icaoCode: 'WIII',
    name: 'Soekarno-Hatta International Airport',
    cityCode: 'JKT',
    countryCode: 'ID',
    timezone: 'Asia/Jakarta',
  },
  {
    airportCode: 'DPS',
    icaoCode: 'WADD',
    name: 'Ngurah Rai International Airport',
    cityCode: 'DPS',
    countryCode: 'ID',
    timezone: 'Asia/Makassar',
  },
  {
    airportCode: 'SIN',
    icaoCode: 'WSSS',
    name: 'Singapore Changi Airport',
    cityCode: 'SIN',
    countryCode: 'SG',
    timezone: 'Asia/Singapore',
  },
  {
    airportCode: 'NRT',
    icaoCode: 'RJAA',
    name: 'Narita International Airport',
    cityCode: 'TYO',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
  },
  {
    airportCode: 'HND',
    icaoCode: 'RJTT',
    name: 'Haneda Airport',
    cityCode: 'TYO',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
  },
  {
    airportCode: 'DOH',
    icaoCode: 'OTHH',
    name: 'Hamad International Airport',
    cityCode: 'DOH',
    countryCode: 'QA',
    timezone: 'Asia/Qatar',
  },
  {
    airportCode: 'LHR',
    icaoCode: 'EGLL',
    name: 'Heathrow Airport',
    cityCode: 'LON',
    countryCode: 'GB',
    timezone: 'Europe/London',
  },
  {
    airportCode: 'LGW',
    icaoCode: 'EGKK',
    name: 'Gatwick Airport',
    cityCode: 'LON',
    countryCode: 'GB',
    timezone: 'Europe/London',
  },
  {
    airportCode: 'FCO',
    icaoCode: 'LIRF',
    name: 'Leonardo da Vinci–Fiumicino Airport',
    cityCode: 'ROM',
    countryCode: 'IT',
    timezone: 'Europe/Rome',
  },
  {
    airportCode: 'CDG',
    icaoCode: 'LFPG',
    name: 'Charles de Gaulle Airport',
    cityCode: 'PAR',
    countryCode: 'FR',
    timezone: 'Europe/Paris',
  },
  {
    airportCode: 'JFK',
    icaoCode: 'KJFK',
    name: 'John F. Kennedy International Airport',
    cityCode: 'NYC',
    countryCode: 'US',
    timezone: 'America/New_York',
  },
  {
    airportCode: 'EWR',
    icaoCode: 'KEWR',
    name: 'Newark Liberty International Airport',
    cityCode: 'NYC',
    countryCode: 'US',
    timezone: 'America/New_York',
  },
  {
    // Not in prd/15-seed-data.md's airport table, but required as the
    // technical-stop airport for NH 10's route (prd/14-scenarios.md S7).
    airportCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    cityCode: 'BKK',
    countryCode: 'TH',
    timezone: 'Asia/Bangkok',
  },
];

const airlines: (typeof schema.airlines.$inferInsert)[] = [
  {
    airlineCode: 'GA',
    icaoCode: 'GIA',
    name: 'Garuda Indonesia',
    countryCode: 'ID',
  },
  { airlineCode: 'NH', icaoCode: 'ANA', name: 'ANA', countryCode: 'JP' },
  { airlineCode: 'KL', icaoCode: 'KLM', name: 'KLM', countryCode: 'NL' },
  {
    airlineCode: 'QR',
    icaoCode: 'QTR',
    name: 'Qatar Airways',
    countryCode: 'QA',
  },
  { airlineCode: 'AF', icaoCode: 'AFR', name: 'Air France', countryCode: 'FR' },
  {
    airlineCode: 'SQ',
    icaoCode: 'SIA',
    name: 'Singapore Airlines',
    countryCode: 'SG',
  },
];

type LegSeed = {
  role: 'FULL' | 'TECHNICAL_STOP';
  depAirport: string;
  arrAirport: string;
  departureTime: string;
  arrivalTime: string;
};

type MarketingSeed = {
  marketingAirline: string;
  marketingNumber: string;
  isOperatingCarrier: boolean;
};

type FlightSeed = {
  operatingAirline: string;
  flightNumber: string;
  originAirport: string;
  destAirport: string;
  departureTime: string;
  arrivalTime: string;
  /** Omit for a point-to-point flight (one FULL leg). Provide for a technical stop. */
  legs?: LegSeed[];
  /** Codeshare marketing rows. Exactly one must have isOperatingCarrier=true. */
  marketing?: MarketingSeed[];
};

// Demo flights powering the golden scenarios in prd/14-scenarios.md.
// S9, S11, S13-S18 need mct_rules / interline_agreements (Steps 7-7.5) and
// aren't seeded yet. S12's exact 3-flight chain composition is deferred to
// Step 8, once the connection-validation service pins it down.
const flights: FlightSeed[] = [
  // S7 — NH 10 CGK->LHR, technical stop via BKK. One `flights` row, two
  // `flight_legs` (role TECHNICAL_STOP), one segment.
  {
    operatingAirline: 'NH',
    flightNumber: '10',
    originAirport: 'CGK',
    destAirport: 'LHR',
    departureTime: '2026-06-01T01:00:00+07:00',
    arrivalTime: '2026-06-01T20:00:00+01:00',
    legs: [
      {
        role: 'TECHNICAL_STOP',
        depAirport: 'CGK',
        arrAirport: 'BKK',
        departureTime: '2026-06-01T01:00:00+07:00',
        arrivalTime: '2026-06-01T04:15:00+07:00',
      },
      {
        role: 'TECHNICAL_STOP',
        depAirport: 'BKK',
        arrAirport: 'LHR',
        departureTime: '2026-06-01T05:30:00+07:00',
        arrivalTime: '2026-06-01T20:00:00+01:00',
      },
    ],
  },
  // S1/S2 — P leg. Renamed from the scenario doc's "NH 10" to NH 12 to avoid
  // colliding with the canonical NH 10 technical-stop flight above (S7).
  {
    operatingAirline: 'NH',
    flightNumber: '12',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-06-01T02:00:00+07:00',
    arrivalTime: '2026-06-01T10:45:00+09:00',
  },
  // S1 — N leg: NH 847 NRT->SIN, dep 12:45 JST -> gap 120min vs S1's P.
  {
    operatingAirline: 'NH',
    flightNumber: '847',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTime: '2026-06-01T12:45:00+09:00',
    arrivalTime: '2026-06-01T18:30:00+08:00',
  },
  // S2 — N leg: same flight number, different departure -> distinct row.
  // dep 11:15 JST -> gap 30min vs S1/S2's shared P (below MCT).
  {
    operatingAirline: 'NH',
    flightNumber: '847',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTime: '2026-06-01T11:15:00+09:00',
    arrivalTime: '2026-06-01T17:00:00+08:00',
  },
  // S3 — P: QR 1 CGK->DOH, arr 11:30 +03:00.
  {
    operatingAirline: 'QR',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-06-01T06:30:00+07:00',
    arrivalTime: '2026-06-01T11:30:00+03:00',
  },
  // S3 — N: QR 2 DOH->LHR, dep 09:00 +03:00 two days later (stopover gap).
  {
    operatingAirline: 'QR',
    flightNumber: '2',
    originAirport: 'DOH',
    destAirport: 'LHR',
    departureTime: '2026-06-03T09:00:00+03:00',
    arrivalTime: '2026-06-03T14:00:00+01:00',
  },
  // S4/S5 — P: intl arrival into NRT 08:00 JST (inter-airport connection source).
  {
    operatingAirline: 'GA',
    flightNumber: '5',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-05-31T23:00:00+07:00',
    arrivalTime: '2026-06-01T08:00:00+09:00',
  },
  // S4 — N: intl departure from HND 13:00 JST -> gap 300min (valid, >=240 MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '6',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTime: '2026-06-01T13:00:00+09:00',
    arrivalTime: '2026-06-01T18:00:00+02:00',
  },
  // S5 — N: same route, dep 11:00 JST -> gap 180min (invalid, <240 inter-airport MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '7',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTime: '2026-06-01T11:00:00+09:00',
    arrivalTime: '2026-06-01T16:00:00+02:00',
  },
  // S6 — open-jaw pair: arrives Rome (ROM), next departs Paris (PAR) -- cities don't line up.
  {
    operatingAirline: 'GA',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'FCO',
    departureTime: '2026-05-31T21:00:00+07:00',
    arrivalTime: '2026-06-01T06:00:00+02:00',
  },
  {
    operatingAirline: 'AF',
    flightNumber: '2',
    originAirport: 'CDG',
    destAirport: 'CGK',
    departureTime: '2026-06-01T09:00:00+02:00',
    arrivalTime: '2026-06-02T04:00:00+07:00',
  },
  // S8 — negative-gap guard: N departs before P arrives, same airport (CGK).
  {
    operatingAirline: 'NH',
    flightNumber: '20',
    originAirport: 'SIN',
    destAirport: 'CGK',
    departureTime: '2026-06-01T11:15:00+08:00',
    arrivalTime: '2026-06-01T12:00:00+07:00',
  },
  {
    operatingAirline: 'NH',
    flightNumber: '21',
    originAirport: 'CGK',
    destAirport: 'DPS',
    departureTime: '2026-06-01T11:00:00+07:00',
    arrivalTime: '2026-06-01T14:00:00+08:00',
  },
  // S10 — GA 874 CGK->NRT, operating GA, sold under 3 marketing numbers.
  // Querying by NH 5502 or KL 4062 must resolve back to this one flight.
  {
    operatingAirline: 'GA',
    flightNumber: '874',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-06-05T09:00:00+07:00',
    arrivalTime: '2026-06-05T17:15:00+09:00',
    marketing: [
      {
        marketingAirline: 'GA',
        marketingNumber: '874',
        isOperatingCarrier: true,
      },
      {
        marketingAirline: 'NH',
        marketingNumber: '5502',
        isOperatingCarrier: false,
      },
      {
        marketingAirline: 'KL',
        marketingNumber: '4062',
        isOperatingCarrier: false,
      },
    ],
  },
];

type MctScope = 'DD' | 'DI' | 'ID' | 'II';

type MctRuleSeed = {
  arrivalAirport: string;
  departureAirport: string;
  scope: MctScope;
  arrivalAirline?: string;
  departureAirline?: string;
  arrivalTerminal?: string;
  departureTerminal?: string;
  mctMinutes: number;
  maxConnectionMinutes?: number;
};

// Minimum viable rule set from prd/13-mct-rules.md, plus the S11 pair (the
// NRT/NRT II default below + the NH-specific row that must outrank it).
const mctRules: MctRuleSeed[] = [
  {
    arrivalAirport: 'NRT',
    departureAirport: 'NRT',
    scope: 'II',
    mctMinutes: 60,
  },
  {
    arrivalAirport: 'NRT',
    departureAirport: 'NRT',
    scope: 'ID',
    mctMinutes: 90,
  },
  {
    arrivalAirport: 'NRT',
    departureAirport: 'HND',
    scope: 'II',
    mctMinutes: 240,
  },
  {
    arrivalAirport: 'SIN',
    departureAirport: 'SIN',
    scope: 'II',
    mctMinutes: 60,
  },
  {
    arrivalAirport: 'JFK',
    departureAirport: 'JFK',
    scope: 'II',
    mctMinutes: 75,
  },
  {
    arrivalAirport: 'JFK',
    departureAirport: 'EWR',
    scope: 'II',
    mctMinutes: 300,
  },
  {
    arrivalAirport: 'DOH',
    departureAirport: 'DOH',
    scope: 'II',
    mctMinutes: 60,
    maxConnectionMinutes: 2880,
  },
  // S11 — outranks the NRT/NRT II default above for NH arrivals (1 non-NULL
  // field beats 0).
  {
    arrivalAirport: 'NRT',
    departureAirport: 'NRT',
    scope: 'II',
    arrivalAirline: 'NH',
    mctMinutes: 45,
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const db = createDb(databaseUrl);

  for (const airport of airports) {
    await db.insert(schema.airports).values(airport).onConflictDoUpdate({
      target: schema.airports.airportCode,
      set: airport,
    });
  }

  for (const airline of airlines) {
    await db.insert(schema.airlines).values(airline).onConflictDoUpdate({
      target: schema.airlines.airlineCode,
      set: airline,
    });
  }

  for (const flight of flights) {
    const [row] = await db
      .insert(schema.flights)
      .values({
        operatingAirline: flight.operatingAirline,
        flightNumber: flight.flightNumber,
        originAirport: flight.originAirport,
        destAirport: flight.destAirport,
        departureTime: new Date(flight.departureTime),
        arrivalTime: new Date(flight.arrivalTime),
      })
      .onConflictDoUpdate({
        target: [
          schema.flights.operatingAirline,
          schema.flights.flightNumber,
          schema.flights.departureTime,
        ],
        set: {
          originAirport: flight.originAirport,
          destAirport: flight.destAirport,
          arrivalTime: new Date(flight.arrivalTime),
        },
      })
      .returning();

    const legs = flight.legs ?? [
      {
        role: 'FULL' as const,
        depAirport: flight.originAirport,
        arrAirport: flight.destAirport,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
      },
    ];

    for (const [index, leg] of legs.entries()) {
      await db
        .insert(schema.flightLegs)
        .values({
          flightId: row.id,
          legSequence: index + 1,
          role: leg.role,
          depAirport: leg.depAirport,
          arrAirport: leg.arrAirport,
          departureTime: new Date(leg.departureTime),
          arrivalTime: new Date(leg.arrivalTime),
        })
        .onConflictDoUpdate({
          target: [schema.flightLegs.flightId, schema.flightLegs.legSequence],
          set: {
            role: leg.role,
            depAirport: leg.depAirport,
            arrAirport: leg.arrAirport,
            departureTime: new Date(leg.departureTime),
            arrivalTime: new Date(leg.arrivalTime),
          },
        });
    }

    for (const mkt of flight.marketing ?? []) {
      await db
        .insert(schema.flightMarketing)
        .values({
          flightId: row.id,
          marketingAirline: mkt.marketingAirline,
          marketingNumber: mkt.marketingNumber,
          isOperatingCarrier: mkt.isOperatingCarrier,
        })
        .onConflictDoUpdate({
          target: [
            schema.flightMarketing.marketingAirline,
            schema.flightMarketing.marketingNumber,
            schema.flightMarketing.flightId,
          ],
          set: { isOperatingCarrier: mkt.isOperatingCarrier },
        });
    }
  }

  const marketingCount = flights.reduce(
    (count, flight) => count + (flight.marketing?.length ?? 0),
    0,
  );

  // mct_rules has no unique constraint to target with onConflictDoUpdate —
  // find the matching row by its full identity tuple (nullable fields
  // included) and update it in place, or insert if it's new.
  for (const rule of mctRules) {
    const candidates = await db
      .select()
      .from(schema.mctRules)
      .where(
        and(
          eq(schema.mctRules.arrivalAirport, rule.arrivalAirport),
          eq(schema.mctRules.departureAirport, rule.departureAirport),
          eq(schema.mctRules.scope, rule.scope),
        ),
      );
    const existing = candidates.find(
      (row) =>
        (row.arrivalAirline ?? undefined) === rule.arrivalAirline &&
        (row.departureAirline ?? undefined) === rule.departureAirline &&
        (row.arrivalTerminal ?? undefined) === rule.arrivalTerminal &&
        (row.departureTerminal ?? undefined) === rule.departureTerminal,
    );

    const values = {
      arrivalAirport: rule.arrivalAirport,
      departureAirport: rule.departureAirport,
      scope: rule.scope,
      arrivalAirline: rule.arrivalAirline ?? null,
      departureAirline: rule.departureAirline ?? null,
      arrivalTerminal: rule.arrivalTerminal ?? null,
      departureTerminal: rule.departureTerminal ?? null,
      mctMinutes: rule.mctMinutes,
      maxConnectionMinutes: rule.maxConnectionMinutes ?? 1440,
    };

    if (existing) {
      await db
        .update(schema.mctRules)
        .set(values)
        .where(eq(schema.mctRules.id, existing.id));
    } else {
      await db.insert(schema.mctRules).values(values);
    }
  }

  console.log(
    `Seeded ${airports.length} airports, ${airlines.length} airlines, ${flights.length} flights, ${marketingCount} marketing rows, ${mctRules.length} MCT rules`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
