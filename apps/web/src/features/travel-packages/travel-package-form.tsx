'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
} from '@repo/shared';
import { createFlightHotelPackageSchema } from '@repo/shared';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Button } from '@/components/ui/button';
import type { ComboboxOption } from '@/components/ui/combobox';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const typeOptions: ComboboxOption[] = [
    { value: 'umrah', label: t('typeUmrah') },
    { value: 'umrah_plus', label: t('typeUmrahPlus') },
    { value: 'hajj', label: t('typeHajj') },
  ];
  const mealPlanOptions: ComboboxOption[] = [
    { value: 'full_board', label: t('mealFullBoard') },
    { value: 'half_board', label: t('mealHalfBoard') },
    { value: 'room_only', label: t('mealRoomOnly') },
  ];
  const inclusionKindOptions: ComboboxOption[] = [
    { value: 'included', label: t('inclusionIncluded') },
    { value: 'excluded', label: t('inclusionExcluded') },
  ];

  const form = useForm<CreateFlightHotelPackageInput>({
    resolver: zodResolver(createFlightHotelPackageSchema),
    defaultValues: {
      type: travelPackage?.type ?? 'umrah',
      title: travelPackage?.title ?? '',
      description: travelPackage?.description ?? undefined,
      flightId: travelPackage?.flight.id ?? '',
      mealPlan: travelPackage?.mealPlan ?? undefined,
      heroImageUrl: travelPackage?.heroImageUrl ?? undefined,
      durationNights: travelPackage?.durationNights ?? 1,
      price: travelPackage?.price ?? 0,
      currency: travelPackage?.currency ?? '',
      isActive: travelPackage?.isActive ?? true,
      stays: travelPackage?.stays.map((stay) => ({
        propertyCode: stay.propertyCode,
        sequence: stay.sequence,
        nights: stay.nights,
      })) ?? [{ propertyCode: '', sequence: 1, nights: 1 }],
      departures:
        travelPackage?.departures.map((departure) => ({
          departureDate: departure.departureDate,
          returnDate: departure.returnDate ?? undefined,
          seatsNote: departure.seatsNote ?? undefined,
        })) ?? [],
      inclusions:
        travelPackage?.inclusions.map((inclusion) => ({
          kind: inclusion.kind,
          label: inclusion.label,
        })) ?? [],
    },
  });

  const stays = useFieldArray({ control: form.control, name: 'stays' });
  const departures = useFieldArray({
    control: form.control,
    name: 'departures',
  });
  const inclusions = useFieldArray({
    control: form.control,
    name: 'inclusions',
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      mealPlan: values.mealPlan || undefined,
      // Sequence is derived from row order, so it stays correct after adds,
      // removes, or reordering.
      stays: values.stays.map((stay, index) => ({
        ...stay,
        sequence: index + 1,
      })),
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {/* Tabs keep the form within the viewport; react-hook-form retains the
            values of inactive tabs, so validation still covers every field. */}
        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details">{t('tabDetails')}</TabsTrigger>
            <TabsTrigger value="stays">{t('stays')}</TabsTrigger>
            <TabsTrigger value="inclusions">{t('inclusions')}</TabsTrigger>
          </TabsList>

          <div className="max-h-[60vh] overflow-y-auto px-1 pt-2">
            <TabsContent value="details" className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ComboboxFormField
                  control={form.control}
                  name="type"
                  label={t('type')}
                  options={typeOptions}
                />
                <ComboboxFormField
                  control={form.control}
                  name="mealPlan"
                  label={t('mealPlan')}
                  options={mealPlanOptions}
                />
              </div>

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

              <ComboboxFormField
                control={form.control}
                name="flightId"
                label={t('flight')}
                options={flightOptions}
              />

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

              {/* Departures — dated group departures. */}
              <fieldset className="flex flex-col gap-3 rounded-md border p-3">
                <legend className="px-1 text-sm font-medium">
                  {t('departures')}
                </legend>
                {departures.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
                  >
                    <TextFormField
                      control={form.control}
                      name={`departures.${index}.departureDate` as const}
                      label={t('departureDate')}
                      placeholder="2026-08-05"
                    />
                    <TextFormField
                      control={form.control}
                      name={`departures.${index}.returnDate` as const}
                      label={t('returnDate')}
                      placeholder="2026-08-13"
                      optional
                    />
                    <TextFormField
                      control={form.control}
                      name={`departures.${index}.seatsNote` as const}
                      label={t('seatsNote')}
                      placeholder={t('seatsNotePlaceholder')}
                      optional
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={tCommon('remove')}
                      onClick={() => departures.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    departures.append({
                      departureDate: '',
                      returnDate: undefined,
                      seatsNote: undefined,
                    })
                  }
                >
                  <Plus className="h-4 w-4" /> {t('addDeparture')}
                </Button>
              </fieldset>

              <CheckboxFormField
                control={form.control}
                name="isActive"
                label={t('isActive')}
                id="travel-package-is-active"
              />
            </TabsContent>

            {/* Stays — Makkah + Madinah (and more for Umrah Plus). Nights must
                sum to Duration; the server rejects a mismatch. */}
            <TabsContent value="stays" className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">{t('staysHint')}</p>
              {stays.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
                >
                  <ComboboxFormField
                    control={form.control}
                    name={`stays.${index}.propertyCode` as const}
                    label={t('stayProperty')}
                    options={propertyOptions}
                  />
                  <NumberFormField
                    control={form.control}
                    name={`stays.${index}.nights` as const}
                    label={t('stayNights')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={tCommon('remove')}
                    disabled={stays.fields.length <= 1}
                    onClick={() => stays.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  stays.append({
                    propertyCode: '',
                    sequence: stays.fields.length + 1,
                    nights: 1,
                  })
                }
              >
                <Plus className="h-4 w-4" /> {t('addStay')}
              </Button>
            </TabsContent>

            {/* Inclusions — included / excluded line items. */}
            <TabsContent value="inclusions" className="flex flex-col gap-3">
              {inclusions.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
                >
                  <ComboboxFormField
                    control={form.control}
                    name={`inclusions.${index}.kind` as const}
                    label={t('inclusionKind')}
                    options={inclusionKindOptions}
                  />
                  <TextFormField
                    control={form.control}
                    name={`inclusions.${index}.label` as const}
                    label={t('inclusionLabel')}
                    placeholder={t('inclusionLabelPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={tCommon('remove')}
                    onClick={() => inclusions.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  inclusions.append({ kind: 'included', label: '' })
                }
              >
                <Plus className="h-4 w-4" /> {t('addInclusion')}
              </Button>
            </TabsContent>
          </div>
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
