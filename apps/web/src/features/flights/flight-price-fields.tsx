'use client';

import { useTranslations } from 'next-intl';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';

interface FlightPriceFieldsProps<
  TFieldValues extends FieldValues & { price?: number; currency?: string },
> {
  control: Control<TFieldValues>;
}

export function FlightPriceFields<
  TFieldValues extends FieldValues & { price?: number; currency?: string },
>({ control }: FlightPriceFieldsProps<TFieldValues>) {
  const t = useTranslations('schedule.flights.fields');

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <NumberFormField
        control={control}
        name={'price' as Path<TFieldValues>}
        label={t('price')}
        step="0.01"
      />
      <TextFormField
        control={control}
        name={'currency' as Path<TFieldValues>}
        label={t('currency')}
        placeholder={t('currencyPlaceholder')}
        uppercase
      />
    </div>
  );
}
