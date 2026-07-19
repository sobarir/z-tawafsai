'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateSeasonInput, Season } from '@repo/shared';
import { createSeasonSchema, seasonNameSchema } from '@repo/shared';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const tSeasonName = useTranslations('catalog.seasons.names');
  const tCommon = useTranslations('common');

  const form = useForm<CreateSeasonInput>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: {
      name: season?.name ?? 'standard',
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
