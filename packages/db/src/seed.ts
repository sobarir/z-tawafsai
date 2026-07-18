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
    // Not in prd/flights/15-seed-data.md's airport table, but required as the
    // technical-stop airport for NH 10's route (prd/flights/14-scenarios.md S7).
    airportCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    cityCode: 'BKK',
    countryCode: 'TH',
    timezone: 'Asia/Bangkok',
  },
  {
    // Not in prd/flights/15-seed-data.md's airport table, but required as KL 800's
    // destination for the interline scenario (prd/flights/14-scenarios.md S16).
    airportCode: 'AMS',
    icaoCode: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    cityCode: 'AMS',
    countryCode: 'NL',
    timezone: 'Europe/Amsterdam',
  },
  // CGK<->JED/MED realistic search-data airports (Jeddah/Madinah corridor + 9
  // transit hubs, prd/flights/15-seed-data.md v1.2). SIN and DOH above are reused.
  {
    airportCode: 'JED',
    icaoCode: 'OEJN',
    name: 'King Abdulaziz International Airport',
    cityCode: 'JED',
    countryCode: 'SA',
    timezone: 'Asia/Riyadh',
  },
  {
    airportCode: 'MED',
    icaoCode: 'OEMA',
    name: 'Prince Mohammad bin Abdulaziz International Airport',
    cityCode: 'MED',
    countryCode: 'SA',
    timezone: 'Asia/Riyadh',
  },
  {
    airportCode: 'KUL',
    icaoCode: 'WMKK',
    name: 'Kuala Lumpur International Airport',
    cityCode: 'KUL',
    countryCode: 'MY',
    timezone: 'Asia/Kuala_Lumpur',
  },
  {
    airportCode: 'DXB',
    icaoCode: 'OMDB',
    name: 'Dubai International Airport',
    cityCode: 'DXB',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
  },
  {
    airportCode: 'AUH',
    icaoCode: 'OMAA',
    name: 'Abu Dhabi International Airport',
    cityCode: 'AUH',
    countryCode: 'AE',
    timezone: 'Asia/Dubai',
  },
  {
    airportCode: 'CAI',
    icaoCode: 'HECA',
    name: 'Cairo International Airport',
    cityCode: 'CAI',
    countryCode: 'EG',
    timezone: 'Africa/Cairo',
  },
  {
    airportCode: 'BOM',
    icaoCode: 'VABB',
    name: 'Chhatrapati Shivaji Maharaj International Airport',
    cityCode: 'BOM',
    countryCode: 'IN',
    timezone: 'Asia/Kolkata',
  },
  {
    airportCode: 'HAK',
    icaoCode: 'ZJHK',
    name: 'Haikou Meilan International Airport',
    cityCode: 'HAK',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai',
  },
  {
    airportCode: 'MCT',
    icaoCode: 'OOMS',
    name: 'Muscat International Airport',
    cityCode: 'MCT',
    countryCode: 'OM',
    timezone: 'Asia/Muscat',
  },
  {
    airportCode: 'IST',
    icaoCode: 'LTFM',
    name: 'Istanbul Airport',
    cityCode: 'IST',
    countryCode: 'TR',
    timezone: 'Europe/Istanbul',
  },
];

// One city per distinct cityCode used by the airports above, plus matching
// countryCode — backs the City reference dropdown used by both the airport
// and hotel property/package admin forms.
const cities: (typeof schema.city.$inferInsert)[] = [
  { cityCode: 'JKT', name: 'Jakarta', countryCode: 'ID' },
  { cityCode: 'DPS', name: 'Denpasar', countryCode: 'ID' },
  { cityCode: 'SIN', name: 'Singapore', countryCode: 'SG' },
  { cityCode: 'TYO', name: 'Tokyo', countryCode: 'JP' },
  { cityCode: 'DOH', name: 'Doha', countryCode: 'QA' },
  { cityCode: 'LON', name: 'London', countryCode: 'GB' },
  { cityCode: 'ROM', name: 'Rome', countryCode: 'IT' },
  { cityCode: 'PAR', name: 'Paris', countryCode: 'FR' },
  { cityCode: 'NYC', name: 'New York', countryCode: 'US' },
  { cityCode: 'BKK', name: 'Bangkok', countryCode: 'TH' },
  { cityCode: 'AMS', name: 'Amsterdam', countryCode: 'NL' },
  { cityCode: 'JED', name: 'Jeddah', countryCode: 'SA' },
  { cityCode: 'MED', name: 'Madinah', countryCode: 'SA' },
  { cityCode: 'KUL', name: 'Kuala Lumpur', countryCode: 'MY' },
  { cityCode: 'DXB', name: 'Dubai', countryCode: 'AE' },
  { cityCode: 'AUH', name: 'Abu Dhabi', countryCode: 'AE' },
  { cityCode: 'CAI', name: 'Cairo', countryCode: 'EG' },
  { cityCode: 'BOM', name: 'Mumbai', countryCode: 'IN' },
  { cityCode: 'HAK', name: 'Haikou', countryCode: 'CN' },
  { cityCode: 'MCT', name: 'Muscat', countryCode: 'OM' },
  { cityCode: 'IST', name: 'Istanbul', countryCode: 'TR' },
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
  // CGK<->JED/MED realistic search-data airlines (prd/flights/15-seed-data.md v1.2).
  // GA, SQ, QR above are reused.
  { airlineCode: 'SV', icaoCode: 'SVA', name: 'Saudia', countryCode: 'SA' },
  {
    airlineCode: 'MH',
    icaoCode: 'MAS',
    name: 'Malaysia Airlines',
    countryCode: 'MY',
  },
  { airlineCode: 'EK', icaoCode: 'UAE', name: 'Emirates', countryCode: 'AE' },
  {
    airlineCode: 'EY',
    icaoCode: 'ETD',
    name: 'Etihad Airways',
    countryCode: 'AE',
  },
  { airlineCode: 'MS', icaoCode: 'MSR', name: 'EgyptAir', countryCode: 'EG' },
  { airlineCode: 'AI', icaoCode: 'AIC', name: 'Air India', countryCode: 'IN' },
  {
    airlineCode: 'HU',
    icaoCode: 'CHH',
    name: 'Hainan Airlines',
    countryCode: 'CN',
  },
  { airlineCode: 'WY', icaoCode: 'OMA', name: 'Oman Air', countryCode: 'OM' },
  { airlineCode: 'TR', icaoCode: 'TGW', name: 'Scoot', countryCode: 'SG' },
  { airlineCode: '6E', icaoCode: 'IGO', name: 'IndiGo', countryCode: 'IN' },
  // Added from prd/airline_list.md (2026-07-18 CGK Umrah airline comparison).
  { airlineCode: 'JT', icaoCode: 'LNI', name: 'Lion Air', countryCode: 'ID' },
  { airlineCode: 'ID', icaoCode: 'BTK', name: 'Batik Air', countryCode: 'ID' },
  { airlineCode: 'QG', icaoCode: 'CTV', name: 'Citilink', countryCode: 'ID' },
  {
    airlineCode: 'TK',
    icaoCode: 'THY',
    name: 'Turkish Airlines',
    countryCode: 'TR',
  },
  { airlineCode: 'XY', icaoCode: 'KNE', name: 'Flynas', countryCode: 'SA' },
  {
    airlineCode: 'D7',
    icaoCode: 'XAX',
    name: 'AirAsia X',
    countryCode: 'MY',
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
  /** Flat admin-managed price for search display; see /prd/flights/00-overview.md Goal 7. */
  price: number;
  /** Defaults to 'USD' if omitted. */
  currency?: string;
  /** Omit for a point-to-point flight (one FULL leg). Provide for a technical stop. */
  legs?: LegSeed[];
  /** Codeshare marketing rows. Exactly one must have isOperatingCarrier=true. */
  marketing?: MarketingSeed[];
};

// Demo flights powering the golden scenarios in prd/flights/14-scenarios.md. S1-S8's
// gaps fall out of the times below exactly as scripted; S9+ are keyed by
// scenario in the comments alongside each flight.
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
    price: 950,
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
    price: 545,
  },
  // S1 — N leg: NH 847 NRT->SIN, dep 12:45 JST -> gap 120min vs S1's P.
  {
    operatingAirline: 'NH',
    flightNumber: '847',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTime: '2026-06-01T12:45:00+09:00',
    arrivalTime: '2026-06-01T18:30:00+08:00',
    price: 385,
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
    price: 405,
  },
  // S3 — P: QR 1 CGK->DOH, arr 11:30 +03:00.
  {
    operatingAirline: 'QR',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-06-01T06:30:00+07:00',
    arrivalTime: '2026-06-01T11:30:00+03:00',
    price: 620,
  },
  // S3 — N: QR 2 DOH->LHR, dep 09:00 +03:00 two days later (stopover gap).
  {
    operatingAirline: 'QR',
    flightNumber: '2',
    originAirport: 'DOH',
    destAirport: 'LHR',
    departureTime: '2026-06-03T09:00:00+03:00',
    arrivalTime: '2026-06-03T14:00:00+01:00',
    price: 480,
  },
  // S4/S5 — P: intl arrival into NRT 08:00 JST (inter-airport connection source).
  {
    operatingAirline: 'GA',
    flightNumber: '5',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-05-31T23:00:00+07:00',
    arrivalTime: '2026-06-01T08:00:00+09:00',
    price: 560,
  },
  // S4 — N: intl departure from HND 13:00 JST -> gap 300min (valid, >=240 MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '6',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTime: '2026-06-01T13:00:00+09:00',
    arrivalTime: '2026-06-01T18:00:00+02:00',
    price: 980,
  },
  // S5 — N: same route, dep 11:00 JST -> gap 180min (invalid, <240 inter-airport MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '7',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTime: '2026-06-01T11:00:00+09:00',
    arrivalTime: '2026-06-01T16:00:00+02:00',
    price: 960,
  },
  // S6 — open-jaw pair: arrives Rome (ROM), next departs Paris (PAR) -- cities don't line up.
  {
    operatingAirline: 'GA',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'FCO',
    departureTime: '2026-05-31T21:00:00+07:00',
    arrivalTime: '2026-06-01T06:00:00+02:00',
    price: 890,
  },
  {
    operatingAirline: 'AF',
    flightNumber: '2',
    originAirport: 'CDG',
    destAirport: 'CGK',
    departureTime: '2026-06-01T09:00:00+02:00',
    arrivalTime: '2026-06-02T04:00:00+07:00',
    price: 910,
  },
  // S8 — negative-gap guard: N departs before P arrives, same airport (CGK).
  {
    operatingAirline: 'NH',
    flightNumber: '20',
    originAirport: 'SIN',
    destAirport: 'CGK',
    departureTime: '2026-06-01T11:15:00+08:00',
    arrivalTime: '2026-06-01T12:00:00+07:00',
    price: 180,
  },
  {
    operatingAirline: 'NH',
    flightNumber: '21',
    originAirport: 'CGK',
    destAirport: 'DPS',
    departureTime: '2026-06-01T11:00:00+07:00',
    arrivalTime: '2026-06-01T14:00:00+08:00',
    price: 90,
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
    price: 570,
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
  // S9 — no MCT rule seeded for DPS at all (guard: NO_MCT_RULE, not a silent pass).
  {
    operatingAirline: 'SQ',
    flightNumber: '10',
    originAirport: 'SIN',
    destAirport: 'DPS',
    departureTime: '2026-06-01T11:30:00+08:00',
    arrivalTime: '2026-06-01T14:00:00+08:00',
    price: 140,
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '11',
    originAirport: 'DPS',
    destAirport: 'SIN',
    departureTime: '2026-06-01T16:00:00+08:00',
    arrivalTime: '2026-06-01T19:00:00+08:00',
    price: 145,
  },
  // S12 — 3-flight chain CGK->NRT->HND->LHR. Junction 1 (F1/F2, NRT/NRT
  // ID) is same-airport; junction 2 (F2/F3, HND/NRT DI — see the new
  // mct_rules entry below) is inter-airport, same Tokyo metro.
  {
    operatingAirline: 'GA',
    flightNumber: '10',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-06-01T05:00:00+07:00',
    arrivalTime: '2026-06-01T13:00:00+09:00',
    price: 555,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '11',
    originAirport: 'NRT',
    destAirport: 'HND',
    departureTime: '2026-06-01T14:45:00+09:00',
    arrivalTime: '2026-06-01T15:30:00+09:00',
    price: 60,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '12',
    originAirport: 'NRT',
    destAirport: 'LHR',
    departureTime: '2026-06-01T20:00:00+09:00',
    arrivalTime: '2026-06-02T01:00:00+01:00',
    price: 920,
  },
  // S13/S14/S15 — shared P: GA 100 CGK->SIN, online/interline/no-interline Ns.
  {
    operatingAirline: 'GA',
    flightNumber: '100',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-06-04T05:00:00+07:00',
    arrivalTime: '2026-06-04T10:00:00+08:00',
    price: 160,
  },
  // S13 — N: same carrier GA, online, no interline lookup needed.
  {
    operatingAirline: 'GA',
    flightNumber: '200',
    originAirport: 'SIN',
    destAirport: 'NRT',
    departureTime: '2026-06-04T11:30:00+08:00',
    arrivalTime: '2026-06-04T19:30:00+09:00',
    price: 420,
  },
  // S14 — N: operating SQ, GA->SQ agreement permits it, bags through.
  {
    operatingAirline: 'SQ',
    flightNumber: '300',
    originAirport: 'SIN',
    destAirport: 'NRT',
    departureTime: '2026-06-04T11:30:00+08:00',
    arrivalTime: '2026-06-04T19:30:00+09:00',
    price: 410,
  },
  // S15 — N: operating AF, no GA->AF agreement -> NO_INTERLINE.
  {
    operatingAirline: 'AF',
    flightNumber: '400',
    originAirport: 'SIN',
    destAirport: 'CDG',
    departureTime: '2026-06-04T13:00:00+08:00',
    arrivalTime: '2026-06-04T20:00:00+02:00',
    price: 780,
  },
  // S16 — interline permitted but bags NOT through-checked (NH->KL agreement).
  {
    operatingAirline: 'NH',
    flightNumber: '30',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTime: '2026-06-05T01:00:00+07:00',
    arrivalTime: '2026-06-05T09:00:00+09:00',
    price: 565,
  },
  {
    operatingAirline: 'KL',
    flightNumber: '800',
    originAirport: 'NRT',
    destAirport: 'AMS',
    departureTime: '2026-06-05T10:30:00+09:00',
    arrivalTime: '2026-06-05T15:30:00+02:00',
    price: 890,
  },
  // S17 — directional agreement is one-way: GA->QR exists, QR->GA does not.
  {
    operatingAirline: 'QR',
    flightNumber: '50',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-06-02T05:00:00+07:00',
    arrivalTime: '2026-06-02T10:00:00+03:00',
    price: 630,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '51',
    originAirport: 'DOH',
    destAirport: 'CGK',
    departureTime: '2026-06-02T11:30:00+03:00',
    arrivalTime: '2026-06-03T00:30:00+07:00',
    price: 640,
  },
  // S18 — N for GA 874 (S10): interline gate must key off GA (operating),
  // never NH 5502 (marketing). No NH->SQ agreement exists — only GA->SQ.
  {
    operatingAirline: 'SQ',
    flightNumber: '500',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTime: '2026-06-05T19:00:00+09:00',
    arrivalTime: '2026-06-06T01:00:00+08:00',
    price: 395,
  },
  // --- CGK<->JED/MED realistic search-demo data (prd/flights/15-seed-data.md
  // v1.2). 26 route-patterns, 180 flights, Aug/Sep/Oct 2026. Direct (GA/SV) plus
  // 9 transit hubs; MED is only reachable where a hub carrier genuinely flies
  // onward to MED (KUL/MH, DOH/QR, MCT/WY) or via the SV JED-MED domestic
  // connector otherwise. See CONTEXT.md Step 10 for the full design rationale. ---
  // GA CGK-JED (GA 402)
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T11:50:00+07:00',
    arrivalTime: '2026-08-05T17:40:00+03:00',
    price: 13122000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T11:50:00+07:00',
    arrivalTime: '2026-08-15T17:40:00+03:00',
    price: 13529000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T11:50:00+07:00',
    arrivalTime: '2026-08-25T17:40:00+03:00',
    price: 13937000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T11:50:00+07:00',
    arrivalTime: '2026-09-05T17:40:00+03:00',
    price: 12470000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T11:50:00+07:00',
    arrivalTime: '2026-09-15T17:40:00+03:00',
    price: 12877000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T11:50:00+07:00',
    arrivalTime: '2026-09-25T17:40:00+03:00',
    price: 13203000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T11:50:00+07:00',
    arrivalTime: '2026-10-05T17:40:00+03:00',
    price: 13774000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T11:50:00+07:00',
    arrivalTime: '2026-10-15T17:40:00+03:00',
    price: 14181000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T11:50:00+07:00',
    arrivalTime: '2026-10-25T17:40:00+03:00',
    price: 14670000,
    currency: 'IDR',
  },
  // GA CGK-MED (GA 404)
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T13:30:00+07:00',
    arrivalTime: '2026-08-05T19:45:00+03:00',
    price: 13448000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T13:30:00+07:00',
    arrivalTime: '2026-08-15T19:45:00+03:00',
    price: 13855000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T13:30:00+07:00',
    arrivalTime: '2026-08-25T19:45:00+03:00',
    price: 14263000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T13:30:00+07:00',
    arrivalTime: '2026-09-05T19:45:00+03:00',
    price: 12796000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T13:30:00+07:00',
    arrivalTime: '2026-09-15T19:45:00+03:00',
    price: 13203000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T13:30:00+07:00',
    arrivalTime: '2026-09-25T19:45:00+03:00',
    price: 13529000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T13:30:00+07:00',
    arrivalTime: '2026-10-05T19:45:00+03:00',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T13:30:00+07:00',
    arrivalTime: '2026-10-15T19:45:00+03:00',
    price: 14589000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T13:30:00+07:00',
    arrivalTime: '2026-10-25T19:45:00+03:00',
    price: 14996000,
    currency: 'IDR',
  },
  // SV CGK-JED (SV 816)
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T09:10:00+07:00',
    arrivalTime: '2026-08-05T15:15:00+03:00',
    price: 12633000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T09:10:00+07:00',
    arrivalTime: '2026-08-15T15:15:00+03:00',
    price: 13040000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T09:10:00+07:00',
    arrivalTime: '2026-08-25T15:15:00+03:00',
    price: 13448000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T09:10:00+07:00',
    arrivalTime: '2026-09-05T15:15:00+03:00',
    price: 11981000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T09:10:00+07:00',
    arrivalTime: '2026-09-15T15:15:00+03:00',
    price: 12388000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T09:10:00+07:00',
    arrivalTime: '2026-09-25T15:15:00+03:00',
    price: 12796000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T09:10:00+07:00',
    arrivalTime: '2026-10-05T15:15:00+03:00',
    price: 13285000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T09:10:00+07:00',
    arrivalTime: '2026-10-15T15:15:00+03:00',
    price: 13692000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T09:10:00+07:00',
    arrivalTime: '2026-10-25T15:15:00+03:00',
    price: 14100000,
    currency: 'IDR',
  },
  // SV CGK-MED (SV 818)
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T17:30:00+07:00',
    arrivalTime: '2026-08-05T23:40:00+03:00',
    price: 12959000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T17:30:00+07:00',
    arrivalTime: '2026-08-15T23:40:00+03:00',
    price: 13366000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T17:30:00+07:00',
    arrivalTime: '2026-08-25T23:40:00+03:00',
    price: 13774000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T17:30:00+07:00',
    arrivalTime: '2026-09-05T23:40:00+03:00',
    price: 12307000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T17:30:00+07:00',
    arrivalTime: '2026-09-15T23:40:00+03:00',
    price: 12714000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T17:30:00+07:00',
    arrivalTime: '2026-09-25T23:40:00+03:00',
    price: 13040000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T17:30:00+07:00',
    arrivalTime: '2026-10-05T23:40:00+03:00',
    price: 13611000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T17:30:00+07:00',
    arrivalTime: '2026-10-15T23:40:00+03:00',
    price: 14018000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T17:30:00+07:00',
    arrivalTime: '2026-10-25T23:40:00+03:00',
    price: 14426000,
    currency: 'IDR',
  },
  // SV JED-MED (AM) (SV 1420)
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-08T14:15:00+03:00',
    arrivalTime: '2026-08-08T15:20:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-15T14:15:00+03:00',
    arrivalTime: '2026-08-15T15:20:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-22T14:15:00+03:00',
    arrivalTime: '2026-08-22T15:20:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-08T14:15:00+03:00',
    arrivalTime: '2026-09-08T15:20:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-15T14:15:00+03:00',
    arrivalTime: '2026-09-15T15:20:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-22T14:15:00+03:00',
    arrivalTime: '2026-09-22T15:20:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-08T14:15:00+03:00',
    arrivalTime: '2026-10-08T15:20:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-15T14:15:00+03:00',
    arrivalTime: '2026-10-15T15:20:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-22T14:15:00+03:00',
    arrivalTime: '2026-10-22T15:20:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  // SV JED-MED (PM) (SV 1422)
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-08T23:00:00+03:00',
    arrivalTime: '2026-08-09T00:05:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-15T23:00:00+03:00',
    arrivalTime: '2026-08-16T00:05:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-08-22T23:00:00+03:00',
    arrivalTime: '2026-08-23T00:05:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-08T23:00:00+03:00',
    arrivalTime: '2026-09-09T00:05:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-15T23:00:00+03:00',
    arrivalTime: '2026-09-16T00:05:00+03:00',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-09-22T23:00:00+03:00',
    arrivalTime: '2026-09-23T00:05:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-08T23:00:00+03:00',
    arrivalTime: '2026-10-09T00:05:00+03:00',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-15T23:00:00+03:00',
    arrivalTime: '2026-10-16T00:05:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTime: '2026-10-22T23:00:00+03:00',
    arrivalTime: '2026-10-23T00:05:00+03:00',
    price: 1467000,
    currency: 'IDR',
  },
  // SQ CGK-SIN (SQ 936)
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-08-08T07:00:00+07:00',
    arrivalTime: '2026-08-08T09:45:00+08:00',
    price: 2608000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-08-22T07:00:00+07:00',
    arrivalTime: '2026-08-22T09:45:00+08:00',
    price: 2690000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-09-08T07:00:00+07:00',
    arrivalTime: '2026-09-08T09:45:00+08:00',
    price: 2445000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-09-22T07:00:00+07:00',
    arrivalTime: '2026-09-22T09:45:00+08:00',
    price: 2527000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-10-08T07:00:00+07:00',
    arrivalTime: '2026-10-08T09:45:00+08:00',
    price: 2771000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTime: '2026-10-22T07:00:00+07:00',
    arrivalTime: '2026-10-22T09:45:00+08:00',
    price: 2853000,
    currency: 'IDR',
  },
  // TR SIN-JED (TR 2118)
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-08-08T12:30:00+08:00',
    arrivalTime: '2026-08-08T17:20:00+03:00',
    price: 8232000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-08-22T12:30:00+08:00',
    arrivalTime: '2026-08-22T17:20:00+03:00',
    price: 8476000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-09-08T12:30:00+08:00',
    arrivalTime: '2026-09-08T17:20:00+03:00',
    price: 7824000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-09-22T12:30:00+08:00',
    arrivalTime: '2026-09-22T17:20:00+03:00',
    price: 8069000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-10-08T12:30:00+08:00',
    arrivalTime: '2026-10-08T17:20:00+03:00',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTime: '2026-10-22T12:30:00+08:00',
    arrivalTime: '2026-10-22T17:20:00+03:00',
    price: 8884000,
    currency: 'IDR',
  },
  // MH CGK-KUL (MH 725)
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-08-08T08:00:00+07:00',
    arrivalTime: '2026-08-08T11:15:00+08:00',
    price: 2934000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-08-22T08:00:00+07:00',
    arrivalTime: '2026-08-22T11:15:00+08:00',
    price: 3016000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-09-08T08:00:00+07:00',
    arrivalTime: '2026-09-08T11:15:00+08:00',
    price: 2771000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-09-22T08:00:00+07:00',
    arrivalTime: '2026-09-22T11:15:00+08:00',
    price: 2853000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-10-08T08:00:00+07:00',
    arrivalTime: '2026-10-08T11:15:00+08:00',
    price: 3097000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-10-22T08:00:00+07:00',
    arrivalTime: '2026-10-22T11:15:00+08:00',
    price: 3179000,
    currency: 'IDR',
  },
  // MH KUL-JED (MH 152)
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-08-08T14:00:00+08:00',
    arrivalTime: '2026-08-08T19:30:00+03:00',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-08-22T14:00:00+08:00',
    arrivalTime: '2026-08-22T19:30:00+03:00',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-09-08T14:00:00+08:00',
    arrivalTime: '2026-09-08T19:30:00+03:00',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-09-22T14:00:00+08:00',
    arrivalTime: '2026-09-22T19:30:00+03:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-10-08T14:00:00+08:00',
    arrivalTime: '2026-10-08T19:30:00+03:00',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-10-22T14:00:00+08:00',
    arrivalTime: '2026-10-22T19:30:00+03:00',
    price: 10269000,
    currency: 'IDR',
  },
  // MH KUL-MED (MH 158)
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-08-08T14:15:00+08:00',
    arrivalTime: '2026-08-08T19:50:00+03:00',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-08-22T14:15:00+08:00',
    arrivalTime: '2026-08-22T19:50:00+03:00',
    price: 10106000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-09-08T14:15:00+08:00',
    arrivalTime: '2026-09-08T19:50:00+03:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-09-22T14:15:00+08:00',
    arrivalTime: '2026-09-22T19:50:00+03:00',
    price: 9617000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-10-08T14:15:00+08:00',
    arrivalTime: '2026-10-08T19:50:00+03:00',
    price: 10269000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTime: '2026-10-22T14:15:00+08:00',
    arrivalTime: '2026-10-22T19:50:00+03:00',
    price: 10595000,
    currency: 'IDR',
  },
  // EK CGK-DXB (EK 359)
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-08-08T08:00:00+07:00',
    arrivalTime: '2026-08-08T12:45:00+04:00',
    price: 8884000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-08-22T08:00:00+07:00',
    arrivalTime: '2026-08-22T12:45:00+04:00',
    price: 9128000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-09-08T08:00:00+07:00',
    arrivalTime: '2026-09-08T12:45:00+04:00',
    price: 8395000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-09-22T08:00:00+07:00',
    arrivalTime: '2026-09-22T12:45:00+04:00',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-10-08T08:00:00+07:00',
    arrivalTime: '2026-10-08T12:45:00+04:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTime: '2026-10-22T08:00:00+07:00',
    arrivalTime: '2026-10-22T12:45:00+04:00',
    price: 9617000,
    currency: 'IDR',
  },
  // EK DXB-JED (EK 815)
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-08-08T15:30:00+04:00',
    arrivalTime: '2026-08-08T17:20:00+03:00',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-08-22T15:30:00+04:00',
    arrivalTime: '2026-08-22T17:20:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-09-08T15:30:00+04:00',
    arrivalTime: '2026-09-08T17:20:00+03:00',
    price: 3749000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-09-22T15:30:00+04:00',
    arrivalTime: '2026-09-22T17:20:00+03:00',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-10-08T15:30:00+04:00',
    arrivalTime: '2026-10-08T17:20:00+03:00',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTime: '2026-10-22T15:30:00+04:00',
    arrivalTime: '2026-10-22T17:20:00+03:00',
    price: 4320000,
    currency: 'IDR',
  },
  // EY CGK-AUH (EY 475)
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-08-08T09:00:00+07:00',
    arrivalTime: '2026-08-08T14:40:00+04:00',
    price: 9210000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-08-22T09:00:00+07:00',
    arrivalTime: '2026-08-22T14:40:00+04:00',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-09-08T09:00:00+07:00',
    arrivalTime: '2026-09-08T14:40:00+04:00',
    price: 8721000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-09-22T09:00:00+07:00',
    arrivalTime: '2026-09-22T14:40:00+04:00',
    price: 8965000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-10-08T09:00:00+07:00',
    arrivalTime: '2026-10-08T14:40:00+04:00',
    price: 9617000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTime: '2026-10-22T09:00:00+07:00',
    arrivalTime: '2026-10-22T14:40:00+04:00',
    price: 9943000,
    currency: 'IDR',
  },
  // EY AUH-JED (EY 233)
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-08-08T17:30:00+04:00',
    arrivalTime: '2026-08-08T19:30:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-08-22T17:30:00+04:00',
    arrivalTime: '2026-08-22T19:30:00+03:00',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-09-08T17:30:00+04:00',
    arrivalTime: '2026-09-08T19:30:00+03:00',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-09-22T17:30:00+04:00',
    arrivalTime: '2026-09-22T19:30:00+03:00',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-10-08T17:30:00+04:00',
    arrivalTime: '2026-10-08T19:30:00+03:00',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTime: '2026-10-22T17:30:00+04:00',
    arrivalTime: '2026-10-22T19:30:00+03:00',
    price: 4483000,
    currency: 'IDR',
  },
  // QR CGK-DOH (QR 956)
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-08-08T09:00:00+07:00',
    arrivalTime: '2026-08-08T14:30:00+03:00',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-08-22T09:00:00+07:00',
    arrivalTime: '2026-08-22T14:30:00+03:00',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-09-08T09:00:00+07:00',
    arrivalTime: '2026-09-08T14:30:00+03:00',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-09-22T09:00:00+07:00',
    arrivalTime: '2026-09-22T14:30:00+03:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-10-08T09:00:00+07:00',
    arrivalTime: '2026-10-08T14:30:00+03:00',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTime: '2026-10-22T09:00:00+07:00',
    arrivalTime: '2026-10-22T14:30:00+03:00',
    price: 10269000,
    currency: 'IDR',
  },
  // QR DOH-JED (QR 1105)
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-08-08T17:00:00+03:00',
    arrivalTime: '2026-08-08T19:30:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-08-22T17:00:00+03:00',
    arrivalTime: '2026-08-22T19:30:00+03:00',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-09-08T17:00:00+03:00',
    arrivalTime: '2026-09-08T19:30:00+03:00',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-09-22T17:00:00+03:00',
    arrivalTime: '2026-09-22T19:30:00+03:00',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-10-08T17:00:00+03:00',
    arrivalTime: '2026-10-08T19:30:00+03:00',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTime: '2026-10-22T17:00:00+03:00',
    arrivalTime: '2026-10-22T19:30:00+03:00',
    price: 4483000,
    currency: 'IDR',
  },
  // QR DOH-MED (QR 1107)
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-08-08T17:15:00+03:00',
    arrivalTime: '2026-08-08T19:50:00+03:00',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-08-22T17:15:00+03:00',
    arrivalTime: '2026-08-22T19:50:00+03:00',
    price: 4401000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-09-08T17:15:00+03:00',
    arrivalTime: '2026-09-08T19:50:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-09-22T17:15:00+03:00',
    arrivalTime: '2026-09-22T19:50:00+03:00',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-10-08T17:15:00+03:00',
    arrivalTime: '2026-10-08T19:50:00+03:00',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTime: '2026-10-22T17:15:00+03:00',
    arrivalTime: '2026-10-22T19:50:00+03:00',
    price: 4646000,
    currency: 'IDR',
  },
  // 6E CGK-BOM (6E 1975)
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-08-08T10:00:00+07:00',
    arrivalTime: '2026-08-08T15:00:00+05:30',
    price: 4564000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-08-22T10:00:00+07:00',
    arrivalTime: '2026-08-22T15:00:00+05:30',
    price: 4727000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-09-08T10:00:00+07:00',
    arrivalTime: '2026-09-08T15:00:00+05:30',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-09-22T10:00:00+07:00',
    arrivalTime: '2026-09-22T15:00:00+05:30',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-10-08T10:00:00+07:00',
    arrivalTime: '2026-10-08T15:00:00+05:30',
    price: 4809000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTime: '2026-10-22T10:00:00+07:00',
    arrivalTime: '2026-10-22T15:00:00+05:30',
    price: 4972000,
    currency: 'IDR',
  },
  // AI BOM-JED (AI 931)
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-08-08T18:00:00+05:30',
    arrivalTime: '2026-08-08T21:10:00+03:00',
    price: 6031000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-08-22T18:00:00+05:30',
    arrivalTime: '2026-08-22T21:10:00+03:00',
    price: 6194000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-09-08T18:00:00+05:30',
    arrivalTime: '2026-09-08T21:10:00+03:00',
    price: 5705000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-09-22T18:00:00+05:30',
    arrivalTime: '2026-09-22T21:10:00+03:00',
    price: 5868000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-10-08T18:00:00+05:30',
    arrivalTime: '2026-10-08T21:10:00+03:00',
    price: 6276000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTime: '2026-10-22T18:00:00+05:30',
    arrivalTime: '2026-10-22T21:10:00+03:00',
    price: 6520000,
    currency: 'IDR',
  },
  // WY CGK-MCT (WY 815)
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-08-08T22:30:00+07:00',
    arrivalTime: '2026-08-09T04:30:00+04:00',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-08-22T22:30:00+07:00',
    arrivalTime: '2026-08-23T04:30:00+04:00',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-09-08T22:30:00+07:00',
    arrivalTime: '2026-09-09T04:30:00+04:00',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-09-22T22:30:00+07:00',
    arrivalTime: '2026-09-23T04:30:00+04:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-10-08T22:30:00+07:00',
    arrivalTime: '2026-10-09T04:30:00+04:00',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTime: '2026-10-22T22:30:00+07:00',
    arrivalTime: '2026-10-23T04:30:00+04:00',
    price: 10269000,
    currency: 'IDR',
  },
  // WY MCT-JED (WY 275)
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-08-08T08:00:00+04:00',
    arrivalTime: '2026-08-08T09:10:00+03:00',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-08-22T08:00:00+04:00',
    arrivalTime: '2026-08-22T09:10:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-09-08T08:00:00+04:00',
    arrivalTime: '2026-09-08T09:10:00+03:00',
    price: 3749000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-09-22T08:00:00+04:00',
    arrivalTime: '2026-09-22T09:10:00+03:00',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-10-08T08:00:00+04:00',
    arrivalTime: '2026-10-08T09:10:00+03:00',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTime: '2026-10-22T08:00:00+04:00',
    arrivalTime: '2026-10-22T09:10:00+03:00',
    price: 4320000,
    currency: 'IDR',
  },
  // WY MCT-MED (WY 277)
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-08-08T08:15:00+04:00',
    arrivalTime: '2026-08-08T09:35:00+03:00',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-08-22T08:15:00+04:00',
    arrivalTime: '2026-08-22T09:35:00+03:00',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-09-08T08:15:00+04:00',
    arrivalTime: '2026-09-08T09:35:00+03:00',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-09-22T08:15:00+04:00',
    arrivalTime: '2026-09-22T09:35:00+03:00',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-10-08T08:15:00+04:00',
    arrivalTime: '2026-10-08T09:35:00+03:00',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTime: '2026-10-22T08:15:00+04:00',
    arrivalTime: '2026-10-22T09:35:00+03:00',
    price: 4483000,
    currency: 'IDR',
  },
  // MS CGK-CAI (MS 977)
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-08-05T09:00:00+07:00',
    arrivalTime: '2026-08-05T15:55:00+03:00',
    price: 8884000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-08-21T09:00:00+07:00',
    arrivalTime: '2026-08-21T15:55:00+03:00',
    price: 9128000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-09-09T09:00:00+07:00',
    arrivalTime: '2026-09-09T15:55:00+03:00',
    price: 8395000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-09-25T09:00:00+07:00',
    arrivalTime: '2026-09-25T15:55:00+03:00',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-10-07T09:00:00+07:00',
    arrivalTime: '2026-10-07T15:55:00+03:00',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTime: '2026-10-23T09:00:00+07:00',
    arrivalTime: '2026-10-23T15:55:00+03:00',
    price: 9617000,
    currency: 'IDR',
  },
  // MS CAI-JED (MS 653)
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-08-05T19:00:00+03:00',
    arrivalTime: '2026-08-05T20:40:00+03:00',
    price: 3342000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-08-21T19:00:00+03:00',
    arrivalTime: '2026-08-21T20:40:00+03:00',
    price: 3423000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-09-09T19:00:00+03:00',
    arrivalTime: '2026-09-09T20:40:00+03:00',
    price: 3179000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-09-25T19:00:00+03:00',
    arrivalTime: '2026-09-25T20:40:00+03:00',
    price: 3260000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-10-07T19:00:00+03:00',
    arrivalTime: '2026-10-07T20:40:00+03:00',
    price: 3505000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTime: '2026-10-23T19:00:00+03:00',
    arrivalTime: '2026-10-23T20:40:00+03:00',
    price: 3586000,
    currency: 'IDR',
  },
  // HU CGK-HAK (HU 7999)
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-08-06T19:30:00+07:00',
    arrivalTime: '2026-08-07T00:50:00+08:00',
    price: 4727000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-08-20T19:30:00+07:00',
    arrivalTime: '2026-08-21T00:50:00+08:00',
    price: 4890000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-09-10T19:30:00+07:00',
    arrivalTime: '2026-09-11T00:50:00+08:00',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-09-24T19:30:00+07:00',
    arrivalTime: '2026-09-25T00:50:00+08:00',
    price: 4646000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-10-08T19:30:00+07:00',
    arrivalTime: '2026-10-09T00:50:00+08:00',
    price: 4972000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTime: '2026-10-22T19:30:00+07:00',
    arrivalTime: '2026-10-23T00:50:00+08:00',
    price: 5135000,
    currency: 'IDR',
  },
  // HU HAK-JED (HU 7989)
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-08-12T03:40:00+08:00',
    arrivalTime: '2026-08-12T08:53:00+03:00',
    price: 7906000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-08-26T03:40:00+08:00',
    arrivalTime: '2026-08-26T08:53:00+03:00',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-09-09T03:40:00+08:00',
    arrivalTime: '2026-09-09T08:53:00+03:00',
    price: 7498000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-09-23T03:40:00+08:00',
    arrivalTime: '2026-09-23T08:53:00+03:00',
    price: 7743000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-10-07T03:40:00+08:00',
    arrivalTime: '2026-10-07T08:53:00+03:00',
    price: 8313000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTime: '2026-10-21T03:40:00+08:00',
    arrivalTime: '2026-10-21T08:53:00+03:00',
    price: 8558000,
    currency: 'IDR',
  },
  // --- CGK<->JED/MED additions from prd/airline_list.md (2026-07-18): the 6
  // airlines from that comparison not already covered above. Priced in IDR
  // (the source's native currency) rather than USD like the rest of this
  // block — flights.currency is per-row, so this is fine. Same 9-date
  // cadence and mild price variation as the existing carriers above. ---
  // JT CGK-JED (JT 072)
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T09:00:00+07:00',
    arrivalTime: '2026-08-05T15:00:00+03:00',
    price: 14650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T09:00:00+07:00',
    arrivalTime: '2026-08-15T15:00:00+03:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T09:00:00+07:00',
    arrivalTime: '2026-08-25T15:00:00+03:00',
    price: 14950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T09:00:00+07:00',
    arrivalTime: '2026-09-05T15:00:00+03:00',
    price: 15550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T09:00:00+07:00',
    arrivalTime: '2026-09-15T15:00:00+03:00',
    price: 14350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T09:00:00+07:00',
    arrivalTime: '2026-09-25T15:00:00+03:00',
    price: 16000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T09:00:00+07:00',
    arrivalTime: '2026-10-05T15:00:00+03:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T09:00:00+07:00',
    arrivalTime: '2026-10-15T15:00:00+03:00',
    price: 15700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T09:00:00+07:00',
    arrivalTime: '2026-10-25T15:00:00+03:00',
    price: 16450000,
    currency: 'IDR',
  },
  // JT CGK-MED (JT 074)
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T09:30:00+07:00',
    arrivalTime: '2026-08-05T15:30:00+03:00',
    price: 14650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T09:30:00+07:00',
    arrivalTime: '2026-08-15T15:30:00+03:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T09:30:00+07:00',
    arrivalTime: '2026-08-25T15:30:00+03:00',
    price: 14950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T09:30:00+07:00',
    arrivalTime: '2026-09-05T15:30:00+03:00',
    price: 15550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T09:30:00+07:00',
    arrivalTime: '2026-09-15T15:30:00+03:00',
    price: 14350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T09:30:00+07:00',
    arrivalTime: '2026-09-25T15:30:00+03:00',
    price: 16000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T09:30:00+07:00',
    arrivalTime: '2026-10-05T15:30:00+03:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T09:30:00+07:00',
    arrivalTime: '2026-10-15T15:30:00+03:00',
    price: 15700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T09:30:00+07:00',
    arrivalTime: '2026-10-25T15:30:00+03:00',
    price: 16450000,
    currency: 'IDR',
  },
  // ID CGK-JED (ID 782)
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T10:00:00+07:00',
    arrivalTime: '2026-08-05T16:15:00+03:00',
    price: 15100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T10:00:00+07:00',
    arrivalTime: '2026-08-15T16:15:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T10:00:00+07:00',
    arrivalTime: '2026-08-25T16:15:00+03:00',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T10:00:00+07:00',
    arrivalTime: '2026-09-05T16:15:00+03:00',
    price: 16050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T10:00:00+07:00',
    arrivalTime: '2026-09-15T16:15:00+03:00',
    price: 14800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T10:00:00+07:00',
    arrivalTime: '2026-09-25T16:15:00+03:00',
    price: 16550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T10:00:00+07:00',
    arrivalTime: '2026-10-05T16:15:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T10:00:00+07:00',
    arrivalTime: '2026-10-15T16:15:00+03:00',
    price: 16200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T10:00:00+07:00',
    arrivalTime: '2026-10-25T16:15:00+03:00',
    price: 17000000,
    currency: 'IDR',
  },
  // ID CGK-MED (ID 784)
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T10:30:00+07:00',
    arrivalTime: '2026-08-05T16:45:00+03:00',
    price: 15100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T10:30:00+07:00',
    arrivalTime: '2026-08-15T16:45:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T10:30:00+07:00',
    arrivalTime: '2026-08-25T16:45:00+03:00',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T10:30:00+07:00',
    arrivalTime: '2026-09-05T16:45:00+03:00',
    price: 16050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T10:30:00+07:00',
    arrivalTime: '2026-09-15T16:45:00+03:00',
    price: 14800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T10:30:00+07:00',
    arrivalTime: '2026-09-25T16:45:00+03:00',
    price: 16550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T10:30:00+07:00',
    arrivalTime: '2026-10-05T16:45:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T10:30:00+07:00',
    arrivalTime: '2026-10-15T16:45:00+03:00',
    price: 16200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T10:30:00+07:00',
    arrivalTime: '2026-10-25T16:45:00+03:00',
    price: 17000000,
    currency: 'IDR',
  },
  // QG CGK-JED (QG 990) — direct per source; occasional technical fuel stop not modeled as a leg
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T08:30:00+07:00',
    arrivalTime: '2026-08-05T15:00:00+03:00',
    price: 14400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T08:30:00+07:00',
    arrivalTime: '2026-08-15T15:00:00+03:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T08:30:00+07:00',
    arrivalTime: '2026-08-25T15:00:00+03:00',
    price: 14700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T08:30:00+07:00',
    arrivalTime: '2026-09-05T15:00:00+03:00',
    price: 15300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T08:30:00+07:00',
    arrivalTime: '2026-09-15T15:00:00+03:00',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T08:30:00+07:00',
    arrivalTime: '2026-09-25T15:00:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T08:30:00+07:00',
    arrivalTime: '2026-10-05T15:00:00+03:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T08:30:00+07:00',
    arrivalTime: '2026-10-15T15:00:00+03:00',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T08:30:00+07:00',
    arrivalTime: '2026-10-25T15:00:00+03:00',
    price: 16200000,
    currency: 'IDR',
  },
  // QG CGK-MED (QG 992)
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T09:00:00+07:00',
    arrivalTime: '2026-08-05T15:30:00+03:00',
    price: 14400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T09:00:00+07:00',
    arrivalTime: '2026-08-15T15:30:00+03:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T09:00:00+07:00',
    arrivalTime: '2026-08-25T15:30:00+03:00',
    price: 14700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T09:00:00+07:00',
    arrivalTime: '2026-09-05T15:30:00+03:00',
    price: 15300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T09:00:00+07:00',
    arrivalTime: '2026-09-15T15:30:00+03:00',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T09:00:00+07:00',
    arrivalTime: '2026-09-25T15:30:00+03:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T09:00:00+07:00',
    arrivalTime: '2026-10-05T15:30:00+03:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T09:00:00+07:00',
    arrivalTime: '2026-10-15T15:30:00+03:00',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T09:00:00+07:00',
    arrivalTime: '2026-10-25T15:30:00+03:00',
    price: 16200000,
    currency: 'IDR',
  },
  // XY CGK-JED (XY 361)
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-05T01:30:00+07:00',
    arrivalTime: '2026-08-05T07:15:00+03:00',
    price: 14150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-15T01:30:00+07:00',
    arrivalTime: '2026-08-15T07:15:00+03:00',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-08-25T01:30:00+07:00',
    arrivalTime: '2026-08-25T07:15:00+03:00',
    price: 14450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-05T01:30:00+07:00',
    arrivalTime: '2026-09-05T07:15:00+03:00',
    price: 15050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-15T01:30:00+07:00',
    arrivalTime: '2026-09-15T07:15:00+03:00',
    price: 13850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-09-25T01:30:00+07:00',
    arrivalTime: '2026-09-25T07:15:00+03:00',
    price: 15500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-05T01:30:00+07:00',
    arrivalTime: '2026-10-05T07:15:00+03:00',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-15T01:30:00+07:00',
    arrivalTime: '2026-10-15T07:15:00+03:00',
    price: 15200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTime: '2026-10-25T01:30:00+07:00',
    arrivalTime: '2026-10-25T07:15:00+03:00',
    price: 15950000,
    currency: 'IDR',
  },
  // XY CGK-MED (XY 363)
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-05T02:00:00+07:00',
    arrivalTime: '2026-08-05T07:45:00+03:00',
    price: 14150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-15T02:00:00+07:00',
    arrivalTime: '2026-08-15T07:45:00+03:00',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-08-25T02:00:00+07:00',
    arrivalTime: '2026-08-25T07:45:00+03:00',
    price: 14450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-05T02:00:00+07:00',
    arrivalTime: '2026-09-05T07:45:00+03:00',
    price: 15050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-15T02:00:00+07:00',
    arrivalTime: '2026-09-15T07:45:00+03:00',
    price: 13850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-09-25T02:00:00+07:00',
    arrivalTime: '2026-09-25T07:45:00+03:00',
    price: 15500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-05T02:00:00+07:00',
    arrivalTime: '2026-10-05T07:45:00+03:00',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-15T02:00:00+07:00',
    arrivalTime: '2026-10-15T07:45:00+03:00',
    price: 15200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTime: '2026-10-25T02:00:00+07:00',
    arrivalTime: '2026-10-25T07:45:00+03:00',
    price: 15950000,
    currency: 'IDR',
  },
  // D7 CGK-KUL (D7 812)
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-08-05T07:30:00+07:00',
    arrivalTime: '2026-08-05T10:45:00+08:00',
    price: 4200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-08-15T07:30:00+07:00',
    arrivalTime: '2026-08-15T10:45:00+08:00',
    price: 4350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-08-25T07:30:00+07:00',
    arrivalTime: '2026-08-25T10:45:00+08:00',
    price: 4250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-09-05T07:30:00+07:00',
    arrivalTime: '2026-09-05T10:45:00+08:00',
    price: 4450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-09-15T07:30:00+07:00',
    arrivalTime: '2026-09-15T10:45:00+08:00',
    price: 4100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-09-25T07:30:00+07:00',
    arrivalTime: '2026-09-25T10:45:00+08:00',
    price: 4550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-10-05T07:30:00+07:00',
    arrivalTime: '2026-10-05T10:45:00+08:00',
    price: 4350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-10-15T07:30:00+07:00',
    arrivalTime: '2026-10-15T10:45:00+08:00',
    price: 4500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTime: '2026-10-25T07:30:00+07:00',
    arrivalTime: '2026-10-25T10:45:00+08:00',
    price: 4700000,
    currency: 'IDR',
  },
  // D7 KUL-JED (D7 8118), ~3h layover at KUL (MCT 60m)
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-08-05T13:45:00+08:00',
    arrivalTime: '2026-08-05T19:10:00+03:00',
    price: 9500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-08-15T13:45:00+08:00',
    arrivalTime: '2026-08-15T19:10:00+03:00',
    price: 9900000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-08-25T13:45:00+08:00',
    arrivalTime: '2026-08-25T19:10:00+03:00',
    price: 9700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-09-05T13:45:00+08:00',
    arrivalTime: '2026-09-05T19:10:00+03:00',
    price: 10100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-09-15T13:45:00+08:00',
    arrivalTime: '2026-09-15T19:10:00+03:00',
    price: 9300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-09-25T13:45:00+08:00',
    arrivalTime: '2026-09-25T19:10:00+03:00',
    price: 10400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-10-05T13:45:00+08:00',
    arrivalTime: '2026-10-05T19:10:00+03:00',
    price: 9900000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-10-15T13:45:00+08:00',
    arrivalTime: '2026-10-15T19:10:00+03:00',
    price: 10200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTime: '2026-10-25T13:45:00+08:00',
    arrivalTime: '2026-10-25T19:10:00+03:00',
    price: 10700000,
    currency: 'IDR',
  },
  // TK CGK-IST (TK 62), overnight — arrives next calendar day at IST
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-08-05T22:00:00+07:00',
    arrivalTime: '2026-08-06T06:30:00+03:00',
    price: 10100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-08-15T22:00:00+07:00',
    arrivalTime: '2026-08-16T06:30:00+03:00',
    price: 10500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-08-25T22:00:00+07:00',
    arrivalTime: '2026-08-26T06:30:00+03:00',
    price: 10300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-09-05T22:00:00+07:00',
    arrivalTime: '2026-09-06T06:30:00+03:00',
    price: 10700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-09-15T22:00:00+07:00',
    arrivalTime: '2026-09-16T06:30:00+03:00',
    price: 9850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-09-25T22:00:00+07:00',
    arrivalTime: '2026-09-26T06:30:00+03:00',
    price: 11050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-10-05T22:00:00+07:00',
    arrivalTime: '2026-10-06T06:30:00+03:00',
    price: 10500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-10-15T22:00:00+07:00',
    arrivalTime: '2026-10-16T06:30:00+03:00',
    price: 10800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTime: '2026-10-25T22:00:00+07:00',
    arrivalTime: '2026-10-26T06:30:00+03:00',
    price: 11350000,
    currency: 'IDR',
  },
  // TK IST-JED (TK 754), ~3h30m layover at IST (MCT 60m); dated the day after CGK-IST departs
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-08-06T10:00:00+03:00',
    arrivalTime: '2026-08-06T14:20:00+03:00',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-08-16T10:00:00+03:00',
    arrivalTime: '2026-08-16T14:20:00+03:00',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-08-26T10:00:00+03:00',
    arrivalTime: '2026-08-26T14:20:00+03:00',
    price: 8350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-09-06T10:00:00+03:00',
    arrivalTime: '2026-09-06T14:20:00+03:00',
    price: 8650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-09-16T10:00:00+03:00',
    arrivalTime: '2026-09-16T14:20:00+03:00',
    price: 8000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-09-26T10:00:00+03:00',
    arrivalTime: '2026-09-26T14:20:00+03:00',
    price: 8950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-10-06T10:00:00+03:00',
    arrivalTime: '2026-10-06T14:20:00+03:00',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-10-16T10:00:00+03:00',
    arrivalTime: '2026-10-16T14:20:00+03:00',
    price: 8750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTime: '2026-10-26T10:00:00+03:00',
    arrivalTime: '2026-10-26T14:20:00+03:00',
    price: 9200000,
    currency: 'IDR',
  },
  // TK IST-MED (TK 758), same connection window as TK 754 above but to Madinah
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-08-06T10:30:00+03:00',
    arrivalTime: '2026-08-06T14:50:00+03:00',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-08-16T10:30:00+03:00',
    arrivalTime: '2026-08-16T14:50:00+03:00',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-08-26T10:30:00+03:00',
    arrivalTime: '2026-08-26T14:50:00+03:00',
    price: 8350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-09-06T10:30:00+03:00',
    arrivalTime: '2026-09-06T14:50:00+03:00',
    price: 8650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-09-16T10:30:00+03:00',
    arrivalTime: '2026-09-16T14:50:00+03:00',
    price: 8000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-09-26T10:30:00+03:00',
    arrivalTime: '2026-09-26T14:50:00+03:00',
    price: 8950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-10-06T10:30:00+03:00',
    arrivalTime: '2026-10-06T14:50:00+03:00',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-10-16T10:30:00+03:00',
    arrivalTime: '2026-10-16T14:50:00+03:00',
    price: 8750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTime: '2026-10-26T10:30:00+03:00',
    arrivalTime: '2026-10-26T14:50:00+03:00',
    price: 9200000,
    currency: 'IDR',
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

// Minimum viable rule set from prd/flights/13-mct-rules.md, plus the S11 pair (the
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
    // maxConnectionMinutes=1440, NOT the 2880 ("max 48h") suggested by
    // 13-mct-rules.md's seed table / 15-seed-data.md: S3's 2730-min gap
    // must classify as 'stopover', which only holds if max=1440. The
    // scenario doc is the acceptance oracle; it wins over the seed-table note.
    arrivalAirport: 'DOH',
    departureAirport: 'DOH',
    scope: 'II',
    mctMinutes: 60,
    maxConnectionMinutes: 1440,
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
  // S12 — junction 2 of the 3-flight chain: arrives HND (domestic leg from
  // NRT), departs NRT (international leg to LHR).
  {
    arrivalAirport: 'HND',
    departureAirport: 'NRT',
    scope: 'DI',
    mctMinutes: 240,
  },
  // --- CGK<->JED/MED hub junctions (prd/flights/15-seed-data.md v1.2). SIN/SIN
  // and DOH/DOH above already cover those hubs. ---
  {
    arrivalAirport: 'KUL',
    departureAirport: 'KUL',
    scope: 'II',
    mctMinutes: 60,
  },
  {
    arrivalAirport: 'DXB',
    departureAirport: 'DXB',
    scope: 'II',
    mctMinutes: 60,
  },
  {
    arrivalAirport: 'AUH',
    departureAirport: 'AUH',
    scope: 'II',
    mctMinutes: 60,
  },
  // Secondary/thinner hubs get a longer default MCT than the majors above.
  {
    arrivalAirport: 'CAI',
    departureAirport: 'CAI',
    scope: 'II',
    mctMinutes: 90,
  },
  {
    arrivalAirport: 'BOM',
    departureAirport: 'BOM',
    scope: 'II',
    mctMinutes: 90,
  },
  // Newest, thinnest route in the set (HAK-JED launched Jun 2025) — most
  // conservative MCT.
  {
    arrivalAirport: 'HAK',
    departureAirport: 'HAK',
    scope: 'II',
    mctMinutes: 120,
  },
  {
    arrivalAirport: 'MCT',
    departureAirport: 'MCT',
    scope: 'II',
    mctMinutes: 60,
  },
  // Domestic-connector junction: international arrival into JED, connecting to
  // the SV JED->MED domestic hop (JED/MED share country_code=SA -> scope ID).
  {
    arrivalAirport: 'JED',
    departureAirport: 'JED',
    scope: 'ID',
    mctMinutes: 90,
  },
  // TK CGK-IST-JED/MED hub junction (prd/airline_list.md addition).
  {
    arrivalAirport: 'IST',
    departureAirport: 'IST',
    scope: 'II',
    mctMinutes: 60,
  },
];

type InterlineAgreementSeed = {
  inboundAirline: string;
  outboundAirline: string;
  bagThroughChecked: boolean;
};

// Deliberately NO GA->AF (powers S15's NO_INTERLINE case) and NO QR->GA
// (powers S17's directionality case — only GA->QR is seeded).
const interlineAgreements: InterlineAgreementSeed[] = [
  { inboundAirline: 'GA', outboundAirline: 'SQ', bagThroughChecked: true },
  { inboundAirline: 'SQ', outboundAirline: 'GA', bagThroughChecked: true },
  { inboundAirline: 'GA', outboundAirline: 'QR', bagThroughChecked: true },
  { inboundAirline: 'NH', outboundAirline: 'KL', bagThroughChecked: false },
  // --- CGK<->JED/MED hub junctions (prd/flights/15-seed-data.md v1.2).
  // Same-operating-carrier junctions (KUL/MH, DXB/EK, AUH/EY, DOH/QR, CAI/MS,
  // MCT/WY) need no row here — online connections bypass this lookup. Reverse
  // rows (e.g. SV->TR) are deliberately omitted: this batch adds no return
  // (JED/MED->CGK) itineraries, so the resolver never needs them. ---
  { inboundAirline: 'SQ', outboundAirline: 'TR', bagThroughChecked: true },
  { inboundAirline: '6E', outboundAirline: 'AI', bagThroughChecked: true },
  // Non-MED-capable hubs' JED-arriving carrier connecting onward to the SV
  // domestic JED-MED hop.
  { inboundAirline: 'TR', outboundAirline: 'SV', bagThroughChecked: false },
  { inboundAirline: 'EK', outboundAirline: 'SV', bagThroughChecked: false },
  { inboundAirline: 'EY', outboundAirline: 'SV', bagThroughChecked: false },
  { inboundAirline: 'MS', outboundAirline: 'SV', bagThroughChecked: false },
  { inboundAirline: 'AI', outboundAirline: 'SV', bagThroughChecked: false },
  { inboundAirline: 'HU', outboundAirline: 'SV', bagThroughChecked: false },
];

// Hotel search domain — see /prd/hotels/15-seed-data.md for the full spec.

const currencies: (typeof schema.currency.$inferInsert)[] = [
  { code: 'USD', minorUnit: 2, symbol: '$', name: 'US Dollar' },
  { code: 'SAR', minorUnit: 2, symbol: '\u{FDFC}', name: 'Saudi Riyal' },
  { code: 'IDR', minorUnit: 0, symbol: 'Rp', name: 'Indonesian Rupiah' },
];

type FxRateSeed = {
  baseCurrency: string;
  quoteCurrency: string;
  /** rate x 1_000_000 (parts per million). */
  ratePpm: number;
};

// Inverse pairs (e.g. IDR->SAR) are resolved by the FX helper at query time,
// never stored — see prd/hotels/13-resolver-and-search.md.
const fxRates: FxRateSeed[] = [
  { baseCurrency: 'SAR', quoteCurrency: 'IDR', ratePpm: 4_350_000_000 },
  { baseCurrency: 'USD', quoteCurrency: 'IDR', ratePpm: 16_300_000_000 },
  { baseCurrency: 'USD', quoteCurrency: 'SAR', ratePpm: 3_750_000 },
];

type RoomTypeSeed = { name: string; maxOccupancy: number };
type SeasonSeed = {
  name: 'standard' | 'peak' | 'ramadan' | 'hajj' | 'promo';
  startDate: string;
  endDate: string;
};
type RateRuleSeed = {
  seasonName: SeasonSeed['name'];
  roomTypeName: string;
  minOccupancy: number;
  maxOccupancy: number;
  /** Integer minor units, per-night. */
  amount: number;
  currency: string;
};

type PropertySeed = {
  code: string;
  type: 'hotel' | 'apartment' | 'house';
  displayName: string;
  destination: string;
  countryCode: string;
  starRating?: number;
  address?: string;
  roomTypes: RoomTypeSeed[];
  seasons: SeasonSeed[];
  rateRules: RateRuleSeed[];
};

// L1/L3 exactly as specified in prd/hotels/15-seed-data.md.
const properties: PropertySeed[] = [
  {
    code: 'JED-WFH',
    type: 'hotel',
    displayName: 'Jeddah Waterfront Hotel',
    destination: 'Jeddah',
    countryCode: 'SA',
    roomTypes: [
      { name: 'Double', maxOccupancy: 2 },
      { name: 'Quad', maxOccupancy: 4 },
    ],
    seasons: [
      { name: 'standard', startDate: '2026-01-01', endDate: '2026-05-01' },
      { name: 'peak', startDate: '2026-05-01', endDate: '2026-07-01' },
    ],
    rateRules: [
      {
        seasonName: 'standard',
        roomTypeName: 'Double',
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: 40_000,
        currency: 'SAR',
      },
      {
        seasonName: 'standard',
        roomTypeName: 'Quad',
        minOccupancy: 3,
        maxOccupancy: 4,
        amount: 70_000,
        currency: 'SAR',
      },
      {
        seasonName: 'peak',
        roomTypeName: 'Double',
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: 60_000,
        currency: 'SAR',
      },
      {
        seasonName: 'peak',
        roomTypeName: 'Quad',
        minOccupancy: 3,
        maxOccupancy: 4,
        amount: 95_000,
        currency: 'SAR',
      },
    ],
  },
  {
    // Exists so a NO_SEASON case (S9) is easy: query dates outside this
    // property's single season window.
    code: 'MAD-CIN',
    type: 'hotel',
    displayName: 'Madinah Central Inn',
    destination: 'Madinah',
    countryCode: 'SA',
    roomTypes: [{ name: 'Double', maxOccupancy: 2 }],
    seasons: [
      { name: 'standard', startDate: '2026-01-01', endDate: '2026-05-01' },
    ],
    rateRules: [
      {
        seasonName: 'standard',
        roomTypeName: 'Double',
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: 35_000,
        currency: 'SAR',
      },
    ],
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const db = createDb(databaseUrl);

  for (const cityRow of cities) {
    await db.insert(schema.city).values(cityRow).onConflictDoUpdate({
      target: schema.city.cityCode,
      set: cityRow,
    });
  }

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
        price: flight.price,
        currency: flight.currency ?? 'USD',
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
          price: flight.price,
          currency: flight.currency ?? 'USD',
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

  for (const agreement of interlineAgreements) {
    await db
      .insert(schema.interlineAgreements)
      .values(agreement)
      .onConflictDoUpdate({
        target: [
          schema.interlineAgreements.inboundAirline,
          schema.interlineAgreements.outboundAirline,
        ],
        set: { bagThroughChecked: agreement.bagThroughChecked },
      });
  }

  for (const currencyRow of currencies) {
    await db.insert(schema.currency).values(currencyRow).onConflictDoUpdate({
      target: schema.currency.code,
      set: currencyRow,
    });
  }

  const fxAsOf = new Date('2026-07-01T00:00:00Z');
  for (const fx of fxRates) {
    await db
      .insert(schema.fxRate)
      .values({
        baseCurrency: fx.baseCurrency,
        quoteCurrency: fx.quoteCurrency,
        ratePpm: fx.ratePpm,
        asOf: fxAsOf,
      })
      .onConflictDoUpdate({
        target: [schema.fxRate.baseCurrency, schema.fxRate.quoteCurrency],
        set: { ratePpm: fx.ratePpm, asOf: fxAsOf },
      });
  }

  for (const item of properties) {
    await db
      .insert(schema.property)
      .values({
        propertyCode: item.code,
        type: item.type,
        displayName: item.displayName,
        destination: item.destination,
        countryCode: item.countryCode,
        starRating: item.starRating ?? null,
        address: item.address ?? null,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.property.propertyCode,
        set: {
          type: item.type,
          displayName: item.displayName,
          destination: item.destination,
          countryCode: item.countryCode,
          starRating: item.starRating ?? null,
          address: item.address ?? null,
        },
      });

    const roomTypeIdByName = new Map<string, string>();
    for (const roomType of item.roomTypes) {
      const [row] = await db
        .insert(schema.roomType)
        .values({
          propertyCode: item.code,
          name: roomType.name,
          maxOccupancy: roomType.maxOccupancy,
        })
        .onConflictDoUpdate({
          target: [schema.roomType.propertyCode, schema.roomType.name],
          set: { maxOccupancy: roomType.maxOccupancy },
        })
        .returning();
      roomTypeIdByName.set(roomType.name, row.id);
    }

    const seasonIdByName = new Map<string, string>();
    for (const season of item.seasons) {
      const [existing] = await db
        .select()
        .from(schema.season)
        .where(
          and(
            eq(schema.season.propertyCode, item.code),
            eq(schema.season.name, season.name),
          ),
        );
      if (existing) {
        await db
          .update(schema.season)
          .set({ startDate: season.startDate, endDate: season.endDate })
          .where(eq(schema.season.id, existing.id));
        seasonIdByName.set(season.name, existing.id);
      } else {
        const [row] = await db
          .insert(schema.season)
          .values({
            propertyCode: item.code,
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
          })
          .returning();
        seasonIdByName.set(season.name, row.id);
      }
    }

    for (const rule of item.rateRules) {
      const seasonId = seasonIdByName.get(rule.seasonName);
      if (!seasonId) {
        throw new Error(
          `Seed error: rate rule for ${item.code} references unknown season "${rule.seasonName}"`,
        );
      }
      const roomTypeId = roomTypeIdByName.get(rule.roomTypeName);
      if (!roomTypeId) {
        throw new Error(
          `Seed error: rate rule for ${item.code} references unknown room type "${rule.roomTypeName}"`,
        );
      }

      const [existing] = await db
        .select()
        .from(schema.rateRule)
        .where(
          and(
            eq(schema.rateRule.propertyCode, item.code),
            eq(schema.rateRule.seasonId, seasonId),
            eq(schema.rateRule.roomTypeId, roomTypeId),
            eq(schema.rateRule.minOccupancy, rule.minOccupancy),
            eq(schema.rateRule.maxOccupancy, rule.maxOccupancy),
          ),
        );

      const values = {
        propertyCode: item.code,
        seasonId,
        roomTypeId,
        minOccupancy: rule.minOccupancy,
        maxOccupancy: rule.maxOccupancy,
        amount: rule.amount,
        currency: rule.currency,
      };

      if (existing) {
        await db
          .update(schema.rateRule)
          .set(values)
          .where(eq(schema.rateRule.id, existing.id));
      } else {
        await db.insert(schema.rateRule).values(values);
      }
    }
  }

  const rateRuleCount = properties.reduce(
    (count, item) => count + item.rateRules.length,
    0,
  );

  // Sample Travel Packages (flight + hotel), pairing real seeded flights
  // with real seeded properties — gives the public listing real content.
  const travelPackageSeeds: Array<{
    title: string;
    description: string;
    operatingAirline: string;
    flightNumber: string;
    departureTime: string;
    propertyCode: string;
    durationNights: number;
    price: number;
    currency: string;
  }> = [
    {
      title: '5-Night Jeddah Getaway',
      description: 'Round-trip flight and a stay at Jeddah Waterfront Hotel.',
      operatingAirline: 'GA',
      flightNumber: '402',
      departureTime: '2026-08-05T11:50:00+07:00',
      propertyCode: 'JED-WFH',
      durationNights: 5,
      price: 1200,
      currency: 'USD',
    },
    {
      title: '7-Night Madinah Retreat',
      description: 'Round-trip flight and a stay at Madinah Central Inn.',
      operatingAirline: 'GA',
      flightNumber: '404',
      departureTime: '2026-08-05T13:30:00+07:00',
      propertyCode: 'MAD-CIN',
      durationNights: 7,
      price: 950,
      currency: 'USD',
    },
    {
      title: '12-Night Grand Jeddah Package',
      description:
        'Extended round-trip flight and a stay at Jeddah Waterfront Hotel.',
      operatingAirline: 'SV',
      flightNumber: '816',
      departureTime: '2026-08-05T09:10:00+07:00',
      propertyCode: 'JED-WFH',
      durationNights: 12,
      price: 1850,
      currency: 'USD',
    },
  ];

  for (const item of travelPackageSeeds) {
    const [anchorFlight] = await db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.operatingAirline, item.operatingAirline),
          eq(schema.flights.flightNumber, item.flightNumber),
          eq(schema.flights.departureTime, new Date(item.departureTime)),
        ),
      );

    if (!anchorFlight) continue;

    const travelPackageValues = {
      title: item.title,
      description: item.description,
      flightId: anchorFlight.id,
      propertyCode: item.propertyCode,
      durationNights: item.durationNights,
      price: item.price,
      currency: item.currency,
      isActive: true,
    };

    const [existingTravelPackage] = await db
      .select({ id: schema.flightHotelPackage.id })
      .from(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.title, travelPackageValues.title));

    if (existingTravelPackage) {
      await db
        .update(schema.flightHotelPackage)
        .set(travelPackageValues)
        .where(eq(schema.flightHotelPackage.id, existingTravelPackage.id));
    } else {
      await db.insert(schema.flightHotelPackage).values(travelPackageValues);
    }
  }

  console.log(
    `Seeded ${airports.length} airports, ${airlines.length} airlines, ${flights.length} flights, ${marketingCount} marketing rows, ${mctRules.length} MCT rules, ${interlineAgreements.length} interline agreements`,
  );
  console.log(
    `Seeded ${currencies.length} currencies, ${fxRates.length} fx rates, ${properties.length} properties, ${rateRuleCount} rate rules`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
