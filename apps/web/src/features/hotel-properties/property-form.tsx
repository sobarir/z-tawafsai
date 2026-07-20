'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreatePropertyInput, Property } from '@repo/shared';
import { createPropertySchema, propertyTypeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import type { ComboboxOption } from '@/components/ui/combobox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PropertyFormProps {
  property?: Property;
  cityNameOptions: ComboboxOption[];
  onSubmit: (values: CreatePropertyInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function PropertyForm({
  property,
  cityNameOptions,
  onSubmit,
  onCancel,
  submitting,
}: PropertyFormProps) {
  const t = useTranslations('catalog.properties.fields');
  const tPropertyType = useTranslations('catalog.properties.types');
  const tCommon = useTranslations('common');
  const isEdit = !!property;

  const form = useForm<CreatePropertyInput>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      type: property?.type ?? 'hotel',
      displayName: property?.displayName ?? '',
      destination: property?.destination ?? '',
      countryCode: property?.countryCode ?? '',
      heroImageUrl: property?.heroImageUrl ?? undefined,
      isActive: property?.isActive ?? true,
      starRating: property?.starRating ?? undefined,
      address: property?.address ?? undefined,
      distanceMeters: property?.distanceMeters ?? undefined,
      distanceNote: property?.distanceNote ?? undefined,
      contactPhone: property?.contactPhone ?? undefined,
      contactEmail: property?.contactEmail ?? undefined,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details">{t('tabDetails', { fallback: 'Details' })}</TabsTrigger>
            <TabsTrigger value="contact">{t('tabContact', { fallback: 'Contact' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex flex-col gap-4 pt-2">
            <div className="grid grid-cols-1 gap-4">
              <TextFormField
                control={form.control}
                name="displayName"
                label={t('displayName')}
                placeholder={t('displayNamePlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypeSchema.options.map((type) => (
                            <SelectItem key={type} value={type}>
                              {tPropertyType(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ComboboxFormField
                control={form.control}
                name="destination"
                label={t('destination')}
                options={cityNameOptions}
              />
              <TextFormField
                control={form.control}
                name="countryCode"
                label={t('countryCode')}
                placeholder={t('countryCodePlaceholder')}
                uppercase
              />
            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[90px_90px_1fr]">
              <FormField
                control={form.control}
                name="starRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('starRating')}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(val) =>
                          field.onChange(val ? Number(val) : undefined)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={String(rating)}>
                              {rating}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <NumberFormField
                control={form.control}
                name="distanceMeters"
                label={t('distanceMeters')}
                description={t('toLandmark')}
                optional
              />
              <TextFormField
                control={form.control}
                name="distanceNote"
                label={t('distanceNote')}
                placeholder={t('distanceNotePlaceholder')}
                optional
              />
            </div>

            <TextFormField
              control={form.control}
              name="heroImageUrl"
              label={t('heroImageUrl')}
              placeholder={t('heroImageUrlPlaceholder')}
              optional
            />

            <CheckboxFormField
              control={form.control}
              name="isActive"
              label={t('isActive')}
              id="property-is-active"
            />
          </TabsContent>

          <TabsContent value="contact" className="flex flex-col gap-4 pt-2">
            <TextFormField
              control={form.control}
              name="address"
              label={t('address')}
              placeholder={t('addressPlaceholder')}
              optional
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </TabsContent>
        </Tabs>

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
