'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airline, CreateAirlineInput } from '@repo/shared';
import { createAirlineSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface AirlineFormProps {
  airline?: Airline;
  onSubmit: (values: CreateAirlineInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function AirlineForm({
  airline,
  onSubmit,
  onCancel,
  submitting,
}: AirlineFormProps) {
  const t = useTranslations('schedule.airlines.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!airline;

  const form = useForm<CreateAirlineInput>({
    resolver: zodResolver(createAirlineSchema),
    defaultValues: {
      airlineCode: airline?.airlineCode ?? '',
      icaoCode: airline?.icaoCode ?? undefined,
      name: airline?.name ?? '',
      countryCode: airline?.countryCode ?? '',
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
            name="airlineCode"
            label={t('airlineCode')}
            placeholder={t('airlineCodePlaceholder')}
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

        <TextFormField
          control={form.control}
          name="countryCode"
          label={t('countryCode')}
          placeholder={t('countryCodePlaceholder')}
          uppercase
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
