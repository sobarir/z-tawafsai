import { Injectable } from '@nestjs/common';
import type { Airport, ConnectionResult, Flight, MctScope } from '@repo/shared';
import { AirportsService } from '../airports/airports.service';
import { FlightsService } from '../flights/flights.service';
import { InterlineAgreementsService } from '../interline-agreements/interline-agreements.service';
import { MctRulesService } from '../mct-rules/mct-rules.service';

/** Whole-journey domestic/international: same country on both ends = domestic. */
const isDomestic = (origin: Airport, dest: Airport): boolean =>
  origin.countryCode === dest.countryCode;

/**
 * Determines the mct_rules scope for a candidate connection, per
 * /prd/flights/13-mct-rules.md §A step 1: domestic/international of the arriving
 * flight's own route, then of the departing flight's own route.
 */
export function resolveScope(
  prevOrigin: Airport,
  prevDest: Airport,
  nextOrigin: Airport,
  nextDest: Airport,
): MctScope {
  const arrivalLetter = isDomestic(prevOrigin, prevDest) ? 'D' : 'I';
  const departureLetter = isDomestic(nextOrigin, nextDest) ? 'D' : 'I';
  return `${arrivalLetter}${departureLetter}` as MctScope;
}

/** TIMESTAMPTZ-safe gap in whole minutes between two ISO instants. */
export function minutesBetween(fromIso: string, toIso: string): number {
  const millis = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.round(millis / 60_000);
}

@Injectable()
export class ConnectionsService {
  constructor(
    private readonly flights: FlightsService,
    private readonly airports: AirportsService,
    private readonly mctRules: MctRulesService,
    private readonly interlineAgreements: InterlineAgreementsService,
  ) {}

  /**
   * The classifier from /prd/flights/13-mct-rules.md §B, in order: transit ->
   * open_jaw -> interline gate -> gap (NEGATIVE_GAP) -> MCT (NO_MCT_RULE /
   * BELOW_MCT) -> connection/stopover.
   */
  async classify(
    prevFlightId: string,
    nextFlightId: string,
  ): Promise<ConnectionResult> {
    const [prev, next] = await Promise.all([
      this.flights.findById(prevFlightId),
      this.flights.findById(nextFlightId),
    ]);

    if (prev.id === next.id) {
      return this.result(prev, next, {
        kind: 'transit',
        gapMinutes: null,
        sameMetroInterAirport: false,
        isInterline: false,
        bagThroughChecked: false,
        appliedMctRuleId: null,
        appliedInterlineId: null,
        reason: 'TRANSIT',
      });
    }

    const [prevDestAirport, nextOriginAirport] = await Promise.all([
      this.airports.findByCode(prev.destAirport),
      this.airports.findByCode(next.originAirport),
    ]);

    if (prevDestAirport.cityCode !== nextOriginAirport.cityCode) {
      return this.result(prev, next, {
        kind: 'open_jaw',
        gapMinutes: null,
        sameMetroInterAirport: false,
        isInterline: false,
        bagThroughChecked: false,
        appliedMctRuleId: null,
        appliedInterlineId: null,
        reason: 'OPEN_JAW',
      });
    }

    const sameMetroInterAirport =
      prevDestAirport.airportCode !== nextOriginAirport.airportCode;

    const interline = await this.interlineAgreements.resolveInterline(
      prev.operatingAirline,
      next.operatingAirline,
    );
    if (!interline.permitted) {
      return this.result(prev, next, {
        kind: 'invalid',
        gapMinutes: null,
        sameMetroInterAirport,
        isInterline: true,
        bagThroughChecked: false,
        appliedMctRuleId: null,
        appliedInterlineId: null,
        reason: 'NO_INTERLINE',
      });
    }
    const isInterline = !interline.online;

    const gapMinutes = minutesBetween(prev.arrivalTime, next.departureTime);
    if (gapMinutes < 0) {
      return this.result(prev, next, {
        kind: 'invalid',
        gapMinutes,
        sameMetroInterAirport,
        isInterline,
        bagThroughChecked: false,
        appliedMctRuleId: null,
        appliedInterlineId: interline.agreementId,
        reason: 'NEGATIVE_GAP',
      });
    }

    const [prevOriginAirport, nextDestAirport] = await Promise.all([
      this.airports.findByCode(prev.originAirport),
      this.airports.findByCode(next.destAirport),
    ]);
    const scope = resolveScope(
      prevOriginAirport,
      prevDestAirport,
      nextOriginAirport,
      nextDestAirport,
    );

    const rule = await this.mctRules.findApplicableRule({
      arrivalAirport: prevDestAirport.airportCode,
      departureAirport: nextOriginAirport.airportCode,
      scope,
      arrivalAirline: prev.operatingAirline,
      departureAirline: next.operatingAirline,
    });

    if (!rule) {
      return this.result(prev, next, {
        kind: 'invalid',
        gapMinutes,
        sameMetroInterAirport,
        isInterline,
        bagThroughChecked: false,
        appliedMctRuleId: null,
        appliedInterlineId: interline.agreementId,
        reason: 'NO_MCT_RULE',
      });
    }

    if (gapMinutes < rule.mctMinutes) {
      return this.result(prev, next, {
        kind: 'invalid',
        gapMinutes,
        sameMetroInterAirport,
        isInterline,
        bagThroughChecked: false,
        appliedMctRuleId: rule.id,
        appliedInterlineId: interline.agreementId,
        reason: 'BELOW_MCT',
      });
    }

    const kind =
      gapMinutes <= rule.maxConnectionMinutes ? 'connection' : 'stopover';
    return this.result(prev, next, {
      kind,
      gapMinutes,
      sameMetroInterAirport,
      isInterline,
      bagThroughChecked: interline.bagThroughChecked,
      appliedMctRuleId: rule.id,
      appliedInterlineId: interline.agreementId,
      reason: kind === 'connection' ? 'CONNECTION' : 'STOPOVER',
    });
  }

  async validateChain(flightIds: string[]): Promise<ConnectionResult[]> {
    const results: ConnectionResult[] = [];
    for (let i = 0; i < flightIds.length - 1; i++) {
      results.push(await this.classify(flightIds[i], flightIds[i + 1]));
    }
    return results;
  }

  private result(
    prev: Flight,
    next: Flight,
    fields: Omit<ConnectionResult, 'prevFlightId' | 'nextFlightId'>,
  ): ConnectionResult {
    return { prevFlightId: prev.id, nextFlightId: next.id, ...fields };
  }
}
