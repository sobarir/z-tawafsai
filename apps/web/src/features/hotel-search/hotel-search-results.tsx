'use client';

import type { HotelSearchResult } from '@repo/shared';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatHotelMoney } from './lib/format-hotel-money';

export interface HotelResultsQuery {
  destination: string;
  checkIn: string;
  checkOut: string;
  occupancy: number;
  currency: string;
}

interface HotelSearchResultsProps {
  results: HotelSearchResult[] | undefined;
  total: number | undefined;
  isFetching: boolean;
  isFetched: boolean;
  query: HotelResultsQuery;
}

type Translate = ReturnType<typeof useTranslations>;

function detailHref(propertyCode: string, query: HotelResultsQuery): string {
  const params = new URLSearchParams({
    destination: query.destination,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    occupancy: String(query.occupancy),
    currency: query.currency,
  });
  return `/hotels/${propertyCode}?${params.toString()}`;
}

function PriceLine({
  item,
  locale,
  t,
}: {
  item: HotelSearchResult;
  locale: string;
  t: Translate;
}) {
  const showNative = item.nativePrice.currency !== item.price.currency;

  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="text-xs text-muted-foreground">
        {formatHotelMoney(item.breakdown.perNight, locale)} ×{' '}
        {item.breakdown.nights}
      </p>
      <p className="text-xl font-bold text-primary">
        {formatHotelMoney(item.price, locale)}
      </p>
      {showNative ? (
        <p className="text-xs text-muted-foreground">
          {formatHotelMoney(item.nativePrice, locale)} · {t('converted')}
        </p>
      ) : null}
    </div>
  );
}

function ResultCard({
  item,
  locale,
  t,
  query,
}: {
  item: HotelSearchResult;
  locale: string;
  t: Translate;
  query: HotelResultsQuery;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-lg font-semibold">{item.displayName}</p>
          <p className="text-sm text-muted-foreground">{item.destination}</p>
          {item.starRating ? (
            <Badge variant="outline">{'★'.repeat(item.starRating)}</Badge>
          ) : null}
          <Link
            href={detailHref(item.propertyCode, query)}
            className="w-fit"
            aria-label={`${t('viewDetails')} — ${item.displayName}`}
          >
            <Button type="button" variant="outline" size="sm">
              {t('viewDetails')}
            </Button>
          </Link>
        </div>
        <PriceLine item={item} locale={locale} t={t} />
      </CardContent>
    </Card>
  );
}

export function HotelSearchResults({
  results,
  total,
  isFetching,
  isFetched,
  query,
}: HotelSearchResultsProps) {
  const t = useTranslations('hotelSearch');
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
        {t('resultsCount', { count: total ?? results.length })}
      </p>
      <div className="flex flex-col gap-3">
        {results.map((item) => (
          <ResultCard
            key={item.propertyCode}
            item={item}
            locale={locale}
            t={t}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}
