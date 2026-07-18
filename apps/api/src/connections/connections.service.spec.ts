import { createDb, schema } from '@repo/db';
import type { Airport } from '@repo/shared';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { AirportsService } from '../airports/airports.service';
import { FlightsService } from '../flights/flights.service';
import { InterlineAgreementsService } from '../interline-agreements/interline-agreements.service';
import { MctRulesService } from '../mct-rules/mct-rules.service';
import {
  ConnectionsService,
  minutesBetween,
  resolveScope,
} from './connections.service';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}
const db = createDb(databaseUrl);
const flights = new FlightsService(db);
const airports = new AirportsService(db);
const mctRules = new MctRulesService(db);
const interlineAgreements = new InterlineAgreementsService(db);
const connections = new ConnectionsService(
  flights,
  airports,
  mctRules,
  interlineAgreements,
);

async function findFlightId(
  operatingAirline: string,
  flightNumber: string,
  departureTimeIso: string,
): Promise<string> {
  const [row] = await db
    .select({ id: schema.flights.id })
    .from(schema.flights)
    .where(
      and(
        eq(schema.flights.operatingAirline, operatingAirline),
        eq(schema.flights.flightNumber, flightNumber),
        eq(schema.flights.departureTime, new Date(departureTimeIso)),
      ),
    );
  if (!row) {
    throw new Error(
      `seed flight not found: ${operatingAirline}${flightNumber} @ ${departureTimeIso}`,
    );
  }
  return row.id;
}

const testAirport = (overrides: Partial<Airport>): Airport => ({
  airportCode: 'AAA',
  icaoCode: null,
  name: 'Test Airport',
  cityCode: 'AAA',
  countryCode: 'AA',
  timezone: 'UTC',
  latitude: null,
  longitude: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('resolveScope', () => {
  it('DD: both legs domestic', () => {
    const jkt = testAirport({ countryCode: 'ID' });
    const dps = testAirport({ countryCode: 'ID' });
    expect(resolveScope(jkt, dps, dps, jkt)).toBe('DD');
  });

  it('II: both legs international', () => {
    const cgk = testAirport({ countryCode: 'ID' });
    const nrt = testAirport({ countryCode: 'JP' });
    const sin = testAirport({ countryCode: 'SG' });
    expect(resolveScope(cgk, nrt, nrt, sin)).toBe('II');
  });

  it('ID: international arrival, domestic departure', () => {
    const cgk = testAirport({ countryCode: 'ID' });
    const nrt = testAirport({ countryCode: 'JP' });
    const hnd = testAirport({ countryCode: 'JP' });
    expect(resolveScope(cgk, nrt, nrt, hnd)).toBe('ID');
  });

  it('DI: domestic arrival, international departure', () => {
    const nrt = testAirport({ countryCode: 'JP' });
    const hnd = testAirport({ countryCode: 'JP' });
    const lhr = testAirport({ countryCode: 'GB' });
    expect(resolveScope(nrt, hnd, hnd, lhr)).toBe('DI');
  });
});

describe('minutesBetween', () => {
  it('computes a positive gap', () => {
    expect(minutesBetween('2026-06-01T10:00:00Z', '2026-06-01T12:00:00Z')).toBe(
      120,
    );
  });

  it('computes a negative gap', () => {
    expect(minutesBetween('2026-06-01T12:00:00Z', '2026-06-01T11:00:00Z')).toBe(
      -60,
    );
  });
});

describe('ConnectionsService — golden scenarios (prd/flights/14-scenarios.md)', () => {
  const ids: Record<string, string> = {};

  beforeAll(async () => {
    ids.s1p = await findFlightId('NH', '12', '2026-06-01T02:00:00+07:00');
    ids.s1n = await findFlightId('NH', '847', '2026-06-01T12:45:00+09:00');
    ids.s2n = await findFlightId('NH', '847', '2026-06-01T11:15:00+09:00');
    ids.s3p = await findFlightId('QR', '1', '2026-06-01T06:30:00+07:00');
    ids.s3n = await findFlightId('QR', '2', '2026-06-03T09:00:00+03:00');
    ids.s4p = await findFlightId('GA', '5', '2026-05-31T23:00:00+07:00');
    ids.s4n = await findFlightId('GA', '6', '2026-06-01T13:00:00+09:00');
    ids.s5n = await findFlightId('GA', '7', '2026-06-01T11:00:00+09:00');
    ids.s6p = await findFlightId('GA', '1', '2026-05-31T21:00:00+07:00');
    ids.s6n = await findFlightId('AF', '2', '2026-06-01T09:00:00+02:00');
    ids.s7 = await findFlightId('NH', '10', '2026-06-01T01:00:00+07:00');
    ids.s8p = await findFlightId('NH', '20', '2026-06-01T11:15:00+08:00');
    ids.s8n = await findFlightId('NH', '21', '2026-06-01T11:00:00+07:00');
    ids.s9p = await findFlightId('SQ', '10', '2026-06-01T11:30:00+08:00');
    ids.s9n = await findFlightId('SQ', '11', '2026-06-01T16:00:00+08:00');
    ids.s12f1 = await findFlightId('GA', '10', '2026-06-01T05:00:00+07:00');
    ids.s12f2 = await findFlightId('GA', '11', '2026-06-01T14:45:00+09:00');
    ids.s12f3 = await findFlightId('GA', '12', '2026-06-01T20:00:00+09:00');
    ids.s13p = await findFlightId('GA', '100', '2026-06-04T05:00:00+07:00');
    ids.s13n = await findFlightId('GA', '200', '2026-06-04T11:30:00+08:00');
    ids.s14n = await findFlightId('SQ', '300', '2026-06-04T11:30:00+08:00');
    ids.s15n = await findFlightId('AF', '400', '2026-06-04T13:00:00+08:00');
    ids.s16p = await findFlightId('NH', '30', '2026-06-05T01:00:00+07:00');
    ids.s16n = await findFlightId('KL', '800', '2026-06-05T10:30:00+09:00');
    ids.s17p = await findFlightId('QR', '50', '2026-06-02T05:00:00+07:00');
    ids.s17n = await findFlightId('GA', '51', '2026-06-02T11:30:00+03:00');
    ids.s18p = await findFlightId('GA', '874', '2026-06-05T09:00:00+07:00');
    ids.s18n = await findFlightId('SQ', '500', '2026-06-05T19:00:00+09:00');
  });

  it('S1: simple connection (valid)', async () => {
    const result = await connections.classify(ids.s1p, ids.s1n);
    expect(result.kind).toBe('connection');
    expect(result.gapMinutes).toBe(120);
    expect(result.sameMetroInterAirport).toBe(false);
  });

  it('S2: connection too tight (invalid, below MCT)', async () => {
    const result = await connections.classify(ids.s1p, ids.s2n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('BELOW_MCT');
    expect(result.gapMinutes).toBe(30);
  });

  it('S3: stopover (valid, beyond max_connection)', async () => {
    const result = await connections.classify(ids.s3p, ids.s3n);
    expect(result.kind).toBe('stopover');
    expect(result.gapMinutes).toBeCloseTo(2730, 0);
  });

  it('S4: inter-airport connection, valid (NRT->HND)', async () => {
    const result = await connections.classify(ids.s4p, ids.s4n);
    expect(result.kind).toBe('connection');
    expect(result.sameMetroInterAirport).toBe(true);

    const [rule] = await db
      .select()
      .from(schema.mctRules)
      .where(
        and(
          eq(schema.mctRules.arrivalAirport, 'NRT'),
          eq(schema.mctRules.departureAirport, 'HND'),
        ),
      );
    expect(result.appliedMctRuleId).toBe(rule.id);
  });

  it('S5: inter-airport too tight (NRT->HND, invalid)', async () => {
    const result = await connections.classify(ids.s4p, ids.s5n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('BELOW_MCT');
  });

  it('S6: open-jaw (cities do not line up)', async () => {
    const result = await connections.classify(ids.s6p, ids.s6n);
    expect(result.kind).toBe('open_jaw');
    expect(result.gapMinutes).toBeNull();
  });

  it('S7: transit / technical stop (same operating flight)', async () => {
    const result = await connections.classify(ids.s7, ids.s7);
    expect(result.kind).toBe('transit');
    expect(result.gapMinutes).toBeNull();

    const legRows = await db
      .select()
      .from(schema.flightLegs)
      .where(eq(schema.flightLegs.flightId, ids.s7));
    expect(legRows).toHaveLength(2);
  });

  it('S8: negative gap (guard)', async () => {
    const result = await connections.classify(ids.s8p, ids.s8n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('NEGATIVE_GAP');
    expect(result.gapMinutes).toBe(-60);
  });

  it('S9: no MCT rule at all (guard, never silently pass)', async () => {
    const result = await connections.classify(ids.s9p, ids.s9n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('NO_MCT_RULE');
  });

  it('S11: most-specific rule wins over the default', async () => {
    const result = await connections.classify(ids.s1p, ids.s1n);
    const [specificRule] = await db
      .select()
      .from(schema.mctRules)
      .where(
        and(
          eq(schema.mctRules.arrivalAirport, 'NRT'),
          eq(schema.mctRules.departureAirport, 'NRT'),
          eq(schema.mctRules.arrivalAirline, 'NH'),
        ),
      );
    expect(result.appliedMctRuleId).toBe(specificRule.id);
    expect(specificRule.mctMinutes).toBe(45);
  });

  it('S12: validate-chain over a 3-flight itinerary', async () => {
    const results = await connections.validateChain([
      ids.s12f1,
      ids.s12f2,
      ids.s12f3,
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].kind).toBe('connection');
    expect(results[0].sameMetroInterAirport).toBe(false);
    expect(results[1].kind).toBe('connection');
    expect(results[1].sameMetroInterAirport).toBe(true);
  });

  it('S13: online connection (same operating carrier)', async () => {
    const result = await connections.classify(ids.s13p, ids.s13n);
    expect(result.kind).toBe('connection');
    expect(result.isInterline).toBe(false);
    expect(result.bagThroughChecked).toBe(true);
    expect(result.appliedInterlineId).toBeNull();
  });

  it('S14: interline connection, valid (GA->SQ)', async () => {
    const result = await connections.classify(ids.s13p, ids.s14n);
    expect(result.kind).toBe('connection');
    expect(result.isInterline).toBe(true);
    expect(result.bagThroughChecked).toBe(true);
    expect(result.appliedInterlineId).not.toBeNull();
  });

  it('S15: no interline agreement (invalid, gate before MCT)', async () => {
    const result = await connections.classify(ids.s13p, ids.s15n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('NO_INTERLINE');
    expect(result.gapMinutes).toBeNull();
    expect(result.isInterline).toBe(true);
    expect(result.bagThroughChecked).toBe(false);
  });

  it('S16: interline valid but bags NOT through-checked', async () => {
    const result = await connections.classify(ids.s16p, ids.s16n);
    expect(result.kind).toBe('connection');
    expect(result.isInterline).toBe(true);
    expect(result.bagThroughChecked).toBe(false);
  });

  it('S17: directional agreement is one-way (GA->QR, not QR->GA)', async () => {
    const result = await connections.classify(ids.s17p, ids.s17n);
    expect(result.kind).toBe('invalid');
    expect(result.reason).toBe('NO_INTERLINE');
  });

  it('S18: interline check uses OPERATING carriers, not marketing', async () => {
    const result = await connections.classify(ids.s18p, ids.s18n);
    expect(result.kind).toBe('connection');
    expect(result.isInterline).toBe(true);

    const [agreement] = await db
      .select()
      .from(schema.interlineAgreements)
      .where(
        and(
          eq(schema.interlineAgreements.inboundAirline, 'GA'),
          eq(schema.interlineAgreements.outboundAirline, 'SQ'),
        ),
      );
    expect(result.appliedInterlineId).toBe(agreement.id);
  });
});

function legLabel(flight: {
  operatingAirline: string;
  flightNumber: string;
  originAirport: string;
  destAirport: string;
}): string {
  return `${flight.operatingAirline}${flight.flightNumber} ${flight.originAirport}->${flight.destAirport}`;
}

describe('ConnectionsService.searchItineraries (Umrah-corridor seed data)', () => {
  it('CGK-JED 2026-08-05: 2 directs plus a cheaper one-stop via CAI, sorted by price', async () => {
    const results = await connections.searchItineraries({
      originAirport: 'CGK',
      destAirport: 'JED',
      date: '2026-08-05',
    });

    // All CGK<->JED/MED demo flights are IDR-priced (2026-07-18: the
    // originally-USD carriers were converted at the same rate as the
    // USD->IDR fx_rate seed, 16,300; prd/airline_list.md's 6 additions were
    // always IDR-native).
    expect(results.map((r) => r.flights.map(legLabel))).toEqual([
      ['MS977 CGK->CAI', 'MS653 CAI->JED'],
      ['SV816 CGK->JED'],
      ['GA402 CGK->JED'],
      ['D7812 CGK->KUL', 'D78118 KUL->JED'],
      ['QG990 CGK->JED'],
      ['JT072 CGK->JED'],
      ['ID782 CGK->JED'],
      ['TK62 CGK->IST', 'TK754 IST->JED'],
    ]);
    expect(results.map((r) => r.stopCount)).toEqual([1, 0, 0, 1, 0, 0, 0, 1]);
    expect(results.map((r) => r.totalPrice)).toEqual([
      12_226_000, 12_633_000, 13_122_000, 13_700_000, 14_400_000, 14_650_000,
      15_100_000, 18_250_000,
    ]);
    expect(results[0].connections[0].kind).toBe('connection');
    expect(results[0].currency).toBe('IDR');
  });

  it('CGK-JED 2026-08-08: no direct flight exists, but 6 one-stop itineraries do (the gap this feature fixes)', async () => {
    const results = await connections.searchItineraries({
      originAirport: 'CGK',
      destAirport: 'JED',
      date: '2026-08-08',
    });

    expect(results).toHaveLength(6);
    expect(results.every((r) => r.stopCount === 1)).toBe(true);
    expect(results.every((r) => r.connections[0].kind === 'connection')).toBe(
      true,
    );
    expect(results.map((r) => r.flights.map(legLabel))).toEqual([
      ['6E1975 CGK->BOM', 'AI931 BOM->JED'],
      ['SQ936 CGK->SIN', 'TR2118 SIN->JED'],
      ['MH725 CGK->KUL', 'MH152 KUL->JED'],
      ['EK359 CGK->DXB', 'EK815 DXB->JED'],
      ['EY475 CGK->AUH', 'EY233 AUH->JED'],
      ['QR956 CGK->DOH', 'QR1105 DOH->JED'],
    ]);
    // Sorted by price ascending, and each total equals the sum of its legs.
    for (let i = 1; i < results.length; i++) {
      expect(results[i].totalPrice).toBeGreaterThanOrEqual(
        results[i - 1].totalPrice,
      );
    }
    for (const result of results) {
      const [first, second] = result.flights;
      expect(result.totalPrice).toBe(first.price + second.price);
    }
  });

  it('CGK-MED 2026-08-15: 2 directs plus a one-stop via JED (SV816/GA402 + SV1422)', async () => {
    const results = await connections.searchItineraries({
      originAirport: 'CGK',
      destAirport: 'MED',
      date: '2026-08-15',
    });

    // As above, the IDR-priced additions from prd/airline_list.md sort after
    // the pre-existing USD-priced results (no cross-currency conversion).
    expect(results.map((r) => r.flights.map(legLabel))).toEqual([
      ['SV818 CGK->MED'],
      ['GA404 CGK->MED'],
      ['SV816 CGK->JED', 'SV1422 JED->MED'],
      ['QG992 CGK->MED'],
      ['JT074 CGK->MED'],
      ['ID784 CGK->MED'],
      ['TK62 CGK->IST', 'TK758 IST->MED'],
    ]);
    expect(results[2].stopCount).toBe(1);
  });

  it('excludes a pair that fails the interline gate (S15 fixture: GA100 CGK-SIN + AF400 SIN-CDG)', async () => {
    const results = await connections.searchItineraries({
      originAirport: 'CGK',
      destAirport: 'CDG',
      date: '2026-06-03',
    });

    expect(
      results.some((r) => r.flights.map(legLabel).includes('AF400 SIN->CDG')),
    ).toBe(false);
  });
});
