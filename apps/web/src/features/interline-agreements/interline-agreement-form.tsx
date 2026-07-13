'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airline, CreateInterlineAgreementInput } from '@repo/shared';
import { createInterlineAgreementSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { Form } from '@/components/ui/form';
import { toAirlineOptions } from '@/libs/combobox-options';

interface InterlineAgreementFormProps {
  airlines: Airline[];
  onSubmit: (values: CreateInterlineAgreementInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function InterlineAgreementForm({
  airlines,
  onSubmit,
  onCancel,
  submitting,
}: InterlineAgreementFormProps) {
  const t = useTranslations('schedule.interlineAgreements.fields');
  const tCommon = useTranslations('common');

  const airlineOptions = toAirlineOptions(airlines);

  const form = useForm<CreateInterlineAgreementInput>({
    resolver: zodResolver(createInterlineAgreementSchema),
    defaultValues: {
      inboundAirline: '',
      outboundAirline: '',
      bagThroughChecked: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="inboundAirline"
            label={t('inboundAirline')}
            options={airlineOptions}
          />

          <ComboboxFormField
            control={form.control}
            name="outboundAirline"
            label={t('outboundAirline')}
            options={airlineOptions}
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="bagThroughChecked"
          id="bag-through-checked"
          label={t('bagThroughChecked')}
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
