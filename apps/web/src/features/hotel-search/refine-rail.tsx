'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type HotelSort = 'price_asc' | 'price_desc' | 'name';

export interface RefineRailValue {
  sort: HotelSort;
  minPrice?: number;
  maxPrice?: number;
}

interface RefineRailProps {
  value: RefineRailValue;
  onChange: (value: RefineRailValue) => void;
}

/**
 * Sort applies immediately (a Select fires one discrete change, not one per
 * keystroke). Price bounds are buffered locally and commit on blur — like the
 * search form, committing per-keystroke would re-render this component from
 * fresh searchParams mid-type. Bounds are in the display currency's minor
 * units, matching the API contract (`minPrice`/`maxPrice` in
 * hotelSearchQuerySchema) — they filter the CONVERTED display price, not the
 * rate rule's native amount.
 *
 * On narrow viewports this rail stacks above the results in a single column
 * rather than becoming a bottom sheet. That is a deliberate scope
 * simplification, verified at 360px with no horizontal overflow — the bottom
 * sheet was designed but never built, so treat it as a feature request, not a
 * responsive bug.
 */
export function RefineRail({ value, onChange }: RefineRailProps) {
  const t = useTranslations('hotelSearch');
  const [minPriceText, setMinPriceText] = useState(
    value.minPrice?.toString() ?? '',
  );
  const [maxPriceText, setMaxPriceText] = useState(
    value.maxPrice?.toString() ?? '',
  );

  const commitMinPrice = () =>
    onChange({
      ...value,
      minPrice: minPriceText ? Number(minPriceText) : undefined,
    });
  const commitMaxPrice = () =>
    onChange({
      ...value,
      maxPrice: maxPriceText ? Number(maxPriceText) : undefined,
    });

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-refine-sort">{t('sort')}</Label>
          <Select
            value={value.sort}
            onValueChange={(next) =>
              onChange({ ...value, sort: next as HotelSort })
            }
          >
            <SelectTrigger id="hotel-refine-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">{t('sortPriceAsc')}</SelectItem>
              <SelectItem value="price_desc">{t('sortPriceDesc')}</SelectItem>
              <SelectItem value="name">{t('sortName')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-refine-min-price">{t('minPrice')}</Label>
          <Input
            id="hotel-refine-min-price"
            type="number"
            min={0}
            value={minPriceText}
            onChange={(e) => setMinPriceText(e.target.value)}
            onBlur={commitMinPrice}
            onKeyDown={(e) => e.key === 'Enter' && commitMinPrice()}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-refine-max-price">{t('maxPrice')}</Label>
          <Input
            id="hotel-refine-max-price"
            type="number"
            min={0}
            value={maxPriceText}
            onChange={(e) => setMaxPriceText(e.target.value)}
            onBlur={commitMaxPrice}
            onKeyDown={(e) => e.key === 'Enter' && commitMaxPrice()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
