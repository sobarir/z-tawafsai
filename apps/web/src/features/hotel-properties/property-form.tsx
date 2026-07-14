'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreatePropertyInput, Property } from '@repo/shared';
import { createPropertySchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (values: CreatePropertyInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function PropertyForm({
  property,
  onSubmit,
  onCancel,
  submitting,
}: PropertyFormProps) {
  const t = useTranslations('catalog.properties.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!property;

  const form = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      propertyCode: property?.propertyCode ?? '',
      displayName: property?.displayName ?? '',
      destination: property?.destination ?? '',
      countryCode: property?.countryCode ?? '',
      heroImageUrl: property?.heroImageUrl ?? undefined,
      isActive: property?.isActive ?? true,
      starRating: property?.starRating ?? undefined,
      address: property?.address ?? undefined,
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
            name="propertyCode"
            label={t('propertyCode')}
            placeholder={t('propertyCodePlaceholder')}
            disabled={isEdit}
            uppercase
          />
          <TextFormField
            control={form.control}
            name="displayName"
            label={t('displayName')}
            placeholder={t('displayNamePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="destination"
            label={t('destination')}
            placeholder={t('destinationPlaceholder')}
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
          name="heroImageUrl"
          label={t('heroImageUrl')}
          placeholder={t('heroImageUrlPlaceholder')}
          optional
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberFormField
            control={form.control}
            name="starRating"
            label={t('starRating')}
            optional
          />
          <TextFormField
            control={form.control}
            name="address"
            label={t('address')}
            placeholder={t('addressPlaceholder')}
            optional
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="isActive"
          label={t('isActive')}
          id="property-is-active"
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
