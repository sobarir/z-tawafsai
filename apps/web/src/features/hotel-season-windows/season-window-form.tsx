'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateSeasonWindowInput,
  Property,
  Season,
  SeasonWindow,
} from '@repo/shared';
import { createSeasonWindowSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { DateFormField } from '@/components/shared/date-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { Form } from '@/components/ui/form';
import { toPropertyOptions, toSeasonOptions } from '@/libs/combobox-options';

interface SeasonWindowFormProps {
  seasonWindow?: SeasonWindow;
  properties: Property[];
  seasons: Season[];
  onSubmit: (values: CreateSeasonWindowInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function SeasonWindowForm({
  seasonWindow,
  properties,
  seasons,
  onSubmit,
  onCancel,
  submitting,
}: SeasonWindowFormProps) {
  const t = useTranslations('catalog.seasonWindows.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!seasonWindow;

  const form = useForm<CreateSeasonWindowInput>({
    resolver: zodResolver(createSeasonWindowSchema),
    defaultValues: {
      propertyCode: seasonWindow?.propertyCode ?? '',
      seasonId: seasonWindow?.seasonId ?? '',
      startDate: seasonWindow?.startDate ?? '',
      endDate: seasonWindow?.endDate ?? '',
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
          name="propertyCode"
          label={t('propertyCode')}
          options={toPropertyOptions(properties)}
          disabled={isEdit}
        />

        <ComboboxFormField
          control={form.control}
          name="seasonId"
          label={t('seasonId')}
          options={toSeasonOptions(seasons)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateFormField
            control={form.control}
            name="startDate"
            label={t('startDate')}
          />
          <DateFormField
            control={form.control}
            name="endDate"
            label={t('endDate')}
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
