'use client';

import type { Flight, FlightItinerary } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/libs/format-currency';
import { formatDuration } from '@/libs/format-duration';

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

/** Every touchdown in the itinerary: technical stops within a flight, plus connecting hubs between flights. */
function totalStops(itinerary: FlightItinerary): number {
  const technicalStops = itinerary.flights.reduce(
    (sum, flight) => sum + Math.max(flight.legs.length - 1, 0),
    0,
  );
  return itinerary.stopCount + technicalStops;
}

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
  const stops = totalStops(itinerary);

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
      <p className="text-xs text-muted-foreground">
        {t('duration')}:{' '}
        {formatDuration(flight.departureTimeLocal, flight.arrivalTimeLocal)}
        {flight.aircraftType
          ? ` · ${t('aircraft')}: ${flight.aircraftType}`
          : ''}
      </p>
      <TechnicalStopRoute flight={flight} />
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
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StopsBadge itinerary={itinerary} t={t} />
            {itinerary.flights.length > 1 && (
              <span className="text-xs text-muted-foreground">
                {t('duration')}:{' '}
                {formatDuration(itinerary.flights[0]?.departureTimeLocal || '', itinerary.flights[itinerary.flights.length - 1]?.arrivalTimeLocal || '')}
              </span>
            )}
          </div>
          {itinerary.flights.map((flight) => {
            return (
              <div key={flight.id} className="flex flex-col gap-3">
                <FlightLegSummary flight={flight} t={t} />
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
