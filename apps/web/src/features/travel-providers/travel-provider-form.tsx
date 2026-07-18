'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateTravelProviderInput, TravelProvider } from '@repo/shared';
import { createTravelProviderSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface TravelProviderFormProps {
  provider?: TravelProvider;
  onSubmit: (values: CreateTravelProviderInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function TravelProviderForm({
  provider,
  onSubmit,
  onCancel,
  submitting,
}: TravelProviderFormProps) {
  const t = useTranslations('travelProvidersAdmin.fields');
  const tCommon = useTranslations('common');

  const form = useForm<CreateTravelProviderInput>({
    resolver: zodResolver(createTravelProviderSchema),
    defaultValues: {
      name: provider?.name ?? '',
      licenseNumber: provider?.licenseNumber ?? undefined,
      contactPhone: provider?.contactPhone ?? undefined,
      contactEmail: provider?.contactEmail ?? undefined,
      website: provider?.website ?? undefined,
      isActive: provider?.isActive ?? true,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextFormField
          control={form.control}
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="licenseNumber"
            label={t('licenseNumber')}
            placeholder={t('licenseNumberPlaceholder')}
            optional
          />
          <TextFormField
            control={form.control}
            name="contactPhone"
            label={t('contactPhone')}
            placeholder={t('contactPhonePlaceholder')}
            optional
          />
          <TextFormField
            control={form.control}
            name="contactEmail"
            label={t('contactEmail')}
            placeholder={t('contactEmailPlaceholder')}
            optional
          />
          <TextFormField
            control={form.control}
            name="website"
            label={t('website')}
            placeholder={t('websitePlaceholder')}
            optional
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="isActive"
          label={t('isActive')}
          id="travel-provider-is-active"
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
