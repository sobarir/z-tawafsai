'use client';

import type { HotelSearchResult } from '@repo/shared';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

function detailHref(listingId: string, query: HotelResultsQuery): string {
  const params = new URLSearchParams({
    destination: query.destination,
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    occupancy: String(query.occupancy),
    currency: query.currency,
  });
  return `/hotels/${listingId}?${params.toString()}`;
}

function MizanPriceLine({
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
    <div className="hs-mizan flex flex-col items-end gap-0.5">
      {item.kind === 'property' &&
      item.breakdown.perNight &&
      item.breakdown.nights ? (
        <p className="text-xs" style={{ color: 'var(--hs-muted)' }}>
          {formatHotelMoney(item.breakdown.perNight, locale)} ×{' '}
          {item.breakdown.nights}
        </p>
      ) : null}
      <p
        className="text-xl font-semibold tabular-nums"
        style={{ color: 'var(--hs-ink)', fontFamily: 'var(--hs-font-body)' }}
      >
        {formatHotelMoney(item.price, locale)}
      </p>
      {showNative ? (
        <p className="text-xs" style={{ color: 'var(--hs-muted)' }}>
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
  index,
  query,
}: {
  item: HotelSearchResult;
  locale: string;
  t: Translate;
  index: number;
  query: HotelResultsQuery;
}) {
  return (
    <div
      className="hs-card hs-reveal flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-start sm:justify-between"
      style={{ '--hs-reveal-index': index } as React.CSSProperties}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p
          className="text-lg font-semibold"
          style={{
            color: 'var(--hs-ink)',
            fontFamily: 'var(--hs-font-display)',
          }}
        >
          {item.displayName}
        </p>
        <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
          {item.destination}
        </p>
        {item.kind === 'property' && item.starRating ? (
          <Badge variant="outline">{'★'.repeat(item.starRating)}</Badge>
        ) : null}
        {item.kind === 'package' && item.durationNights ? (
          <Badge variant="secondary">
            {t('durationNights', { count: item.durationNights })}
          </Badge>
        ) : null}
        <Link
          href={detailHref(item.listingId, query)}
          className="w-fit"
          aria-label={`${t('viewDetails')} — ${item.displayName}`}
        >
          <Button type="button" variant="outline" size="sm">
            {t('viewDetails')}
          </Button>
        </Link>
      </div>
      <MizanPriceLine item={item} locale={locale} t={t} />
    </div>
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
    return (
      <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
        {t('loading')}
      </p>
    );
  }

  if (!isFetched) {
    return null;
  }

  if (!results || results.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
        {t('noResults')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
        {t('resultsCount', { count: total ?? results.length })}
      </p>
      <div className="flex flex-col gap-3">
        {results.map((item, index) => (
          <ResultCard
            key={item.listingId}
            item={item}
            locale={locale}
            t={t}
            index={index}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}
