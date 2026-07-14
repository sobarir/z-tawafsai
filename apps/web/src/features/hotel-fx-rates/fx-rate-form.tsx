'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Currency, FxRate } from '@repo/shared';
import { currencyCodeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { DateTimeFormField } from '@/components/shared/date-time-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { Form } from '@/components/ui/form';
import { toCurrencyOptions } from '@/libs/combobox-options';

// The API stores rate x 1_000_000 (rate_ppm); the form works in a plain
// decimal rate and converts at the boundary — nobody should type "4350000000".
const fxRateFormSchema = z.object({
  baseCurrency: currencyCodeSchema,
  quoteCurrency: currencyCodeSchema,
  rate: z.number().positive(),
  asOf: z.iso.datetime(),
});
export type FxRateFormValues = z.infer<typeof fxRateFormSchema>;

interface FxRateFormProps {
  fxRate?: FxRate;
  currencies: Currency[];
  onSubmit: (values: FxRateFormValues) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FxRateForm({
  fxRate,
  currencies,
  onSubmit,
  onCancel,
  submitting,
}: FxRateFormProps) {
  const t = useTranslations('reference.fxRates.fields');
  const tCommon = useTranslations('common');

  const form = useForm<FxRateFormValues>({
    resolver: zodResolver(fxRateFormSchema),
    defaultValues: {
      baseCurrency: fxRate?.baseCurrency ?? '',
      quoteCurrency: fxRate?.quoteCurrency ?? '',
      rate: fxRate ? fxRate.ratePpm / 1_000_000 : 0,
      asOf: fxRate?.asOf ?? new Date().toISOString(),
    },
  });

  const currencyOptions = toCurrencyOptions(currencies);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="baseCurrency"
            label={t('baseCurrency')}
            options={currencyOptions}
          />
          <ComboboxFormField
            control={form.control}
            name="quoteCurrency"
            label={t('quoteCurrency')}
            options={currencyOptions}
          />
        </div>

        <NumberFormField
          control={form.control}
          name="rate"
          label={t('rate')}
          step="any"
        />
        <DateTimeFormField
          control={form.control}
          name="asOf"
          label={t('asOf')}
        />

        <FormDialogActions
          cancelLabel={tCommon('cancel')}
          saveLabel={tCommon('save')}
          onCancel={onCancel}
          submitting={submitting}
        />
      </form>
    </Form>
  );
}
