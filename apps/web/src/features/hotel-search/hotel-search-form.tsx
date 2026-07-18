'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface HotelSearchFormValues {
  destination: string;
  checkIn: string;
  checkOut: string;
  occupancy: number;
  currency: string;
}

const CURRENCIES = ['USD', 'SAR', 'IDR'];

interface HotelSearchFormProps {
  value: HotelSearchFormValues;
  onSubmit: (value: HotelSearchFormValues) => void;
  searching: boolean;
}

/**
 * Fields are edited locally and only committed (navigating the URL) when the
 * user clicks Search — committing on every keystroke would re-render this
 * component from fresh server-parsed searchParams mid-type and clobber
 * whatever the user was typing.
 */
export function HotelSearchForm({
  value,
  onSubmit,
  searching,
}: HotelSearchFormProps) {
  const t = useTranslations('hotelSearch');
  const [local, setLocal] = useState<HotelSearchFormValues>(value);

  const canSearch = !!local.destination && !!local.checkIn && !!local.checkOut;

  const set = <K extends keyof HotelSearchFormValues>(
    key: K,
    fieldValue: HotelSearchFormValues[K],
  ) => setLocal((prev) => ({ ...prev, [key]: fieldValue }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-2 lg:col-span-2">
          <Label htmlFor="hotel-search-destination">{t('destination')}</Label>
          <Input
            id="hotel-search-destination"
            value={local.destination}
            placeholder={t('destinationPlaceholder')}
            onChange={(e) => set('destination', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-search-check-in">{t('checkIn')}</Label>
          <Input
            id="hotel-search-check-in"
            type="date"
            value={local.checkIn}
            onChange={(e) => set('checkIn', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-search-check-out">{t('checkOut')}</Label>
          <Input
            id="hotel-search-check-out"
            type="date"
            value={local.checkOut}
            onChange={(e) => set('checkOut', e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-search-occupancy">{t('occupancy')}</Label>
          <Input
            id="hotel-search-occupancy"
            type="number"
            min={1}
            max={20}
            value={local.occupancy}
            onChange={(e) =>
              set('occupancy', Math.max(1, Number(e.target.value) || 1))
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Label htmlFor="hotel-search-currency">{t('currency')}</Label>
          <Select
            value={local.currency}
            onValueChange={(next) => set('currency', next)}
          >
            <SelectTrigger id="hotel-search-currency" className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          className="w-fit"
          disabled={!canSearch}
          loading={searching}
          onClick={() => onSubmit(local)}
        >
          {t('searchButton')}
        </Button>
      </div>
    </div>
  );
}
