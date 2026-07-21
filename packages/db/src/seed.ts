import { resolve } from 'node:path';
import { config } from 'dotenv';
import { and, eq, inArray, isNull } from 'drizzle-orm';
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
  { cityCode: 'MKK', name: 'Makkah', countryCode: 'SA' },
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
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  departureDayOffset?: number;
  arrivalDayOffset?: number;
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
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  arrivalDayOffset?: number;
  price: number;
  currency?: string;
  legs?: LegSeed[];
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
    departureTimeLocal: '01:00',
    arrivalTimeLocal: '20:00',
    price: 950,
    legs: [
      {
        role: 'TECHNICAL_STOP',
        depAirport: 'CGK',
        arrAirport: 'BKK',
        departureTimeLocal: '01:00',
        arrivalTimeLocal: '04:15',
      },
      {
        role: 'TECHNICAL_STOP',
        depAirport: 'BKK',
        arrAirport: 'LHR',
        departureTimeLocal: '05:30',
        arrivalTimeLocal: '20:00',
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
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '10:45',
    price: 545,
  },
  // S1 — N leg: NH 847 NRT->SIN, dep 12:45 JST -> gap 120min vs S1's P.
  {
    operatingAirline: 'NH',
    flightNumber: '847',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTimeLocal: '12:45',
    arrivalTimeLocal: '18:30',
    price: 385,
  },
  // S2 — N leg: same flight number, different departure -> distinct row.
  // dep 11:15 JST -> gap 30min vs S1/S2's shared P (below MCT).
  {
    operatingAirline: 'NH',
    flightNumber: '847',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTimeLocal: '11:15',
    arrivalTimeLocal: '17:00',
    price: 405,
  },
  // S3 — P: QR 1 CGK->DOH, arr 11:30 +03:00.
  {
    operatingAirline: 'QR',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '06:30',
    arrivalTimeLocal: '11:30',
    price: 620,
  },
  // S3 — N: QR 2 DOH->LHR, dep 09:00 +03:00 two days later (stopover gap).
  {
    operatingAirline: 'QR',
    flightNumber: '2',
    originAirport: 'DOH',
    destAirport: 'LHR',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:00',
    price: 480,
  },
  // S4/S5 — P: intl arrival into NRT 08:00 JST (inter-airport connection source).
  {
    operatingAirline: 'GA',
    flightNumber: '5',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '08:00',
    price: 560,
  },
  // S4 — N: intl departure from HND 13:00 JST -> gap 300min (valid, >=240 MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '6',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTimeLocal: '13:00',
    arrivalTimeLocal: '18:00',
    price: 980,
  },
  // S5 — N: same route, dep 11:00 JST -> gap 180min (invalid, <240 inter-airport MCT).
  {
    operatingAirline: 'GA',
    flightNumber: '7',
    originAirport: 'HND',
    destAirport: 'CDG',
    departureTimeLocal: '11:00',
    arrivalTimeLocal: '16:00',
    price: 960,
  },
  // S6 — open-jaw pair: arrives Rome (ROM), next departs Paris (PAR) -- cities don't line up.
  {
    operatingAirline: 'GA',
    flightNumber: '1',
    originAirport: 'CGK',
    destAirport: 'FCO',
    departureTimeLocal: '21:00',
    arrivalTimeLocal: '06:00',
    price: 890,
  },
  {
    operatingAirline: 'AF',
    flightNumber: '2',
    originAirport: 'CDG',
    destAirport: 'CGK',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '04:00',
    price: 910,
  },
  // S8 — negative-gap guard: N departs before P arrives, same airport (CGK).
  {
    operatingAirline: 'NH',
    flightNumber: '20',
    originAirport: 'SIN',
    destAirport: 'CGK',
    departureTimeLocal: '11:15',
    arrivalTimeLocal: '12:00',
    price: 180,
  },
  {
    operatingAirline: 'NH',
    flightNumber: '21',
    originAirport: 'CGK',
    destAirport: 'DPS',
    departureTimeLocal: '11:00',
    arrivalTimeLocal: '14:00',
    price: 90,
  },
  // S10 — GA 874 CGK->NRT, operating GA, sold under 3 marketing numbers.
  // Querying by NH 5502 or KL 4062 must resolve back to this one flight.
  {
    operatingAirline: 'GA',
    flightNumber: '874',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '17:15',
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
    departureTimeLocal: '11:30',
    arrivalTimeLocal: '14:00',
    price: 140,
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '11',
    originAirport: 'DPS',
    destAirport: 'SIN',
    departureTimeLocal: '16:00',
    arrivalTimeLocal: '19:00',
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
    departureTimeLocal: '05:00',
    arrivalTimeLocal: '13:00',
    price: 555,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '11',
    originAirport: 'NRT',
    destAirport: 'HND',
    departureTimeLocal: '14:45',
    arrivalTimeLocal: '15:30',
    price: 60,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '12',
    originAirport: 'NRT',
    destAirport: 'LHR',
    departureTimeLocal: '20:00',
    arrivalTimeLocal: '01:00',
    price: 920,
  },
  // S13/S14/S15 — shared P: GA 100 CGK->SIN, online/interline/no-interline Ns.
  {
    operatingAirline: 'GA',
    flightNumber: '100',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '05:00',
    arrivalTimeLocal: '10:00',
    price: 160,
  },
  // S13 — N: same carrier GA, online, no interline lookup needed.
  {
    operatingAirline: 'GA',
    flightNumber: '200',
    originAirport: 'SIN',
    destAirport: 'NRT',
    departureTimeLocal: '11:30',
    arrivalTimeLocal: '19:30',
    price: 420,
  },
  // S14 — N: operating SQ, GA->SQ agreement permits it, bags through.
  {
    operatingAirline: 'SQ',
    flightNumber: '300',
    originAirport: 'SIN',
    destAirport: 'NRT',
    departureTimeLocal: '11:30',
    arrivalTimeLocal: '19:30',
    price: 410,
  },
  // S15 — N: operating AF, no GA->AF agreement -> NO_INTERLINE.
  {
    operatingAirline: 'AF',
    flightNumber: '400',
    originAirport: 'SIN',
    destAirport: 'CDG',
    departureTimeLocal: '13:00',
    arrivalTimeLocal: '20:00',
    price: 780,
  },
  // S16 — interline permitted but bags NOT through-checked (NH->KL agreement).
  {
    operatingAirline: 'NH',
    flightNumber: '30',
    originAirport: 'CGK',
    destAirport: 'NRT',
    departureTimeLocal: '01:00',
    arrivalTimeLocal: '09:00',
    price: 565,
  },
  {
    operatingAirline: 'KL',
    flightNumber: '800',
    originAirport: 'NRT',
    destAirport: 'AMS',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '15:30',
    price: 890,
  },
  // S17 — directional agreement is one-way: GA->QR exists, QR->GA does not.
  {
    operatingAirline: 'QR',
    flightNumber: '50',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '05:00',
    arrivalTimeLocal: '10:00',
    price: 630,
  },
  {
    operatingAirline: 'GA',
    flightNumber: '51',
    originAirport: 'DOH',
    destAirport: 'CGK',
    departureTimeLocal: '11:30',
    arrivalTimeLocal: '00:30',
    price: 640,
  },
  // S18 — N for GA 874 (S10): interline gate must key off GA (operating),
  // never NH 5502 (marketing). No NH->SQ agreement exists — only GA->SQ.
  {
    operatingAirline: 'SQ',
    flightNumber: '500',
    originAirport: 'NRT',
    destAirport: 'SIN',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '01:00',
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
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 13122000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 13529000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 13937000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 12470000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 12877000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 13203000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 13774000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 14181000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '402',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:50',
    arrivalTimeLocal: '17:40',
    price: 14670000,
    currency: 'IDR',
  },
  // GA CGK-MED (GA 404)
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 13448000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 13855000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 14263000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 12796000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 13203000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 13529000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 14589000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'GA',
    flightNumber: '404',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '13:30',
    arrivalTimeLocal: '19:45',
    price: 14996000,
    currency: 'IDR',
  },
  // SV CGK-JED (SV 816)
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 12633000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 13040000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 13448000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 11981000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 12388000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 12796000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 13285000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 13692000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '816',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '15:15',
    price: 14100000,
    currency: 'IDR',
  },
  // SV CGK-MED (SV 818)
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 12959000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 13366000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 13774000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 12307000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 12714000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 13040000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 13611000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 14018000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '818',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '23:40',
    price: 14426000,
    currency: 'IDR',
  },
  // SV JED-MED (AM) (SV 1420)
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1420',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '15:20',
    price: 1467000,
    currency: 'IDR',
  },
  // SV JED-MED (PM) (SV 1422)
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1304000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1386000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1467000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SV',
    flightNumber: '1422',
    originAirport: 'JED',
    destAirport: 'MED',
    departureTimeLocal: '23:00',
    arrivalTimeLocal: '00:05',
    price: 1467000,
    currency: 'IDR',
  },
  // SQ CGK-SIN (SQ 936)
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2608000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2690000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2445000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2527000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2771000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '936',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '07:00',
    arrivalTimeLocal: '09:45',
    price: 2853000,
    currency: 'IDR',
  },
  // TR SIN-JED (TR 2118)
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 8232000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 8476000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 7824000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 8069000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TR',
    flightNumber: '2118',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '12:30',
    arrivalTimeLocal: '17:20',
    price: 8884000,
    currency: 'IDR',
  },
  // MH CGK-KUL (MH 725)
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 2934000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 3016000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 2771000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 2853000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 3097000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '725',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '11:15',
    price: 3179000,
    currency: 'IDR',
  },
  // MH KUL-JED (MH 152)
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '152',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:00',
    arrivalTimeLocal: '19:30',
    price: 10269000,
    currency: 'IDR',
  },
  // MH KUL-MED (MH 158)
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 10106000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 9617000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 10269000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MH',
    flightNumber: '158',
    originAirport: 'KUL',
    destAirport: 'MED',
    departureTimeLocal: '14:15',
    arrivalTimeLocal: '19:50',
    price: 10595000,
    currency: 'IDR',
  },
  // EK CGK-DXB (EK 359)
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 8884000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 9128000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 8395000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '359',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '12:45',
    price: 9617000,
    currency: 'IDR',
  },
  // EK DXB-JED (EK 815)
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 3749000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EK',
    flightNumber: '815',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '15:30',
    arrivalTimeLocal: '17:20',
    price: 4320000,
    currency: 'IDR',
  },
  // EY CGK-AUH (EY 475)
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 9210000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 8721000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 8965000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 9617000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:40',
    price: 9943000,
    currency: 'IDR',
  },
  // EY AUH-JED (EY 233)
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'EY',
    flightNumber: '233',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '17:30',
    arrivalTimeLocal: '19:30',
    price: 4483000,
    currency: 'IDR',
  },
  // QR CGK-DOH (QR 956)
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '956',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:30',
    price: 10269000,
    currency: 'IDR',
  },
  // QR DOH-JED (QR 1105)
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1105',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '17:00',
    arrivalTimeLocal: '19:30',
    price: 4483000,
    currency: 'IDR',
  },
  // QR DOH-MED (QR 1107)
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4401000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1107',
    originAirport: 'DOH',
    destAirport: 'MED',
    departureTimeLocal: '17:15',
    arrivalTimeLocal: '19:50',
    price: 4646000,
    currency: 'IDR',
  },
  // 6E CGK-BOM (6E 1975)
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4564000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4727000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4809000,
    currency: 'IDR',
  },
  {
    operatingAirline: '6E',
    flightNumber: '1975',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '15:00',
    price: 4972000,
    currency: 'IDR',
  },
  // AI BOM-JED (AI 931)
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 6031000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 6194000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 5705000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 5868000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 6276000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'AI',
    flightNumber: '931',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '18:00',
    arrivalTimeLocal: '21:10',
    price: 6520000,
    currency: 'IDR',
  },
  // WY CGK-MCT (WY 815)
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 9454000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 9780000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 9047000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 9943000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '815',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '22:30',
    arrivalTimeLocal: '04:30',
    price: 10269000,
    currency: 'IDR',
  },
  // WY MCT-JED (WY 275)
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 3749000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 4157000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '275',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '08:00',
    arrivalTimeLocal: '09:10',
    price: 4320000,
    currency: 'IDR',
  },
  // WY MCT-MED (WY 277)
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 4075000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 4238000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 3912000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 3994000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 4320000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'WY',
    flightNumber: '277',
    originAirport: 'MCT',
    destAirport: 'MED',
    departureTimeLocal: '08:15',
    arrivalTimeLocal: '09:35',
    price: 4483000,
    currency: 'IDR',
  },
  // MS CGK-CAI (MS 977)
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 8884000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 9128000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 8395000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 8639000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 9291000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '977',
    originAirport: 'CGK',
    destAirport: 'CAI',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:55',
    price: 9617000,
    currency: 'IDR',
  },
  // MS CAI-JED (MS 653)
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3342000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3423000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3179000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3260000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3505000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'MS',
    flightNumber: '653',
    originAirport: 'CAI',
    destAirport: 'JED',
    departureTimeLocal: '19:00',
    arrivalTimeLocal: '20:40',
    price: 3586000,
    currency: 'IDR',
  },
  // HU CGK-HAK (HU 7999)
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 4727000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 4890000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 4483000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 4646000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 4972000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7999',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:30',
    arrivalTimeLocal: '00:50',
    price: 5135000,
    currency: 'IDR',
  },
  // HU HAK-JED (HU 7989)
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
    price: 7906000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
    price: 7498000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
    price: 7743000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
    price: 8313000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7989',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '03:40',
    arrivalTimeLocal: '08:53',
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
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 14650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 14950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 15550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 14350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 16000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 15700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '072',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:00',
    price: 16450000,
    currency: 'IDR',
  },
  // JT CGK-MED (JT 074)
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 14650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 14950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 15550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 14350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 16000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 15250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 15700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'JT',
    flightNumber: '074',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:30',
    arrivalTimeLocal: '15:30',
    price: 16450000,
    currency: 'IDR',
  },
  // ID CGK-JED (ID 782)
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 15100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 16050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 14800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 16550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 16200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '782',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '16:15',
    price: 17000000,
    currency: 'IDR',
  },
  // ID CGK-MED (ID 784)
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 15100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 16050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 14800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 16550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 16200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'ID',
    flightNumber: '784',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '16:45',
    price: 17000000,
    currency: 'IDR',
  },
  // QG CGK-JED (QG 990) — direct per source; occasional technical fuel stop not modeled as a leg
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 14400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 14700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 15300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '08:30',
    arrivalTimeLocal: '15:00',
    price: 16200000,
    currency: 'IDR',
  },
  // QG CGK-MED (QG 992)
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 14400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 14700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 15300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 14100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 15750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 15000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 15450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'QG',
    flightNumber: '992',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '15:30',
    price: 16200000,
    currency: 'IDR',
  },
  // XY CGK-JED (XY 361)
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 14150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 14450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 15050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 13850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 15500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 15200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '361',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '01:30',
    arrivalTimeLocal: '07:15',
    price: 15950000,
    currency: 'IDR',
  },
  // XY CGK-MED (XY 363)
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 14150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 14450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 15050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 13850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 15500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 14750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 15200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'XY',
    flightNumber: '363',
    originAirport: 'CGK',
    destAirport: 'MED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '07:45',
    price: 15950000,
    currency: 'IDR',
  },
  // D7 CGK-KUL (D7 812)
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4250000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4450000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4550000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '812',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '07:30',
    arrivalTimeLocal: '10:45',
    price: 4700000,
    currency: 'IDR',
  },
  // D7 KUL-JED (D7 8118), ~3h layover at KUL (MCT 60m)
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 9500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 9900000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 9700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 10100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 9300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 10400000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 9900000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 10200000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'D7',
    flightNumber: '8118',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '13:45',
    arrivalTimeLocal: '19:10',
    price: 10700000,
    currency: 'IDR',
  },
  // TK CGK-IST (TK 62), overnight — arrives next calendar day at IST
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10100000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10300000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10700000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 9850000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 11050000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 10800000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '62',
    originAirport: 'CGK',
    destAirport: 'IST',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '06:30',
    price: 11350000,
    currency: 'IDR',
  },
  // TK IST-JED (TK 754), ~3h30m layover at IST (MCT 60m); dated the day after CGK-IST departs
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 8750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '754',
    originAirport: 'IST',
    destAirport: 'JED',
    departureTimeLocal: '10:00',
    arrivalTimeLocal: '14:20',
    price: 9200000,
    currency: 'IDR',
  },
  // TK IST-MED (TK 758), same connection window as TK 754 above but to Madinah
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8150000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8350000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8650000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8000000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8950000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8500000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
    price: 8750000,
    currency: 'IDR',
  },
  {
    operatingAirline: 'TK',
    flightNumber: '758',
    originAirport: 'IST',
    destAirport: 'MED',
    departureTimeLocal: '10:30',
    arrivalTimeLocal: '14:50',
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
  name: string;
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
  distanceMeters?: number;
  distanceNote?: string;
  contactPhone?: string;
  contactEmail?: string;
  roomTypes: RoomTypeSeed[];
  seasons: SeasonSeed[];
  rateRules: RateRuleSeed[];
};

// L1/L3 exactly as specified in prd/hotels/15-seed-data.md.
const properties: PropertySeed[] = [
  {
    code: '01KY01F10WQ349VA0TF2GZK322',
    type: 'hotel',
    displayName: 'Jeddah Waterfront Hotel',
    destination: 'Jeddah',
    countryCode: 'SA',
    roomTypes: [
      { name: 'Double', maxOccupancy: 2 },
      { name: 'Quad', maxOccupancy: 4 },
    ],
    // Peak runs through 2027-01-01 (not just 2026-07-01) so it covers the
    // full CGK<->JED/MED demo flight date range (2026-05-31 through
    // 2026-10-26) — otherwise a flight search in e.g. August finds this
    // property has NO_SEASON and package creation has no hotel to pair.
    seasons: [
      { name: 'standard', startDate: '2026-01-01', endDate: '2026-05-01' },
      { name: 'peak', startDate: '2026-05-01', endDate: '2027-01-01' },
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
    // Season runs through 2027-01-01 (not just 2026-05-01) so it covers the
    // full CGK<->JED/MED demo flight date range — see JED-WFH's comment
    // above. S9's NO_SEASON golden scenario now uses a 2027-02 date
    // (genuinely outside every seeded Madinah property's window) instead of
    // relying on this property having a narrow season.
    code: '01KY01F0Z9W0P97VMJKY3PH099',
    type: 'hotel',
    displayName: 'Madinah Central Inn',
    destination: 'Madinah',
    countryCode: 'SA',
    roomTypes: [{ name: 'Double', maxOccupancy: 2 }],
    seasons: [
      { name: 'standard', startDate: '2026-01-01', endDate: '2027-01-01' },
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

/**
 * Nusuk-approved Makkah/Madinah hotels (prd/hotel_list.md, 2026-07-18). The
 * source only gives one price point per hotel ("Quad Occupancy per night",
 * a USD range) plus a distance-to-landmark string and a single contact
 * value (phone or email) — everything below is derived from that:
 * - amount: the high end of the USD range, converted to IDR at the same
 *   USD->IDR rate seeded above (16,300), stored as the rate_rule's native
 *   currency (not USD + live conversion).
 * - room types: the source only supports Quad pricing, so Double (55%) and
 *   Triple (80%) are synthesized off the Quad amount, tiling occupancy
 *   1-4 with no gaps (1-2 / 3-3 / 4-4) — user-confirmed approach, see
 *   prd/hotels/CONTEXT.md.
 * - season: a single full-year 'standard' window — the source gives one
 *   flat rate with no seasonal breakdown.
 * Two hotels with no usable price ("Varies"/"N/A" throughout) are omitted:
 * The World Of Luxury Hospitality (Makkah, 4-star) and Park Royal Hotel
 * Company (Makkah, 3-star).
 */
const USD_TO_IDR = 16_300;

type NusukHotelSpec = {
  code: string;
  displayName: string;
  destination: 'Makkah' | 'Madinah';
  starRating: 3 | 4 | 5;
  /** High end of the source's USD quad-occupancy nightly range. */
  quadPriceUsdHigh: number;
  distanceMeters: number;
  distanceNote: string | null;
  contactPhone?: string;
  contactEmail?: string;
};

function toNusukProperty(spec: NusukHotelSpec): PropertySeed {
  const quad = spec.quadPriceUsdHigh * USD_TO_IDR;
  const triple = spec.quadPriceUsdHigh * 13_040; // quad * 0.80
  const double = spec.quadPriceUsdHigh * 8_965; // quad * 0.55
  return {
    code: spec.code,
    type: 'hotel',
    displayName: spec.displayName,
    destination: spec.destination,
    countryCode: 'SA',
    starRating: spec.starRating,
    distanceMeters: spec.distanceMeters,
    distanceNote: spec.distanceNote ?? undefined,
    contactPhone: spec.contactPhone,
    contactEmail: spec.contactEmail,
    roomTypes: [
      { name: 'Double', maxOccupancy: 2 },
      { name: 'Triple', maxOccupancy: 3 },
      { name: 'Quad', maxOccupancy: 4 },
    ],
    seasons: [
      { name: 'standard', startDate: '2026-01-01', endDate: '2027-01-01' },
    ],
    rateRules: [
      {
        seasonName: 'standard',
        roomTypeName: 'Double',
        minOccupancy: 1,
        maxOccupancy: 2,
        amount: double,
        currency: 'IDR',
      },
      {
        seasonName: 'standard',
        roomTypeName: 'Triple',
        minOccupancy: 3,
        maxOccupancy: 3,
        amount: triple,
        currency: 'IDR',
      },
      {
        seasonName: 'standard',
        roomTypeName: 'Quad',
        minOccupancy: 4,
        maxOccupancy: 4,
        amount: quad,
        currency: 'IDR',
      },
    ],
  };
}

const nusukHotelSpecs: NusukHotelSpec[] = [
  // --- 5-star, Madinah ---
  {
    code: '01KY01F0ZFGS0GN9NCNBBY80N8',
    displayName: 'Anwar Almadinah Mövenpick',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 350,
    distanceMeters: 100,
    distanceNote: 'Less than',
    contactPhone: '+966 14 818 1000',
  },
  {
    code: '01KY01F0ZGNBD6BGRENFQK9XGJ',
    displayName: 'Crowne Plaza Madinah',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 300,
    distanceMeters: 150,
    distanceNote: 'Less than',
    contactPhone: '+966 14 818 5000',
  },
  {
    code: '01KY01F0ZHY1CMNVYB7RV2CZ43',
    displayName: 'The Oberoi Madina',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 600,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactEmail: 'reservations.madina@oberoihotels.com',
  },
  {
    code: '01KY01F0ZKB4TFFVGYJZH93TYG',
    displayName: 'Al Madinah Hilton Hotel',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 400,
    distanceMeters: 100,
    distanceNote: 'Less than',
    contactPhone: '+966 14 820 1000',
  },
  {
    code: '01KY01F0ZMGN6MMHZKKNMCX4QN',
    displayName: 'Sofitel Shahd Al Madinah',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 400,
    distanceMeters: 100,
    distanceNote: 'Less than',
    contactPhone: '+966 14 829 9999',
  },
  {
    code: '01KY01F0ZPKNZRHDWTKDRM3WCP',
    displayName: 'Saja Almadinah Hotel',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 200,
    distanceMeters: 400,
    distanceNote: 'Approx.',
    contactEmail: 'info@sajaalmadinah.com',
  },
  {
    code: '01KY01F0ZQY0HTV1FM1G46XT2R',
    displayName: 'Dar Al Iman InterContinental',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 500,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactPhone: '+966 14 820 6666',
  },
  {
    code: '01KY01F0ZRJQSV0XJ0T5CQ7Y0P',
    displayName: 'Aqeeq Madina Hotel',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 280,
    distanceMeters: 150,
    distanceNote: 'Less than',
    contactPhone: '+966 14 820 5500',
  },
  {
    code: '01KY01F0ZSSKV95Z7APV0MKX82',
    displayName: 'Dar Al Taqwa Madinah',
    destination: 'Madinah',
    starRating: 5,
    quadPriceUsdHigh: 500,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactEmail: 'info@daraltaqwa.com',
  },
  // --- 5-star, Makkah ---
  {
    code: '01KY01F0ZSSKV95Z7APV0MKX83',
    displayName: 'Al Marwa Rayhaan By Rotana',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 350,
    distanceMeters: 150,
    distanceNote: '2 min walk',
    contactEmail: 'res.almarwa@rotana.com',
  },
  {
    code: '01KY01F0ZVDTZHTMJ1V04V5H8D',
    displayName: 'Anjum Hotel Makkah',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 250,
    distanceMeters: 450,
    distanceNote: '5-10 min walk',
    contactEmail: 'info@anjumhotels.com',
  },
  {
    code: '01KY01F0ZVDTZHTMJ1V04V5H8E',
    displayName: 'Al Safwa Hotel Towers',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 400,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactPhone: '+966 12 576 4444',
  },
  {
    code: '01KY01F0ZWS97RJN6EYY40A1EF',
    displayName: 'Dar Al Tawhid Intercontinental',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 700,
    distanceMeters: 50,
    distanceNote: 'Front row',
    contactPhone: '+966 12 529 5000',
  },
  {
    code: '01KY01F0ZXQB4F2G2PWZ0CBYX7',
    displayName: 'Makkah Clock Royal Tower (Fairmont)',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 600,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactEmail: 'makkah@fairmont.com',
  },
  {
    code: '01KY01F0ZYYNNV4S4QKH0RYNTZ',
    displayName: 'Swissotel Makkah',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 450,
    distanceMeters: 100,
    distanceNote: null,
    contactEmail: 'makkah@swissotel.com',
  },
  {
    code: '01KY01F0ZYYNNV4S4QKH0RYNV0',
    displayName: 'Raffles Makkah Palace',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 800,
    distanceMeters: 50,
    distanceNote: 'Less than',
    contactPhone: '+966 12 571 2888',
  },
  {
    code: '01KY01F0ZZ86R8KQ0W7C129ZQB',
    displayName: 'Hilton Jabal Omar',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 400,
    distanceMeters: 250,
    distanceNote: null,
    contactPhone: '+966 12 530 3000',
  },
  {
    code: '01KY01F0ZZ86R8KQ0W7C129ZQC',
    displayName: 'Zamzam Pullman Makkah',
    destination: 'Makkah',
    starRating: 5,
    quadPriceUsdHigh: 350,
    distanceMeters: 100,
    distanceNote: 'Less than',
    contactEmail: 'h7604@accor.com',
  },
  // --- 4-star, Madinah ---
  {
    code: '01KY01F100FHMG6Y1HKEK99WDC',
    displayName: 'Al Muna Kareem Hotel',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 250,
    distanceMeters: 200,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 825 5005',
  },
  {
    code: '01KY01F101XMA8QWH88J55E1AE',
    displayName: 'Zamzam Pullman Madina',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 280,
    distanceMeters: 150,
    distanceNote: 'Approx.',
    contactEmail: 'h8139@accor.com',
  },
  {
    code: '01KY01F102W13FFVNW3FWZ9PE4',
    displayName: 'Dar Al Hijra InterContinental',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 250,
    distanceMeters: 300,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 820 7777',
  },
  {
    code: '01KY01F103X460A4RWSVHNDQWK',
    displayName: 'Emaar Royal Hotel',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 220,
    distanceMeters: 100,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 828 7777',
  },
  {
    code: '01KY01F103X460A4RWSVHNDQWM',
    displayName: 'Dallah Taibah Hotel',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 300,
    distanceMeters: 100,
    distanceNote: 'Less than',
    contactEmail: 'info@dallahtaibah.com',
  },
  {
    code: '01KY01F104QJEV05CSH9N59WR7',
    displayName: 'Valy Hotel',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 150,
    distanceMeters: 300,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 831 2222',
  },
  {
    code: '01KY01F105ZM3VDQNE076995VQ',
    displayName: 'Bosphorus Hotel',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 160,
    distanceMeters: 400,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 827 3333',
  },
  {
    code: '01KY01F106PX9FH10MGG8HEZSK',
    displayName: 'Two Roya Al Andalus Company',
    destination: 'Madinah',
    starRating: 4,
    quadPriceUsdHigh: 160,
    distanceMeters: 200,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 813 1333',
  },
  // --- 4-star, Makkah ---
  {
    code: '01KY01F106PX9FH10MGG8HEZSM',
    displayName: 'Al Dana Diamond Hotel Company',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 140,
    distanceMeters: 800,
    distanceNote: 'Approx.',
    contactEmail: 'info@aldanadiamond.com',
  },
  {
    code: '01KY01F107PSRM85XA6AW9B7HW',
    displayName: 'Azka Al Safa Hotel Company',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 200,
    distanceMeters: 150,
    distanceNote: 'Approx.',
    contactPhone: '+966 12 566 6999',
  },
  {
    code: '01KY01F108KVCYZ39Q5W3C5RP4',
    displayName: 'Maysan Al Mashaer Hotel',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 90,
    distanceMeters: 5000,
    distanceNote: 'Shuttle',
    contactEmail: 'info@maysanhotels.com',
  },
  {
    code: '01KY01F108KVCYZ39Q5W3C5RP5',
    displayName: 'Courtyard By Marriott Makkah',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 150,
    distanceMeters: 2000,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 578 3000',
  },
  {
    code: '01KY01F1097JWJXJSHD1H6D753',
    displayName: 'Doubletree By Hilton Jabal Omar',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 250,
    distanceMeters: 400,
    distanceNote: 'Approx.',
    contactPhone: '+966 12 550 4321',
  },
  {
    code: '01KY01F10ATP73ET19WMQC35XC',
    displayName: 'Emaar Grand Hotel',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 130,
    distanceMeters: 700,
    distanceNote: 'Approx.',
    contactPhone: '+966 12 531 3000',
  },
  {
    code: '01KY01F10ATP73ET19WMQC35XD',
    displayName: 'Four Points By Sheraton Hotel',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 100,
    distanceMeters: 7000,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 528 2828',
  },
  {
    code: '01KY01F10B0TWVGT309Q8CZDVN',
    displayName: 'Lamar Hotel',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 110,
    distanceMeters: 1500,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 541 4444',
  },
  {
    code: '01KY01F10B0TWVGT309Q8CZDVP',
    displayName: 'Maad Tourism Company',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 130,
    distanceMeters: 1500,
    distanceNote: 'Approx.',
    contactEmail: 'info@maad.com.sa',
  },
  {
    code: '01KY01F10C9XW78B65079J6MZM',
    displayName: 'Novotel Residences Hotel',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 130,
    distanceMeters: 3000,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 550 8800',
  },
  {
    code: '01KY01F10D3EY08SR75Q1Q476Z',
    displayName: 'Sheraton Makkah Jabal Al Kaaba',
    destination: 'Makkah',
    starRating: 4,
    quadPriceUsdHigh: 250,
    distanceMeters: 500,
    distanceNote: 'Approx.',
    contactPhone: '+966 12 551 8900',
  },
  // --- 3-star, Madinah ---
  {
    code: '01KY01F10D3EY08SR75Q1Q4770',
    displayName: 'Maden Al Rawda Hotel',
    destination: 'Madinah',
    starRating: 3,
    quadPriceUsdHigh: 130,
    distanceMeters: 300,
    distanceNote: 'Approx.',
    contactEmail: 'info@madenhotel.com',
  },
  {
    code: '01KY01F10ENDG77ME2WQMS1HQB',
    displayName: 'The House of Faith',
    destination: 'Madinah',
    starRating: 3,
    quadPriceUsdHigh: 110,
    distanceMeters: 500,
    distanceNote: 'Approx.',
  },
  {
    code: '01KY01F10FW4EKHP3GS8CG4XM5',
    displayName: 'Castle Hotel',
    destination: 'Madinah',
    starRating: 3,
    quadPriceUsdHigh: 100,
    distanceMeters: 600,
    distanceNote: 'Approx.',
  },
  {
    code: '01KY01F10FW4EKHP3GS8CG4XM6',
    displayName: 'Maien Taiba',
    destination: 'Madinah',
    starRating: 3,
    quadPriceUsdHigh: 120,
    distanceMeters: 400,
    distanceNote: 'Approx.',
  },
  {
    code: '01KY01F10G861X65KMNQA2B8T4',
    displayName: 'Rua Al Hijrah Hotel',
    destination: 'Madinah',
    starRating: 3,
    quadPriceUsdHigh: 140,
    distanceMeters: 250,
    distanceNote: 'Approx.',
    contactPhone: '+966 14 818 0000',
  },
  // --- 3-star, Makkah ---
  {
    code: '01KY01F10HRHBDKMXFJZCNT3GS',
    displayName: 'Al Kiswah Towers Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 80,
    distanceMeters: 1500,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 529 5555',
  },
  {
    code: '01KY01F10HRHBDKMXFJZCNT3GT',
    displayName: 'Alolayan Golden Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 85,
    distanceMeters: 2000,
    distanceNote: 'Shuttle',
  },
  {
    code: '01KY01F10J2AHJJDS2PXVGYKQD',
    displayName: 'Batoul Ajyad Company',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 90,
    distanceMeters: 1000,
    distanceNote: 'Approx.',
  },
  {
    code: '01KY01F10K9207SBGKEBFARWNK',
    displayName: 'Maysan Al Aziziya Hotel Company',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 70,
    distanceMeters: 5000,
    distanceNote: 'Shuttle',
    contactEmail: 'info@maysanhotels.com',
  },
  {
    code: '01KY01F10ZFEW61V51TG6BGP52',
    displayName: 'Maysan Al Maqam Hotel Company',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 70,
    distanceMeters: 5000,
    distanceNote: 'Shuttle',
    contactEmail: 'info@maysanhotels.com',
  },
  {
    code: '01KY01F10M8D1XZEK9YN56Y9DA',
    displayName: 'Maysan Al Multazam Hotel Company',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 70,
    distanceMeters: 5000,
    distanceNote: 'Shuttle',
    contactEmail: 'info@maysanhotels.com',
  },
  {
    code: '01KY01F10M8D1XZEK9YN56Y9DB',
    displayName: 'Maysan Al Safa Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 70,
    distanceMeters: 5000,
    distanceNote: 'Shuttle',
    contactEmail: 'info@maysanhotels.com',
  },
  {
    code: '01KY01F10NEV63F8XHW3XCFBP4',
    displayName: 'Emaar Al Manar Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 80,
    distanceMeters: 1200,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 531 3000',
  },
  {
    code: '01KY01F10QSA5DY2C6X402FVX0',
    displayName: 'Masar Al Aez Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 75,
    distanceMeters: 2000,
    distanceNote: 'Shuttle',
  },
  {
    code: '01KY01F10RV8MQN7J7B39V94K5',
    displayName: 'Nada Ajyad Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 95,
    distanceMeters: 800,
    distanceNote: 'Approx.',
    contactPhone: '+966 12 577 7771',
  },
  {
    code: '01KY01F10SSZ7YPM7XTVYXYFXD',
    displayName: 'Palestine Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 80,
    distanceMeters: 1500,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 535 5555',
  },
  {
    code: '01KY01F10TCRD5RTTSMYX6X6AW',
    displayName: 'Saraya Al Deafah Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 75,
    distanceMeters: 1200,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 574 4444',
  },
  {
    code: '01KY01F10V9J7K7JQW0YRX3G9S',
    displayName: 'Snood Ajyad Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 85,
    distanceMeters: 1500,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 533 3333',
  },
  {
    code: '01KY01F10WQ349VA0TF2GZK321',
    displayName: 'Violet Hotel',
    destination: 'Makkah',
    starRating: 3,
    quadPriceUsdHigh: 70,
    distanceMeters: 4000,
    distanceNote: 'Shuttle',
    contactPhone: '+966 12 550 5555',
  },
];

properties.push(...nusukHotelSpecs.map(toNusukProperty));

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sequential seed orchestration — a flat list of simple insert loops, one per entity; splitting it would scatter the deterministic ordering that re-seeding depends on
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

  const uniqueFlightsMap = new Map();
  for (const f of flights) {
    const key = `${f.operatingAirline}_${f.flightNumber}`;
    if (!uniqueFlightsMap.has(key)) {
      uniqueFlightsMap.set(key, f);
    }
  }
  const uniqueFlights = Array.from(uniqueFlightsMap.values());
  for (const flight of uniqueFlights) {
    const [row] = await db
      .insert(schema.flights)
      .values({
        operatingAirline: flight.operatingAirline,
        flightNumber: flight.flightNumber,
        originAirport: flight.originAirport,
        destAirport: flight.destAirport,
        departureTimeLocal: flight.departureTimeLocal,
        arrivalTimeLocal: flight.arrivalTimeLocal,
        price: flight.price,
        currency: flight.currency ?? 'USD',
      })
      .onConflictDoUpdate({
        target: [schema.flights.operatingAirline, schema.flights.flightNumber],
        set: {
          originAirport: flight.originAirport,
          destAirport: flight.destAirport,
          arrivalTimeLocal: flight.arrivalTimeLocal,
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
        departureTimeLocal: flight.departureTimeLocal,
        arrivalTimeLocal: flight.arrivalTimeLocal,
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

          departureTimeLocal: leg.departureTimeLocal,
          arrivalTimeLocal: leg.arrivalTimeLocal,
        })
        .onConflictDoUpdate({
          target: [schema.flightLegs.flightId, schema.flightLegs.legSequence],
          set: {
            role: leg.role,
            depAirport: leg.depAirport,
            arrAirport: leg.arrAirport,
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
  // For simplicity in seeding, we just clear and re-insert.
  await db.delete(schema.mctRules);
  if (mctRules && mctRules.length > 0) {
    await db.insert(schema.mctRules).values(mctRules);
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

  // "Standard" is now the absence of a season — a season-less rate rule is the
  // base rate. Idempotent one-time cleanup: drop any legacy 'standard' seasons
  // and their rate rules so the standard bands below re-create season-less.
  const legacyStandardSeasons = await db
    .select({ id: schema.season.id })
    .from(schema.season)
    .where(eq(schema.season.name, 'standard'));
  if (legacyStandardSeasons.length > 0) {
    await db.delete(schema.rateRule).where(
      inArray(
        schema.rateRule.seasonId,
        legacyStandardSeasons.map((s) => s.id),
      ),
    );
    await db.delete(schema.season).where(eq(schema.season.name, 'standard'));
  }

  // Room types are global reference data — seed the union of every property's
  // room types once, keyed by name (max occupancy is the category default).
  const roomTypeMaxByName = new Map<string, number>();
  for (const item of properties) {
    for (const rt of item.roomTypes) {
      roomTypeMaxByName.set(
        rt.name,
        Math.max(roomTypeMaxByName.get(rt.name) ?? 0, rt.maxOccupancy),
      );
    }
  }
  const roomTypeIdByName = new Map<string, string>();
  for (const [name, maxOccupancy] of roomTypeMaxByName) {
    const [row] = await db
      .insert(schema.roomType)
      .values({ name, maxOccupancy })
      .onConflictDoUpdate({
        target: schema.roomType.name,
        set: { maxOccupancy },
      })
      .returning();
    roomTypeIdByName.set(name, row.id);
  }

  // Seasons are global reference labels — 'standard' is season-less (null), so
  // only the dated season names become rows. The per-property date window is
  // seeded as season_window inside the property loop below.
  const seasonNames = new Set<SeasonSeed['name']>();
  for (const item of properties) {
    for (const s of item.seasons) {
      if (s.name !== 'standard') seasonNames.add(s.name);
    }
  }
  const seasonIdByName = new Map<string, string>();
  for (const name of seasonNames) {
    const [row] = await db
      .insert(schema.season)
      .values({ name })
      .onConflictDoUpdate({ target: schema.season.name, set: { name } })
      .returning();
    seasonIdByName.set(name, row.id);
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
        distanceMeters: item.distanceMeters ?? null,
        distanceNote: item.distanceNote ?? null,
        contactPhone: item.contactPhone ?? null,
        contactEmail: item.contactEmail ?? null,
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
          distanceMeters: item.distanceMeters ?? null,
          distanceNote: item.distanceNote ?? null,
          contactPhone: item.contactPhone ?? null,
          contactEmail: item.contactEmail ?? null,
        },
      });

    // Per-property dated windows map a stay date to a global season. 'standard'
    // is season-less (null) — no window row. Idempotent: skip if an identical
    // window already exists (the EXCLUDE constraint would reject a re-insert).
    for (const season of item.seasons) {
      if (season.name === 'standard') continue;
      const seasonId = seasonIdByName.get(season.name);
      if (!seasonId) {
        throw new Error(
          `Seed error: ${item.code} references unknown season "${season.name}"`,
        );
      }
      // Idempotency keys on (property, dates) — the granularity the EXCLUDE
      // constraint enforces — not the season, so a re-seed that reassigns the
      // same window to a different season reconciles it instead of colliding.
      const [existing] = await db
        .select({
          id: schema.seasonWindow.id,
          seasonId: schema.seasonWindow.seasonId,
        })
        .from(schema.seasonWindow)
        .where(
          and(
            eq(schema.seasonWindow.propertyCode, item.code),
            eq(schema.seasonWindow.startDate, season.startDate),
            eq(schema.seasonWindow.endDate, season.endDate),
          ),
        );
      if (!existing) {
        await db.insert(schema.seasonWindow).values({
          propertyCode: item.code,
          seasonId,
          startDate: season.startDate,
          endDate: season.endDate,
        });
      } else if (existing.seasonId !== seasonId) {
        await db
          .update(schema.seasonWindow)
          .set({ seasonId })
          .where(eq(schema.seasonWindow.id, existing.id));
      }
    }

    for (const rule of item.rateRules) {
      // A 'standard' rate rule is season-less (the base rate); everything else
      // resolves to its dated season.
      const seasonId =
        rule.seasonName === 'standard'
          ? null
          : (seasonIdByName.get(rule.seasonName) ?? null);
      if (rule.seasonName !== 'standard' && seasonId === null) {
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
            seasonId === null
              ? isNull(schema.rateRule.seasonId)
              : eq(schema.rateRule.seasonId, seasonId),
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

  // Sample umrah packages: each pairs a real seeded flight with an ordered
  // Makkah + Madinah stay (real seeded properties), a dated departure, and an
  // included/excluded list — gives the public listing real umrah content.
  const travelPackageSeeds: Array<{
    title: string;
    description: string;
    type: 'umrah' | 'umrah_plus' | 'hajj';
    operatingAirline: string;
    flightNumber: string;
    departureTimeLocal: string;
    mealPlan: 'full_board' | 'half_board' | 'room_only';
    price: number;
    currency: string;
    isFeatured?: boolean;
    stays: Array<{ propertyCode: string; sequence: number; nights: number }>;
    departures: Array<{
      departureDate: string;
      returnDate: string | null;
      seatsNote: string | null;
      totalSeats?: number | null;
    }>;
    inclusions: Array<{ kind: 'included' | 'excluded'; label: string }>;
  }> = [
    {
      title: '9-Day Umrah — Makkah & Madinah',
      description:
        'Round-trip flight, 5 nights in Makkah and 3 nights in Madinah, full-board catering, and guided ziyarah.',
      type: 'umrah',
      operatingAirline: 'GA',
      flightNumber: '402',
      departureTimeLocal: '11:50',
      mealPlan: 'full_board',
      price: 1200,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F108KVCYZ39Q5W3C5RP5', sequence: 1, nights: 5 },
        { propertyCode: '01KY01F0ZGNBD6BGRENFQK9XGJ', sequence: 2, nights: 3 },
      ],
      departures: [
        {
          departureDate: '2026-08-05',
          returnDate: '2026-08-13',
          seatsNote: 'Sisa 8 seat',
          totalSeats: 45,
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Transportasi darat (bus AC)' },
        { kind: 'included', label: 'Ziyarah Makkah & Madinah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '12-Night Grand Umrah',
      description:
        'Extended round-trip flight, 7 nights in Makkah and 5 nights in Madinah at 5-star hotels near the Haramain.',
      type: 'umrah',
      operatingAirline: 'SV',
      flightNumber: '816',
      departureTimeLocal: '09:10',
      mealPlan: 'full_board',
      price: 1850,
      currency: 'USD',
      isFeatured: true,
      stays: [
        { propertyCode: '01KY01F10C9XW78B65079J6MZM', sequence: 1, nights: 7 },
        { propertyCode: '01KY01F0ZFGS0GN9NCNBBY80N8', sequence: 2, nights: 5 },
      ],
      departures: [
        {
          departureDate: '2026-08-05',
          returnDate: '2026-08-17',
          seatsNote: 'Sisa 4 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Manasik pra-keberangkatan' },
        { kind: 'included', label: 'Perlengkapan umrah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '7-Night Madinah-First Umrah',
      description:
        'Round-trip flight starting in Madinah (4 nights) before Makkah (3 nights).',
      type: 'umrah',
      operatingAirline: 'GA',
      flightNumber: '404',
      departureTimeLocal: '13:30',
      mealPlan: 'half_board',
      price: 950,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F0ZHY1CMNVYB7RV2CZ43', sequence: 1, nights: 4 },
        { propertyCode: '01KY01F1097JWJXJSHD1H6D753', sequence: 2, nights: 3 },
      ],
      departures: [
        {
          departureDate: '2026-08-05',
          returnDate: '2026-08-12',
          seatsNote: null,
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Transportasi darat (bus AC)' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '10-Day Premium Umrah — Swissôtel & Hilton',
      description:
        'Round-trip flight, 6 nights at Swissôtel Makkah and 4 nights at Al Madinah Hilton, full-board catering. Three seasonal departures across Aug–Oct.',
      type: 'umrah',
      operatingAirline: 'GA',
      flightNumber: '402',
      departureTimeLocal: '11:50',
      mealPlan: 'full_board',
      price: 1450,
      currency: 'USD',
      isFeatured: true,
      stays: [
        { propertyCode: '01KY01F0ZYYNNV4S4QKH0RYNTZ', sequence: 1, nights: 6 },
        { propertyCode: '01KY01F0ZKB4TFFVGYJZH93TYG', sequence: 2, nights: 4 },
      ],
      departures: [
        {
          departureDate: '2026-08-15',
          returnDate: '2026-08-25',
          seatsNote: 'High season — sisa 6 seat',
        },
        {
          departureDate: '2026-09-15',
          returnDate: '2026-09-25',
          seatsNote: 'Shoulder season — sisa 12 seat',
        },
        {
          departureDate: '2026-10-15',
          returnDate: '2026-10-25',
          seatsNote: 'Value season — sisa 20 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Transportasi darat (bus AC)' },
        { kind: 'included', label: 'Ziyarah Makkah & Madinah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
        { kind: 'excluded', label: 'Dam / denda ihram' },
      ],
    },
    {
      title: '8-Day Economy Umrah — Hemat',
      description:
        'Affordable round-trip flight with 5 nights in Makkah and 3 nights in Madinah at comfortable 4-star hotels, half-board catering.',
      type: 'umrah',
      operatingAirline: 'SV',
      flightNumber: '816',
      departureTimeLocal: '09:10',
      mealPlan: 'half_board',
      price: 875,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F108KVCYZ39Q5W3C5RP5', sequence: 1, nights: 5 },
        { propertyCode: '01KY01F100FHMG6Y1HKEK99WDC', sequence: 2, nights: 3 },
      ],
      departures: [
        {
          departureDate: '2026-09-05',
          returnDate: '2026-09-13',
          seatsNote: 'Shoulder season',
        },
        {
          departureDate: '2026-10-05',
          returnDate: '2026-10-13',
          seatsNote: 'Value season — sisa 25 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Manasik pra-keberangkatan' },
        { kind: 'excluded', label: 'Perlengkapan umrah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '11-Night Luxury Umrah — Haram View 5★',
      description:
        'Premium round-trip flight, 6 nights at Makkah Clock Royal Tower and 5 nights at The Oberoi Madina, full-board catering and private ziyarah.',
      type: 'umrah',
      operatingAirline: 'GA',
      flightNumber: '402',
      departureTimeLocal: '11:50',
      mealPlan: 'full_board',
      price: 2400,
      currency: 'USD',
      isFeatured: true,
      stays: [
        { propertyCode: '01KY01F0ZXQB4F2G2PWZ0CBYX7', sequence: 1, nights: 6 },
        { propertyCode: '01KY01F0ZHY1CMNVYB7RV2CZ43', sequence: 2, nights: 5 },
      ],
      departures: [
        {
          departureDate: '2026-08-25',
          returnDate: '2026-09-05',
          seatsNote: 'High season — sisa 4 seat',
        },
        {
          departureDate: '2026-09-25',
          returnDate: '2026-10-06',
          seatsNote: 'Shoulder season — sisa 8 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Transportasi darat (bus mewah)' },
        { kind: 'included', label: 'Ziyarah privat Makkah & Madinah' },
        { kind: 'included', label: 'Perlengkapan umrah premium' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '13-Day Umrah Plus — Jeddah City Tour',
      description:
        'Madinah-first itinerary: 4 nights Madinah, 7 nights Makkah, then 2 nights in Jeddah with a city tour before flying home.',
      type: 'umrah_plus',
      operatingAirline: 'SV',
      flightNumber: '818',
      departureTimeLocal: '17:30',
      mealPlan: 'full_board',
      price: 1990,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F0ZMGN6MMHZKKNMCX4QN', sequence: 1, nights: 4 },
        { propertyCode: '01KY01F0ZYYNNV4S4QKH0RYNV0', sequence: 2, nights: 7 },
        { propertyCode: '01KY01F10WQ349VA0TF2GZK322', sequence: 3, nights: 2 },
      ],
      departures: [
        {
          departureDate: '2026-09-05',
          returnDate: '2026-09-18',
          seatsNote: 'Shoulder season',
        },
        {
          departureDate: '2026-10-05',
          returnDate: '2026-10-18',
          seatsNote: 'Value season — sisa 15 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'City tour Jeddah (Balad & Corniche)' },
        { kind: 'included', label: 'Transportasi darat (bus AC)' },
        { kind: 'excluded', label: 'Tips guide & driver' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '9-Night Umrah — Zamzam Towers',
      description:
        'Madinah-first round-trip flight, 4 nights at Anwar Almadinah Mövenpick and 5 nights at Zamzam Pullman Makkah, half-board. IDR-priced.',
      type: 'umrah',
      operatingAirline: 'GA',
      flightNumber: '404',
      departureTimeLocal: '13:30',
      mealPlan: 'half_board',
      price: 28500000,
      currency: 'IDR',
      isFeatured: true,
      stays: [
        { propertyCode: '01KY01F0ZFGS0GN9NCNBBY80N8', sequence: 1, nights: 4 },
        { propertyCode: '01KY01F0ZZ86R8KQ0W7C129ZQC', sequence: 2, nights: 5 },
      ],
      departures: [
        {
          departureDate: '2026-08-05',
          returnDate: '2026-08-14',
          seatsNote: 'High season — sisa 5 seat',
        },
        {
          departureDate: '2026-09-05',
          returnDate: '2026-09-14',
          seatsNote: 'Shoulder season',
        },
        {
          departureDate: '2026-10-05',
          returnDate: '2026-10-14',
          seatsNote: 'Value season — sisa 18 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Perlengkapan umrah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '14-Day Grand Umrah Plus — Jeddah Extension',
      description:
        'Round-trip flight, 7 nights at Dar Al Tawhid Intercontinental Makkah, 5 nights at Dar Al Iman InterContinental Madinah, plus 2 nights in Jeddah.',
      type: 'umrah_plus',
      operatingAirline: 'SV',
      flightNumber: '816',
      departureTimeLocal: '09:10',
      mealPlan: 'full_board',
      price: 2250,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F0ZWS97RJN6EYY40A1EF', sequence: 1, nights: 7 },
        { propertyCode: '01KY01F0ZQY0HTV1FM1G46XT2R', sequence: 2, nights: 5 },
        { propertyCode: '01KY01F10WQ349VA0TF2GZK322', sequence: 3, nights: 2 },
      ],
      departures: [
        {
          departureDate: '2026-10-05',
          returnDate: '2026-10-19',
          seatsNote: 'Value season — sisa 10 seat',
        },
        {
          departureDate: '2026-10-15',
          returnDate: '2026-10-29',
          seatsNote: 'Value season',
        },
        {
          departureDate: '2026-10-25',
          returnDate: '2026-11-08',
          seatsNote: 'Late season — sisa 22 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Umrah visa' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'City tour Jeddah' },
        { kind: 'included', label: 'Transportasi darat (bus mewah)' },
        { kind: 'included', label: 'Ziyarah Makkah & Madinah' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
    {
      title: '25-Day Hajj Package — Full Board 5★',
      description:
        'Complete hajj program: 15 nights at Al Marwa Rayhaan Makkah and 10 nights at Saja Almadinah, full-board catering, guided manasik. Limited quota.',
      type: 'hajj',
      operatingAirline: 'GA',
      flightNumber: '402',
      departureTimeLocal: '11:50',
      mealPlan: 'full_board',
      price: 8500,
      currency: 'USD',
      stays: [
        { propertyCode: '01KY01F0ZSSKV95Z7APV0MKX83', sequence: 1, nights: 15 },
        { propertyCode: '01KY01F0ZPKNZRHDWTKDRM3WCP', sequence: 2, nights: 10 },
      ],
      departures: [
        {
          departureDate: '2026-09-15',
          returnDate: '2026-10-10',
          seatsNote: 'Kuota terbatas — sisa 3 seat',
        },
      ],
      inclusions: [
        { kind: 'included', label: 'Hajj visa & tasrih' },
        { kind: 'included', label: 'Muthawwif / pembimbing ibadah' },
        { kind: 'included', label: 'Tenda Arafah & Mina (maktab resmi)' },
        { kind: 'included', label: 'Manasik haji lengkap' },
        { kind: 'included', label: 'Dam / hadyu' },
        { kind: 'excluded', label: 'Pengeluaran pribadi' },
      ],
    },
  ];

  // Umrah travel companies (providers) the agent markets for.
  const travelProviderSeeds = [
    {
      name: 'Barokah Umrah Travel',
      licenseNumber: 'PPIU-2021-001',
      contactPhone: '+62 21 555 0101',
      contactEmail: 'sales@barokah.example',
      website: 'https://barokah.example',
    },
    {
      name: 'Al-Safar Wisata',
      licenseNumber: 'PPIU-2020-114',
      contactPhone: '+62 21 555 0202',
      contactEmail: 'info@alsafar.example',
      website: null,
    },
    {
      name: 'Madinah Berkah Tour',
      licenseNumber: 'PPIU-2022-078',
      contactPhone: '+62 21 555 0303',
      contactEmail: 'cs@madinahberkah.example',
      website: null,
    },
  ];
  const providerIds: string[] = [];
  for (const provider of travelProviderSeeds) {
    const [existing] = await db
      .select({ id: schema.travelProvider.id })
      .from(schema.travelProvider)
      .where(eq(schema.travelProvider.name, provider.name));
    if (existing) {
      await db
        .update(schema.travelProvider)
        .set(provider)
        .where(eq(schema.travelProvider.id, existing.id));
      providerIds.push(existing.id);
    } else {
      const [inserted] = await db
        .insert(schema.travelProvider)
        .values(provider)
        .returning({ id: schema.travelProvider.id });
      providerIds.push(inserted.id);
    }
  }

  // Stays FK city_code to the city master table. Property codes are ULIDs, so
  // resolve each stay's city from its property's destination name.
  const cityCodeByName = new Map(cities.map((c) => [c.name, c.cityCode]));
  const cityCodeByPropertyCode = new Map(
    properties.map((p) => [p.code, cityCodeByName.get(p.destination)]),
  );

  for (const [pkgIndex, item] of travelPackageSeeds.entries()) {
    const [anchorFlight] = await db
      .select({ id: schema.flights.id })
      .from(schema.flights)
      .where(
        and(
          eq(schema.flights.operatingAirline, item.operatingAirline),
          eq(schema.flights.flightNumber, item.flightNumber),
          eq(schema.flights.departureTimeLocal, item.departureTimeLocal),
        ),
      );

    if (!anchorFlight) continue;

    const durationNights = item.stays.reduce(
      (sum, stay) => sum + stay.nights,
      0,
    );
    const travelPackageValues = {
      type: item.type,
      title: item.title,
      description: item.description,
      durationNights,
      mealPlan: item.mealPlan,
      price: item.price,
      currency: item.currency,
      isActive: true,
      isFeatured: item.isFeatured ?? false,
      // Round-robin a provider onto each package; VIP-priced packages carry a
      // higher per-seat commission than economy ones.
      providerId: providerIds[pkgIndex % providerIds.length] ?? null,
      feePerSeat: item.price >= 2000 ? 100 : 50,
    };

    const [existingTravelPackage] = await db
      .select({ id: schema.flightHotelPackage.id })
      .from(schema.flightHotelPackage)
      .where(eq(schema.flightHotelPackage.title, travelPackageValues.title));

    let packageId: string;
    if (existingTravelPackage) {
      await db
        .update(schema.flightHotelPackage)
        .set(travelPackageValues)
        .where(eq(schema.flightHotelPackage.id, existingTravelPackage.id));
      packageId = existingTravelPackage.id;
    } else {
      const [inserted] = await db
        .insert(schema.flightHotelPackage)
        .values(travelPackageValues)
        .returning({ id: schema.flightHotelPackage.id });
      packageId = inserted.id;
    }

    // Child rows are replaced wholesale so re-seeding stays idempotent.
    await db
      .delete(schema.travelPackageStay)
      .where(eq(schema.travelPackageStay.packageId, packageId));
    await db
      .delete(schema.travelPackageDeparture)
      .where(eq(schema.travelPackageDeparture.packageId, packageId));
    await db
      .delete(schema.travelPackageInclusion)
      .where(eq(schema.travelPackageInclusion.packageId, packageId));

    await db.insert(schema.travelPackageStay).values(
      item.stays.map((stay) => {
        const cityCode = cityCodeByPropertyCode.get(stay.propertyCode);
        if (!cityCode) {
          throw new Error(
            `Seed error: stay property ${stay.propertyCode} has no known city`,
          );
        }
        return { packageId, cityCode, ...stay };
      }),
    );
    if (item.departures.length > 0) {
      const insertedDepartures = await db
        .insert(schema.travelPackageDeparture)
        .values(
          item.departures.map((departure) => ({
            packageId,
            availableSeats: departure.totalSeats ?? null,
            ...departure,
          })),
        )
        .returning({ id: schema.travelPackageDeparture.id });

      const junctionValues = insertedDepartures.map((dep) => ({
        departureId: dep.id,
        flightId: anchorFlight.id,
        direction: 'OUTBOUND' as const,
        sequence: 1,
      }));
      await db
        .insert(schema.travelPackageDepartureFlight)
        .values(junctionValues);
    }
    if (item.inclusions.length > 0) {
      await db.insert(schema.travelPackageInclusion).values(
        item.inclusions.map((inclusion, index) => ({
          packageId,
          sequence: index + 1,
          ...inclusion,
        })),
      );
    }
  }

  console.log(
    `Seeded ${airports.length} airports, ${airlines.length} airlines, ${flights.length} flights, ${marketingCount} marketing rows, ${interlineAgreements.length} interline agreements`,
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
