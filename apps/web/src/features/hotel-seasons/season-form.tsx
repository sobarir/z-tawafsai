'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateSeasonInput, Season } from '@repo/shared';
import { createSeasonSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface SeasonFormProps {
  season?: Season;
  onSubmit: (values: CreateSeasonInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function SeasonForm({
  season,
  onSubmit,
  onCancel,
  submitting,
}: SeasonFormProps) {
  const t = useTranslations('catalog.seasons.fields');
  const tCommon = useTranslations('common');

  const form = useForm<CreateSeasonInput>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: {
      name: season?.name ?? '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Summer Holiday 2026" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
