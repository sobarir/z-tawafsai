'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  propertyCode: string;
  query: HotelDetailQuery;
}

export function HotelDetail({ propertyCode, query }: HotelDetailProps) {
  const t = useTranslations('hotelSearch');
  const handleError = useApiErrorToast();

  const { data, error, isFetching, isFetched } = useSearchHotels(
    { ...query, limit: 100 },
    {
      query: {
        enabled: !!query.destination && !!query.checkIn && !!query.checkOut,
      },
    },
  );

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const item = data?.items.find((row) => row.propertyCode === propertyCode);

  if (isFetching) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (isFetched && !item) {
    return (
      <p className="text-sm text-muted-foreground">{t('detailNotFound')}</p>
    );
  }

  if (!item) {
    return null;
  }

  const requestSubject = encodeURIComponent(
    `${t('requestSubject')}: ${item.displayName}`,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-2">
          <p className="text-2xl font-semibold">{item.displayName}</p>
          <p className="text-sm text-muted-foreground">{item.destination}</p>
          {item.starRating ? (
            <Badge variant="outline">{'★'.repeat(item.starRating)}</Badge>
          ) : null}
        </CardContent>
      </Card>

      <PriceBreakdown item={item} />

      <a
        href={`mailto:${siteConfig.contact.supportEmail}?subject=${requestSubject}`}
        className="w-fit"
      >
        <Button type="button">{t('requestThis')}</Button>
      </a>
    </div>
  );
}
