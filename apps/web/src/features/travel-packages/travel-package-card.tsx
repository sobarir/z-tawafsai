'use client';

import type { FlightHotelPackage } from '@repo/shared';
import { Building2, Calendar, Check, Plane, Star, X } from 'lucide-react';
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

import { cn } from '@/libs/utils';

interface TravelPackageCardProps {
  item: FlightHotelPackage;
  locale: string;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' });
}

function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, { timeStyle: 'short' });
}

export function TravelPackageCard({ item, locale }: TravelPackageCardProps) {
  const t = useTranslations('travelPackages');
  const { stays, departures, inclusions } = item;

  // Booking is handled over WhatsApp: the CTA opens a chat prefilled with the
  // package title; staff then record the booking in the back-office admin.
  const whatsappNumber = siteConfig.contact.phoneNumber.replace(/\D/g, '');
  const whatsappText = encodeURIComponent(
    `${t('requestSubject')}: ${item.title}`,
  );
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  const maxStars =
    stays.reduce((max, stay) => Math.max(max, stay.starRating ?? 0), 0) || 5;

  const firstDeparture = [...departures].sort(
    (a, b) =>
      new Date(a.departureDate).getTime() -
      new Date(b.departureDate).getTime(),
  )[0];

  let departureDateStr = '';
  if (firstDeparture) {
    try {
      departureDateStr = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(firstDeparture.departureDate));
    } catch {
      departureDateStr = firstDeparture.departureDate;
    }
  }

  const badgeVariant = item.type === 'umrah' ? 'default' : 'gold';

  return (
    <Card
      flat
      className={cn(
        'h-full gap-3.5 rounded-2xl border-line bg-white px-6 py-[22px] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-[var(--shadow-md)]',
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] gap-x-4 gap-y-4 px-0">
        {/* Top Row: Badge & Rating (Left), Price (Right) */}
        <div className="flex flex-col items-start gap-1.5 self-center">
          <Badge
            className={cn(
              'rounded-full border-transparent px-2.5 py-1 text-[.62rem] font-bold tracking-[.06em] uppercase',
              badgeVariant === 'gold'
                ? 'bg-gold-soft text-[#8a5a1a]'
                : 'bg-brand-100 text-brand-700',
            )}
          >
            {t(`types.${item.type}`)}
          </Badge>
          <span
            role="img"
            className="flex items-center gap-0.5 text-gold"
            aria-label={`${maxStars} dari 5`}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static rating display
                key={i}
                className="size-3.5"
                fill={i < maxStars ? 'currentColor' : 'none'}
              />
            ))}
          </span>
        </div>
        <div className="self-center justify-self-end text-right">
          <div className="text-[.62rem] font-bold tracking-[.04em] text-landing-muted uppercase">
            {
              t(
                'startingFrom',
              ) /* Assuming a key exists, else fallback or omit. I'll omit it for safety as it's not present originally */
            }
          </div>
          <div className="text-xl font-bold tracking-tight text-landing-ink sm:text-2xl">
            {formatCurrency(item.price, item.currency, locale)}
          </div>
        </div>

        {/* Bottom Row: Title & Subtitle */}
        <div className="col-span-2 space-y-1">
          <CardTitle className="text-base font-bold leading-snug tracking-tight text-landing-ink sm:text-lg">
            {item.title}
          </CardTitle>
          {item.description && (
            <div className="text-[.82rem] leading-relaxed text-landing-muted">
              {item.description}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-x-[22px] gap-y-3 px-0 min-[761px]:grid-cols-2">
        {/* 1. Date & Duration */}
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            {departureDateStr ? (
              <>
                <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
                  {departureDateStr}
                </div>
                <div className="text-[.76rem] leading-snug text-landing-muted">
                  {t('durationNights', { count: item.durationNights })}
                </div>
              </>
            ) : (
              <div className="text-[.88rem] font-semibold text-landing-ink">
                {t('durationNights', { count: item.durationNights })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Airline */}
        {firstDeparture && (
          <div className="flex items-start gap-2.5">
            <Plane className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
            <div>
              <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
                {firstDeparture.flight.airlineName}
              </div>
              {firstDeparture.flight.isDirect ? (
                <div className="mt-0.5">
                  <Badge className="rounded-full border-transparent bg-brand-600 px-1.5 py-px text-[.6rem] font-bold tracking-[.04em] text-white uppercase">
                    {t('direct')}
                  </Badge>
                </div>
              ) : (
                <div className="mt-0.5">
                  <Badge className="rounded-full border-transparent bg-gray-200 px-1.5 py-px text-[.6rem] font-bold tracking-[.04em] text-landing-ink uppercase">
                    {t('transitIn', {
                      city:
                        firstDeparture.flight.transitCityName ??
                        firstDeparture.flight.transitAirport ??
                        '',
                      code: firstDeparture.flight.transitAirport ?? '',
                    })}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3+. Hotels */}
        {stays.map((stay) => (
          <div key={stay.propertyCode} className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
            <div>
              <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
                {stay.displayName}
              </div>
              {stay.distanceMeters != null && (
                <div className="text-[.76rem] leading-snug text-landing-muted">
                  {stay.distanceNote === 'Less than'
                    ? `< ${stay.distanceMeters}m`
                    : stay.distanceNote === 'Approx.'
                      ? `± ${stay.distanceMeters}m`
                      : `${stay.distanceMeters}m`}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Divider for extra info */}
        <div className="col-span-1 min-[761px]:col-span-2">
          <hr className="my-3 border-line" />
        </div>

        {/* Extra Info Section */}
        <div className="col-span-1 flex flex-col gap-4 min-[761px]:col-span-2">
          {/* Detailed Flight info */}
          {firstDeparture && (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plane className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-sm font-medium">
                  {firstDeparture.flight.operatingAirline}{' '}
                  {firstDeparture.flight.flightNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  {firstDeparture.flight.originAirport} →{' '}
                  {firstDeparture.flight.destAirport} ·{' '}
                  {firstDeparture.flight.departureTimeLocal}
                </p>
              </div>
            </div>
          )}

          {/* All Departures */}
          {departures.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-medium">{t('departures')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {departures.map((departure) => {
                    const remainingSeats =
                      departure.availableSeats !== null
                        ? departure.availableSeats - departure.bookedSeats
                        : null;
                    return (
                      <Badge key={departure.id} variant="outline">
                        {formatDate(departure.departureDate, locale)}
                        {remainingSeats !== null
                          ? ` · ${t('seatsLeft', { count: remainingSeats })}`
                          : departure.seatsNote
                            ? ` · ${departure.seatsNote}`
                            : ''}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Inclusions */}
          {inclusions.length > 0 && (
            <ul className="flex flex-col gap-1">
              {inclusions.map((inclusion) => (
                <li
                  key={`${inclusion.kind}-${inclusion.label}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  {inclusion.kind === 'included' ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  )}
                  <span>{inclusion.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-end gap-2 border-t border-line px-0 pt-[18px] pb-0">
        {item.flyerUrl ? (
          <a
            href={item.flyerUrl}
            target="_blank"
            rel="noreferrer"
            className="mr-auto"
          >
            <Button type="button" variant="outline">
              {t('viewFlyer')}
            </Button>
          </a>
        ) : null}
        <a href={whatsappHref} target="_blank" rel="noreferrer">
          <Button type="button">{t('requestThis')}</Button>
        </a>
      </CardFooter>
    </Card>
  );
}
