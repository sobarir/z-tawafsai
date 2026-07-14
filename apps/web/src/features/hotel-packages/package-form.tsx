'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreatePackageInput, Package } from '@repo/shared';
import { createPackageSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Form } from '@/components/ui/form';

interface PackageFormProps {
  pkg?: Package;
  cityNameOptions: ComboboxOption[];
  onSubmit: (values: CreatePackageInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function PackageForm({
  pkg,
  cityNameOptions,
  onSubmit,
  onCancel,
  submitting,
}: PackageFormProps) {
  const t = useTranslations('catalog.packages.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!pkg;

  const form = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      packageCode: pkg?.packageCode ?? '',
      displayName: pkg?.displayName ?? '',
      destination: pkg?.destination ?? '',
      countryCode: pkg?.countryCode ?? '',
      heroImageUrl: pkg?.heroImageUrl ?? undefined,
      isActive: pkg?.isActive ?? true,
      durationNights: pkg?.durationNights ?? 1,
      includes: pkg?.includes ?? undefined,
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
            name="packageCode"
            label={t('packageCode')}
            placeholder={t('packageCodePlaceholder')}
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
          <div className="flex flex-col gap-2">
            <ComboboxFormField
              control={form.control}
              name="destination"
              label={t('destination')}
              options={cityNameOptions}
            />
            <p className="text-xs text-muted-foreground">
              {t('destinationHint')}
            </p>
          </div>
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
            name="durationNights"
            label={t('durationNights')}
          />
          <TextFormField
            control={form.control}
            name="includes"
            label={t('includes')}
            placeholder={t('includesPlaceholder')}
            optional
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="isActive"
          label={t('isActive')}
          id="package-is-active"
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
