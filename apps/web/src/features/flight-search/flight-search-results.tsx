'use client';

import type { Flight, FlightItinerary } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/libs/format-currency';
import { formatMinutes } from '@/libs/format-duration';

interface FlightSearchResultsProps {
  results: FlightItinerary[] | undefined;
  isFetching: boolean;
  isFetched: boolean;
}

// Scope the translator type to its namespace. The unparameterized
// `ReturnType<typeof useTranslations>` resolves the union of every message key
// in the app, which TypeScript can push past its instantiation-depth limit as
// the message catalog grows (TS2589).
type Translate = ReturnType<typeof useTranslations<'flightSearch'>>;

function viaAirports(itinerary: FlightItinerary): string[] {
  const airports: string[] = [];
  itinerary.flights.forEach((flight, index) => {
    for (const leg of flight.legs.slice(0, -1)) {
      airports.push(leg.arrAirport);
    }
    if (index < itinerary.flights.length - 1) {
      airports.push(flight.destAirport);
    }
  });
  return airports;
}

function StopsBadge({
  itinerary,
  t,
}: {
  itinerary: FlightItinerary;
  t: Translate;
}) {
  // `stopCount` is already every touchdown in the itinerary — the API sums the
  // technical stops inside each flight and adds one per connection between
  // them. Re-deriving technical stops from `legs` here counted them twice.
  const stops = itinerary.stopCount;

  if (stops <= 0) {
    return <Badge variant="outline">{t('direct')}</Badge>;
  }

  return (
    <Badge variant="secondary">
      {t('stopsCount', { count: stops })} ·{' '}
      {t('viaAirports', { airports: viaAirports(itinerary).join(', ') })}
    </Badge>
  );
}

function TechnicalStopRoute({ flight }: { flight: Flight }) {
  if (flight.legs.length <= 1) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {flight.legs
        .map(
          (leg) =>
            `${leg.depAirport} ${leg.departureTimeLocal} → ${leg.arrAirport} ${leg.arrivalTimeLocal}`,
        )
        .join('  ·  ')}
    </p>
  );
}

function FlightLegSummary({ flight, t }: { flight: Flight; t: Translate }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold">
        {flight.operatingAirline}
        {flight.flightNumber} — {flight.originAirport} → {flight.destAirport}
      </p>
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {flight.departureTimeLocal}
        </span>
        <span className="mx-2 text-muted-foreground">→</span>
        <span className="font-semibold text-foreground">
          {flight.arrivalTimeLocal}
        </span>
      </p>
      {flight.aircraftType && (
        <p className="text-xs text-muted-foreground">
          {t('aircraft')}: {flight.aircraftType}
        </p>
      )}
      <TechnicalStopRoute flight={flight} />
    </div>
  );
}

/** Local "HH:MM" to minutes past midnight. */
function minutesOfDay(localTime: string): number {
  const [hours = 0, minutes = 0] = localTime.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Ground time at the connecting hub. Both times share the hub's timezone, so a
 * plain local-clock diff is exact; wrap past midnight for an overnight layover.
 */
function layoverMinutes(arrivalLocal: string, departureLocal: string): number {
  const diff = minutesOfDay(departureLocal) - minutesOfDay(arrivalLocal);
  return diff < 0 ? diff + 24 * 60 : diff;
}

// A stopover (vs a connection) is DERIVED, never stored: a ground time long
// enough that the hub is a destination in its own right.
const STOPOVER_THRESHOLD_MINUTES = 24 * 60;

function ConnectionRow({
  fromFlight,
  toFlight,
  bagThroughChecked,
  t,
}: {
  fromFlight: Flight;
  toFlight: Flight;
  bagThroughChecked: boolean;
  t: Translate;
}) {
  const airport = fromFlight.destAirport;
  const minutes = layoverMinutes(
    fromFlight.arrivalTimeLocal,
    toFlight.departureTimeLocal,
  );
  const isStopover = minutes >= STOPOVER_THRESHOLD_MINUTES;

  return (
    <div className="flex flex-wrap items-center gap-2 border-muted border-l-2 border-dashed pl-3 text-xs text-muted-foreground">
      <Badge variant="outline">
        {isStopover ? t('stopover') : t('connection')}
      </Badge>
      <span>
        {t('layoverIn', { duration: formatMinutes(minutes), airport })}
      </span>
      {bagThroughChecked && <span>{t('bagThroughChecked')}</span>}
    </div>
  );
}

function ItineraryCard({
  itinerary,
  locale,
  t,
}: {
  itinerary: FlightItinerary;
  locale: string;
  t: Translate;
}) {
  // Online connection (every flight on the same operating carrier) through-checks
  // bags; interline through-check depends on agreement data not carried here.
  const firstAirline = itinerary.flights[0]?.operatingAirline;
  const bagThroughChecked =
    itinerary.flights.length > 1 &&
    itinerary.flights.every((f) => f.operatingAirline === firstAirline);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StopsBadge itinerary={itinerary} t={t} />
            <span className="text-xs text-muted-foreground">
              {t('duration')}: {formatMinutes(itinerary.totalDurationMinutes)}
            </span>
          </div>
          {itinerary.flights.map((flight, index) => {
            const nextFlight = itinerary.flights[index + 1];
            return (
              <div key={flight.id} className="flex flex-col gap-3">
                <FlightLegSummary flight={flight} t={t} />
                {nextFlight && (
                  <ConnectionRow
                    fromFlight={flight}
                    toFlight={nextFlight}
                    bagThroughChecked={bagThroughChecked}
                    t={t}
                  />
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xl font-bold text-primary">
          {formatCurrency(itinerary.totalPrice, itinerary.currency, locale)}
        </p>
      </CardContent>
    </Card>
  );
}

export function FlightSearchResults({
  results,
  isFetching,
  isFetched,
}: FlightSearchResultsProps) {
  const t = useTranslations('flightSearch');
  const locale = useLocale();

  if (isFetching) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (!isFetched) {
    return null;
  }

  if (!results || results.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('noResults')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t('resultsCount', { count: results.length })}
      </p>
      <div className="flex flex-col gap-3">
        {results.map((itinerary) => (
          <ItineraryCard
            key={itinerary.flights.map((flight) => flight.id).join('-')}
            itinerary={itinerary}
            locale={locale}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
