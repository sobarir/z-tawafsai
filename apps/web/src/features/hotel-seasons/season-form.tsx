'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateSeasonInput, Property, Season } from '@repo/shared';
import { createSeasonSchema, seasonNameSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { DateFormField } from '@/components/shared/date-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toPropertyOptions } from '@/libs/combobox-options';

interface SeasonFormProps {
  season?: Season;
  properties: Property[];
  onSubmit: (values: CreateSeasonInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function SeasonForm({
  season,
  properties,
  onSubmit,
  onCancel,
  submitting,
}: SeasonFormProps) {
  const t = useTranslations('catalog.seasons.fields');
  const tSeasonName = useTranslations('catalog.seasons.names');
  const tCommon = useTranslations('common');
  const isEdit = !!season;

  const form = useForm<CreateSeasonInput>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: {
      propertyCode: season?.propertyCode ?? '',
      name: season?.name ?? 'standard',
      startDate: season?.startDate ?? '',
      endDate: season?.endDate ?? '',
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonNameSchema.options.map((name) => (
                      <SelectItem key={name} value={name}>
                        {tSeasonName(name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
