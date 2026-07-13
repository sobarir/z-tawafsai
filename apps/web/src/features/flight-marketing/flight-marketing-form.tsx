'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  Airline,
  CreateFlightMarketingInput,
  Flight,
  FlightMarketing,
} from '@repo/shared';
import { createFlightMarketingSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';
import { toAirlineOptions, toFlightOptions } from '@/libs/combobox-options';

interface FlightMarketingFormProps {
  entry?: FlightMarketing;
  flights: Flight[];
  airlines: Airline[];
  onSubmit: (values: CreateFlightMarketingInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FlightMarketingForm({
  entry,
  flights,
  airlines,
  onSubmit,
  onCancel,
  submitting,
}: FlightMarketingFormProps) {
  const t = useTranslations('schedule.codeshare.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!entry;

  const flightOptions = toFlightOptions(flights);
  const airlineOptions = toAirlineOptions(airlines);

  const form = useForm<CreateFlightMarketingInput>({
    resolver: zodResolver(createFlightMarketingSchema),
    defaultValues: {
      flightId: entry?.flightId ?? '',
      marketingAirline: entry?.marketingAirline ?? '',
      marketingNumber: entry?.marketingNumber ?? '',
      isOperatingCarrier: entry?.isOperatingCarrier ?? false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <ComboboxFormField
          control={form.control}
          name="flightId"
          label={t('flightId')}
          options={flightOptions}
          disabled={isEdit}
          searchPlaceholder={t('flightIdPlaceholder')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="marketingAirline"
            label={t('marketingAirline')}
            options={airlineOptions}
            disabled={isEdit}
          />

          <TextFormField
            control={form.control}
            name="marketingNumber"
            label={t('marketingNumber')}
            placeholder={t('marketingNumberPlaceholder')}
            uppercase
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="isOperatingCarrier"
          id="is-operating-carrier"
          label={t('isOperatingCarrier')}
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
