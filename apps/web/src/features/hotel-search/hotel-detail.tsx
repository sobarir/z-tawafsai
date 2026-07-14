'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/features/site/config';
import { useSearchHotels } from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import { PriceBreakdown } from './price-breakdown';

export interface HotelDetailQuery {
  destination: string;
  checkIn: string;
  checkOut: string;
  occupancy: number;
  currency: string;
}

interface HotelDetailProps {
  listingId: string;
  query: HotelDetailQuery;
}

export function HotelDetail({ listingId, query }: HotelDetailProps) {
  const t = useTranslations('hotelSearch');
  const handleError = useApiErrorToast();

  const { data, error, isFetching, isFetched } = useSearchHotels(
    { ...query, kind: 'both', limit: 100 },
    {
      query: {
        enabled: !!query.destination && !!query.checkIn && !!query.checkOut,
      },
    },
  );

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const item = data?.items.find((row) => row.listingId === listingId);

  if (isFetching) {
    return (
      <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
        {t('loading')}
      </p>
    );
  }

  if (isFetched && !item) {
    return (
      <p className="text-sm" style={{ color: 'var(--hs-muted)' }}>
        {t('detailNotFound')}
      </p>
    );
  }

  if (!item) {
    return null;
  }

  const requestSubject = encodeURIComponent(
    `${t('requestSubject')}: ${item.displayName}`,
  );

  return (
    <div className="hotel-search-theme flex flex-col gap-6">
      <div className="hs-card flex flex-col gap-2 rounded-lg p-4">
        <p
          className="text-2xl font-semibold"
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
      </div>

      <PriceBreakdown item={item} />

      <a
        href={`mailto:${siteConfig.contact.supportEmail}?subject=${requestSubject}`}
        className="w-fit"
      >
        <Button type="button" className="hs-cta">
          {t('requestThis')}
        </Button>
      </a>
    </div>
  );
}
