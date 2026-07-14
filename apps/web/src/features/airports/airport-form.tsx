'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airport, CreateAirportInput } from '@repo/shared';
import { createAirportSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Form } from '@/components/ui/form';

interface AirportFormProps {
  airport?: Airport;
  cityOptions: ComboboxOption[];
  onSubmit: (values: CreateAirportInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function AirportForm({
  airport,
  cityOptions,
  onSubmit,
  onCancel,
  submitting,
}: AirportFormProps) {
  const t = useTranslations('schedule.airports.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!airport;

  const form = useForm<CreateAirportInput>({
    resolver: zodResolver(createAirportSchema),
    defaultValues: {
      airportCode: airport?.airportCode ?? '',
      icaoCode: airport?.icaoCode ?? undefined,
      name: airport?.name ?? '',
      cityCode: airport?.cityCode ?? '',
      countryCode: airport?.countryCode ?? '',
      timezone: airport?.timezone ?? '',
      latitude: airport?.latitude ?? undefined,
      longitude: airport?.longitude ?? undefined,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="airportCode"
            label={t('airportCode')}
            placeholder={t('airportCodePlaceholder')}
            disabled={isEdit}
            uppercase
          />

          <TextFormField
            control={form.control}
            name="icaoCode"
            label={t('icaoCode')}
            placeholder={t('icaoCodePlaceholder')}
            uppercase
            optional
          />
        </div>

        <TextFormField
          control={form.control}
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="cityCode"
            label={t('cityCode')}
            options={cityOptions}
          />

          <TextFormField
            control={form.control}
            name="countryCode"
            label={t('countryCode')}
            placeholder={t('countryCodePlaceholder')}
            uppercase
          />
        </div>

        <TextFormField
          control={form.control}
          name="timezone"
          label={t('timezone')}
          placeholder={t('timezonePlaceholder')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberFormField
            control={form.control}
            name="latitude"
            label={t('latitude')}
            step="any"
            optional
          />

          <NumberFormField
            control={form.control}
            name="longitude"
            label={t('longitude')}
            step="any"
            optional
          />
        </div>

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
