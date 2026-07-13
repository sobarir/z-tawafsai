'use client';

import type { Flight } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/libs/format-currency';
import { formatDuration } from '@/libs/format-duration';

interface FlightSearchResultsProps {
  results: Flight[] | undefined;
  isFetching: boolean;
  isFetched: boolean;
}

function StopsBadge({
  flight,
  t,
}: {
  flight: Flight;
  t: ReturnType<typeof useTranslations>;
}) {
  const stopCount = flight.legs.length - 1;

  if (stopCount <= 0) {
    return <Badge variant="outline">{t('direct')}</Badge>;
  }

  const via = flight.legs
    .slice(0, -1)
    .map((leg) => leg.arrAirport)
    .join(', ');

  return (
    <Badge variant="secondary">
      {t('stopsCount', { count: stopCount })} ·{' '}
      {t('viaAirports', { airports: via })}
    </Badge>
  );
}

function LegRoute({ flight }: { flight: Flight }) {
  if (flight.legs.length <= 1) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {flight.legs
        .map(
          (leg) =>
            `${leg.depAirport} ${new Date(leg.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → ${leg.arrAirport} ${new Date(leg.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        )
        .join('  ·  ')}
    </p>
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
        {results.map((flight) => (
          <Card key={flight.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {flight.operatingAirline}
                    {flight.flightNumber} — {flight.originAirport} →{' '}
                    {flight.destAirport}
                  </p>
                  <StopsBadge flight={flight} t={t} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(flight.departureTime).toLocaleString()} —{' '}
                  {new Date(flight.arrivalTime).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('duration')}:{' '}
                  {formatDuration(flight.departureTime, flight.arrivalTime)}
                  {flight.aircraftType
                    ? ` · ${t('aircraft')}: ${flight.aircraftType}`
                    : ''}
                </p>
                <LegRoute flight={flight} />
              </div>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(flight.price, flight.currency, locale)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
