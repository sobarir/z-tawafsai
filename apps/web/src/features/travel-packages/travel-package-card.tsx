'use client';

import type { FlightHotelPackage } from '@repo/shared';
import { Hotel, Plane } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/features/site/config';
import { formatCurrency } from '@/libs/format-currency';
import { formatDuration } from '@/libs/format-duration';

interface TravelPackageCardProps {
  item: FlightHotelPackage;
  locale: string;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' });
}

export function TravelPackageCard({ item, locale }: TravelPackageCardProps) {
  const t = useTranslations('travelPackages');
  const { flight, property } = item;

  const requestSubject = encodeURIComponent(
    `${t('requestSubject')}: ${item.title}`,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{item.title}</CardTitle>
        {item.description ? (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plane className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-medium">
              {flight.airlineName} · {flight.operatingAirline}
              {flight.flightNumber}
            </p>
            <p className="text-sm text-muted-foreground">
              {flight.originAirport} → {flight.destAirport} ·{' '}
              {formatDate(flight.departureTime, locale)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(flight.departureTime, flight.arrivalTime)}
            </p>
            <div>
              {flight.isDirect ? (
                <Badge variant="outline">{t('direct')}</Badge>
              ) : (
                <Badge variant="secondary">
                  {t('transitIn', {
                    city: flight.transitCityName ?? flight.transitAirport ?? '',
                    code: flight.transitAirport ?? '',
                  })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hotel className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm font-medium">{property.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {property.destination}
            </p>
            <div>
              <Badge variant="secondary">
                {t('durationNights', { count: item.durationNights })}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-xl font-bold text-primary">
          {formatCurrency(item.price, item.currency, locale)}
        </p>
      </CardContent>

      <CardFooter>
        <a
          href={`mailto:${siteConfig.contact.supportEmail}?subject=${requestSubject}`}
          className="w-fit"
        >
          <Button type="button">{t('requestThis')}</Button>
        </a>
      </CardFooter>
    </Card>
  );
}
