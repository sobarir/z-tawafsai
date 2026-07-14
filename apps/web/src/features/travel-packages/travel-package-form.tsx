'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
} from '@repo/shared';
import { createFlightHotelPackageSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Form } from '@/components/ui/form';

interface TravelPackageFormProps {
  travelPackage?: FlightHotelPackage;
  flightOptions: ComboboxOption[];
  propertyOptions: ComboboxOption[];
  currencyOptions: ComboboxOption[];
  onSubmit: (values: CreateFlightHotelPackageInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function TravelPackageForm({
  travelPackage,
  flightOptions,
  propertyOptions,
  currencyOptions,
  onSubmit,
  onCancel,
  submitting,
}: TravelPackageFormProps) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');

  const form = useForm<CreateFlightHotelPackageInput>({
    resolver: zodResolver(createFlightHotelPackageSchema),
    defaultValues: {
      title: travelPackage?.title ?? '',
      description: travelPackage?.description ?? undefined,
      flightId: travelPackage?.flight.id ?? '',
      propertyCode: travelPackage?.property.propertyCode ?? '',
      durationNights: travelPackage?.durationNights ?? 1,
      heroImageUrl: travelPackage?.heroImageUrl ?? undefined,
      price: travelPackage?.price ?? 0,
      currency: travelPackage?.currency ?? '',
      isActive: travelPackage?.isActive ?? true,
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
          name="title"
          label={t('title')}
          placeholder={t('titlePlaceholder')}
        />

        <TextFormField
          control={form.control}
          name="description"
          label={t('description')}
          placeholder={t('descriptionPlaceholder')}
          optional
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="flightId"
            label={t('flight')}
            options={flightOptions}
          />
          <ComboboxFormField
            control={form.control}
            name="propertyCode"
            label={t('property')}
            options={propertyOptions}
          />
        </div>

        <TextFormField
          control={form.control}
          name="heroImageUrl"
          label={t('heroImageUrl')}
          placeholder={t('heroImageUrlPlaceholder')}
          optional
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberFormField
            control={form.control}
            name="durationNights"
            label={t('durationNights')}
          />
          <NumberFormField
            control={form.control}
            name="price"
            label={t('price')}
            step="any"
          />
          <ComboboxFormField
            control={form.control}
            name="currency"
            label={t('currency')}
            options={currencyOptions}
          />
        </div>

        <CheckboxFormField
          control={form.control}
          name="isActive"
          label={t('isActive')}
          id="travel-package-is-active"
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
