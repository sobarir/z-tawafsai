'use client';

import type { HotelSearchResult } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { formatHotelMoney } from './lib/format-hotel-money';

interface PriceBreakdownProps {
  item: HotelSearchResult;
}

/**
 * Mirrors the API's `breakdown` exactly (perNight/nights for properties,
 * total always) — no season/band labels, since the response doesn't carry
 * them; this reads what the API actually returns, not an aspirational shape.
 */
export function PriceBreakdown({ item }: PriceBreakdownProps) {
  const t = useTranslations('hotelSearch');
  const locale = useLocale();
  const showNative = item.nativePrice.currency !== item.price.currency;

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        {item.kind === 'property' &&
        item.breakdown.perNight &&
        item.breakdown.nights ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {formatHotelMoney(item.breakdown.perNight, locale)} ×{' '}
              {t('durationNights', { count: item.breakdown.nights })}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('total')}</span>
          <span className="text-2xl font-bold text-primary">
            {formatHotelMoney(item.price, locale)}
          </span>
        </div>
        {showNative ? (
          <p className="text-xs text-muted-foreground">
            {formatHotelMoney(item.nativePrice, locale)} · {t('converted')}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
