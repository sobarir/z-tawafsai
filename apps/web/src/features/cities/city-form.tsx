'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { City, CreateCityInput } from '@repo/shared';
import { createCitySchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface CityFormProps {
  city?: City;
  onSubmit: (values: CreateCityInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function CityForm({
  city,
  onSubmit,
  onCancel,
  submitting,
}: CityFormProps) {
  const t = useTranslations('reference.cities.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!city;

  const form = useForm<CreateCityInput>({
    resolver: zodResolver(createCitySchema),
    defaultValues: {
      cityCode: city?.cityCode ?? '',
      name: city?.name ?? '',
      countryCode: city?.countryCode ?? '',
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
            name="cityCode"
            label={t('cityCode')}
            placeholder={t('cityCodePlaceholder')}
            disabled={isEdit}
            uppercase
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
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
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
