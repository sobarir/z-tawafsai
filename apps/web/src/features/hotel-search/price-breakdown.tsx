'use client';

import type { HotelSearchResult } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
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
    <div
      className="hs-card flex flex-col gap-2 rounded-lg p-4"
      style={{ fontFamily: 'var(--hs-font-body)' }}
    >
      {item.kind === 'property' &&
      item.breakdown.perNight &&
      item.breakdown.nights ? (
        <div
          className="flex items-center justify-between text-sm"
          style={{ color: 'var(--hs-muted)' }}
        >
          <span>
            {formatHotelMoney(item.breakdown.perNight, locale)} ×{' '}
            {t('durationNights', { count: item.breakdown.nights })}
          </span>
        </div>
      ) : null}
      <div className="hs-mizan flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--hs-muted)' }}>
          {t('total')}
        </span>
        <span
          className="text-2xl font-semibold tabular-nums"
          style={{ color: 'var(--hs-ink)' }}
        >
          {formatHotelMoney(item.price, locale)}
        </span>
      </div>
      {showNative ? (
        <p className="text-xs" style={{ color: 'var(--hs-muted)' }}>
          {formatHotelMoney(item.nativePrice, locale)} · {t('converted')}
        </p>
      ) : null}
    </div>
  );
}
