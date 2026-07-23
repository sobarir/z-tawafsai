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
    // Technical-stop airport for NH 10's multi-leg route.
    airportCode: 'BKK',
    icaoCode: 'VTBS',
    name: 'Suvarnabhumi Airport',
    cityCode: 'BKK',
    countryCode: 'TH',
    timezone: 'Asia/Bangkok',
  },
  {
    // KL 800's destination — the cross-carrier interline scenario.
    airportCode: 'AMS',
    icaoCode: 'EHAM',
    name: 'Amsterdam Airport Schiphol',
    cityCode: 'AMS',
    countryCode: 'NL',
    timezone: 'Europe/Amsterdam',
  },
  // CGK<->JED/MED realistic search-data airports (Jeddah/Madinah corridor + 9
  // transit hubs). SIN and DOH above are reused.
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
  // CGK<->JED/MED realistic search-data airlines.
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
  // AirAsia Group feeder carriers for the KUL fly-thru itineraries in the
  // CGK->JED dataset (they hand off to D7 AirAsia X at KUL).
  {
    airlineCode: 'QZ',
    icaoCode: 'AWQ',
    name: 'Indonesia AirAsia',
    countryCode: 'ID',
  },
  {
    airlineCode: 'AK',
    icaoCode: 'AXM',
    name: 'AirAsia (Malaysia)',
    countryCode: 'MY',
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

// Minimum viable rule set, plus the carrier-specific override pair (the
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
    // maxConnectionMinutes=1440 is deliberate, NOT the 2880 ("max 48h") the
    // original spec's seed table suggested: the DOH stopover scenario's
    // 2730-min gap must classify as 'stopover', which only holds at 1440.
    // The golden scenario was the acceptance oracle and won over that note —
    // covered by connections.service.spec.ts, so changing this fails a test.
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
  // --- CGK<->JED/MED hub junctions. SIN/SIN
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
  // --- CGK<->JED/MED hub junctions.
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
  // AirAsia "Fly-Thru" at KUL: the feeder (QZ/AK) hands baggage through to the
  // AirAsia X (D7) long-haul leg to JED — the only cross-carrier connections in
  // the CGK->JED dataset (every other transit route stays on one operating
  // carrier, so it needs no interline row).
  { inboundAirline: 'QZ', outboundAirline: 'D7', bagThroughChecked: true },
  { inboundAirline: 'AK', outboundAirline: 'D7', bagThroughChecked: true },
];

// --- CGK -> JED physical flights -------------------------------------------
// Sourced from the Jakarta (CGK) -> Jeddah (JED) route dossier: 3 direct
// carriers plus 10 one-stop itineraries via 8 hubs. Each PHYSICAL flight is one
// row here; a transit itinerary is TWO rows that FlightsService.search() chains
// at query time (connection type is derived, never stored — CLAUDE.md rule 2).
//
// Times are LOCAL wall-clock (HH:MM) at each flight's own airports, with an
// integer arrival day offset — the schema stores no dates. Reconstruction:
// - Direct rows use the dossier's departure/arrival verbatim.
// - Transit rows honor the customer-facing CGK departure and JED arrival (with
//   the dossier's +1/+2 day markers) exactly; the intermediate hub arrival and
//   departure are derived from realistic per-leg block times so the leftover
//   ground gap lands within the hub's MCT..maxConnection window (verified: every
//   pair validates). The dossier's printed transit/total-duration columns are
//   internally inconsistent (several rows disagree with timezone math by 1-3h),
//   so they are treated as approximate — the explicit dep/arr cells win.
// - AirAsia's shared D7 700 KUL->JED leg is one row feeding both the QZ and AK
//   itineraries (their KUL arrivals differ, so the two ground gaps differ).
// - HU 702/7913 (Haikou, ~28h layover) is seeded but does not chain into a clean
//   itinerary: search's gap math is clock-only and cannot represent a >24h
//   layover — a known limitation, not specific to this data.
// Prices are illustrative USD, tier/distance-banded
// (direct headline highest; LCC feeders lowest).

type FlightSeed = {
  operatingAirline: string;
  flightNumber: string;
  originAirport: string;
  destAirport: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  arrivalDayOffset: number;
  price: number;
  /**
   * Only for a technical stop. Omit for a nonstop flight — legs describe stops,
   * not journeys, so a nonstop stores none. First leg must depart the flight's
   * origin, last must arrive its destination, and each must connect to the next.
   */
  legs?: {
    depAirport: string;
    arrAirport: string;
    departureTimeLocal: string;
    arrivalTimeLocal: string;
    departureDayOffset: number;
    arrivalDayOffset: number;
  }[];
};

const flightSeeds: FlightSeed[] = [
  // Direct CGK->JED (dossier section 1) — times verbatim.
  {
    operatingAirline: 'GA',
    flightNumber: '990',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '09:00',
    arrivalTimeLocal: '14:35',
    arrivalDayOffset: 0,
    price: 850,
  },
  {
    operatingAirline: 'SV',
    flightNumber: '817',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '00:40',
    arrivalTimeLocal: '06:10',
    arrivalDayOffset: 0,
    price: 780,
  },
  {
    operatingAirline: 'SV',
    flightNumber: '827',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '11:30',
    arrivalTimeLocal: '17:00',
    arrivalDayOffset: 0,
    price: 800,
  },
  // JT 110 is charter/seasonal ("sesuai jadwal charter") — a representative ~10h
  // overnight schedule stands in for the unpublished charter time.
  {
    operatingAirline: 'JT',
    flightNumber: '110',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '22:00',
    arrivalTimeLocal: '04:00',
    arrivalDayOffset: 1,
    price: 640,
  },
  // The one technical-stop flight in the seed. A narrowbody charter cannot make
  // CGK->JED nonstop, so it refuels at BOM: one flight number, one booking, and
  // BOM is NOT sellable — that is what makes it a technical stop rather than a
  // connection. Without this row `flight_legs` is empty in a seeded database and
  // every technical-stop code path ships untested; a stop-count double count
  // survived unnoticed for exactly that reason.
  {
    operatingAirline: 'JT',
    flightNumber: '112',
    originAirport: 'CGK',
    destAirport: 'JED',
    departureTimeLocal: '21:00',
    arrivalTimeLocal: '05:00',
    arrivalDayOffset: 1,
    price: 610,
    legs: [
      {
        depAirport: 'CGK',
        arrAirport: 'BOM',
        departureTimeLocal: '21:00',
        arrivalTimeLocal: '01:30',
        departureDayOffset: 0,
        arrivalDayOffset: 1,
      },
      {
        depAirport: 'BOM',
        arrAirport: 'JED',
        departureTimeLocal: '02:30',
        arrivalTimeLocal: '05:00',
        departureDayOffset: 1,
        arrivalDayOffset: 1,
      },
    ],
  },

  // Transit itineraries (dossier section 2) — leg 1 CGK->hub, leg 2 hub->JED.
  // EY via AUH
  {
    operatingAirline: 'EY',
    flightNumber: '475',
    originAirport: 'CGK',
    destAirport: 'AUH',
    departureTimeLocal: '18:10',
    arrivalTimeLocal: '23:00',
    arrivalDayOffset: 0,
    price: 340,
  },
  {
    operatingAirline: 'EY',
    flightNumber: '603',
    originAirport: 'AUH',
    destAirport: 'JED',
    departureTimeLocal: '02:00',
    arrivalTimeLocal: '03:55',
    arrivalDayOffset: 0,
    price: 330,
  },
  // EK via DXB
  {
    operatingAirline: 'EK',
    flightNumber: '357',
    originAirport: 'CGK',
    destAirport: 'DXB',
    departureTimeLocal: '17:55',
    arrivalTimeLocal: '22:55',
    arrivalDayOffset: 0,
    price: 340,
  },
  {
    operatingAirline: 'EK',
    flightNumber: '805',
    originAirport: 'DXB',
    destAirport: 'JED',
    departureTimeLocal: '00:30',
    arrivalTimeLocal: '02:25',
    arrivalDayOffset: 0,
    price: 330,
  },
  // QR via DOH
  {
    operatingAirline: 'QR',
    flightNumber: '957',
    originAirport: 'CGK',
    destAirport: 'DOH',
    departureTimeLocal: '18:25',
    arrivalTimeLocal: '22:45',
    arrivalDayOffset: 0,
    price: 350,
  },
  {
    operatingAirline: 'QR',
    flightNumber: '1188',
    originAirport: 'DOH',
    destAirport: 'JED',
    departureTimeLocal: '00:35',
    arrivalTimeLocal: '03:10',
    arrivalDayOffset: 0,
    price: 330,
  },
  // MH via KUL
  {
    operatingAirline: 'MH',
    flightNumber: '712',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '09:10',
    arrivalTimeLocal: '12:05',
    arrivalDayOffset: 0,
    price: 300,
  },
  {
    operatingAirline: 'MH',
    flightNumber: '156',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '14:45',
    arrivalTimeLocal: '19:00',
    arrivalDayOffset: 0,
    price: 340,
  },
  // AirAsia fly-thru via KUL — QZ 200 and AK 381 both feed the shared D7 700.
  {
    operatingAirline: 'QZ',
    flightNumber: '200',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '05:00',
    arrivalTimeLocal: '07:55',
    arrivalDayOffset: 0,
    price: 150,
  },
  {
    operatingAirline: 'AK',
    flightNumber: '381',
    originAirport: 'CGK',
    destAirport: 'KUL',
    departureTimeLocal: '08:35',
    arrivalTimeLocal: '11:30',
    arrivalDayOffset: 0,
    price: 190,
  },
  {
    operatingAirline: 'D7',
    flightNumber: '700',
    originAirport: 'KUL',
    destAirport: 'JED',
    departureTimeLocal: '15:55',
    arrivalTimeLocal: '20:25',
    arrivalDayOffset: 0,
    price: 340,
  },
  // 6E via BOM
  {
    operatingAirline: '6E',
    flightNumber: '1602',
    originAirport: 'CGK',
    destAirport: 'BOM',
    departureTimeLocal: '15:50',
    arrivalTimeLocal: '19:20',
    arrivalDayOffset: 0,
    price: 260,
  },
  {
    operatingAirline: '6E',
    flightNumber: '61',
    originAirport: 'BOM',
    destAirport: 'JED',
    departureTimeLocal: '21:35',
    arrivalTimeLocal: '00:05',
    arrivalDayOffset: 1,
    price: 320,
  },
  // WY via MCT
  {
    operatingAirline: 'WY',
    flightNumber: '850',
    originAirport: 'CGK',
    destAirport: 'MCT',
    departureTimeLocal: '14:55',
    arrivalTimeLocal: '19:35',
    arrivalDayOffset: 0,
    price: 320,
  },
  {
    operatingAirline: 'WY',
    flightNumber: '673',
    originAirport: 'MCT',
    destAirport: 'JED',
    departureTimeLocal: '23:15',
    arrivalTimeLocal: '01:10',
    arrivalDayOffset: 1,
    price: 330,
  },
  // HU via HAK (long layover — see block comment; does not chain cleanly)
  {
    operatingAirline: 'HU',
    flightNumber: '702',
    originAirport: 'CGK',
    destAirport: 'HAK',
    departureTimeLocal: '19:15',
    arrivalTimeLocal: '00:35',
    arrivalDayOffset: 1,
    price: 260,
  },
  {
    operatingAirline: 'HU',
    flightNumber: '7913',
    originAirport: 'HAK',
    destAirport: 'JED',
    departureTimeLocal: '04:30',
    arrivalTimeLocal: '09:30',
    arrivalDayOffset: 0,
    price: 300,
  },
  // SQ via SIN (dossier gives "per schedule" — representative Changi times)
  {
    operatingAirline: 'SQ',
    flightNumber: '957',
    originAirport: 'CGK',
    destAirport: 'SIN',
    departureTimeLocal: '20:15',
    arrivalTimeLocal: '23:05',
    arrivalDayOffset: 0,
    price: 320,
  },
  {
    operatingAirline: 'SQ',
    flightNumber: '182',
    originAirport: 'SIN',
    destAirport: 'JED',
    departureTimeLocal: '01:20',
    arrivalTimeLocal: '05:40',
    arrivalDayOffset: 0,
    price: 380,
  },
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

  // Physical flights with their operating-carrier marketing row. Only a flight
  // with a technical stop gets `flight_legs` rows — legs describe stops, not
  // journeys. Idempotent: upsert the flight by (operating_airline,
  // flight_number), then rewrite its leg + marketing rows — both key off the
  // flight's generated ULID, so a plain re-insert would duplicate them.
  for (const flight of flightSeeds) {
    const flightValues = {
      operatingAirline: flight.operatingAirline,
      flightNumber: flight.flightNumber,
      originAirport: flight.originAirport,
      destAirport: flight.destAirport,
      departureTimeLocal: flight.departureTimeLocal,
      arrivalTimeLocal: flight.arrivalTimeLocal,
      arrivalDayOffset: flight.arrivalDayOffset,
      price: flight.price,
      currency: 'USD',
      status: 'ACTIVE' as const,
    };
    const [row] = await db
      .insert(schema.flights)
      .values(flightValues)
      .onConflictDoUpdate({
        target: [schema.flights.operatingAirline, schema.flights.flightNumber],
        set: flightValues,
      })
      .returning({ id: schema.flights.id });

    // Rewrite legs from scratch: clears any left by an earlier seed run (or by
    // a schema where every flight carried one) before re-inserting.
    await db
      .delete(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, row.id));
    if (flight.legs?.length) {
      await db.insert(schema.flightLegs).values(
        flight.legs.map((leg, index) => ({
          flightId: row.id,
          legSequence: index + 1,
          ...leg,
        })),
      );
    }

    await db
      .delete(schema.flightMarketing)
      .where(eq(schema.flightMarketing.flightId, row.id));
    await db.insert(schema.flightMarketing).values({
      flightId: row.id,
      marketingAirline: flight.operatingAirline,
      marketingNumber: flight.flightNumber,
      isOperatingCarrier: true,
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
    } else {
      await db.insert(schema.travelProvider).values(provider);
    }
  }

  console.log(
    `Seeded ${airports.length} airports, ${airlines.length} airlines, ${interlineAgreements.length} interline agreements, ${flightSeeds.length} flights`,
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
