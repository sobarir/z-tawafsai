'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
} from '@repo/shared';
import { createFlightHotelPackageSchema } from '@repo/shared';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type Control, useFieldArray, useForm } from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { DateFormField } from '@/components/shared/date-form-field';
import { FileUploadFormField } from '@/components/shared/file-upload-form-field';
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
  providerOptions: ComboboxOption[];
  onSubmit: (values: CreateFlightHotelPackageInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

type PackageFormValues = CreateFlightHotelPackageInput;

function toStayDefaults(pkg?: FlightHotelPackage): PackageFormValues['stays'] {
  return (
    pkg?.stays.map((stay) => ({
      propertyCode: stay.propertyCode,
      sequence: stay.sequence,
      nights: stay.nights,
    })) ?? [{ propertyCode: '', sequence: 1, nights: 1 }]
  );
}

function toDepartureDefaults(
  pkg?: FlightHotelPackage,
): PackageFormValues['departures'] {
  // Preserve the id so the server upserts (keeping this departure's bookings)
  // instead of deleting + reinserting on save.
  return (
    pkg?.departures.map((departure) => ({
      id: departure.id,
      flightId: departure.flight.id,
      returnDate: departure.returnDate ?? undefined,
      seatsNote: departure.seatsNote ?? undefined,
      totalSeats: departure.totalSeats ?? undefined,
      availableSeats: departure.availableSeats ?? undefined,
    })) ?? []
  );
}

function toInclusionDefaults(
  pkg?: FlightHotelPackage,
): PackageFormValues['inclusions'] {
  return (
    pkg?.inclusions.map((inclusion) => ({
      kind: inclusion.kind,
      label: inclusion.label,
    })) ?? []
  );
}

function toFormDefaults(travelPackage?: FlightHotelPackage): PackageFormValues {
  return {
    type: travelPackage?.type ?? 'umrah',
    title: travelPackage?.title ?? '',
    description: travelPackage?.description ?? undefined,
    mealPlan: travelPackage?.mealPlan ?? undefined,
    heroImageUrl: travelPackage?.heroImageUrl ?? undefined,
    flyerUrl: travelPackage?.flyerUrl ?? undefined,
    providerId: travelPackage?.providerId ?? undefined,
    feePerSeat: travelPackage?.feePerSeat ?? undefined,
    durationNights: travelPackage?.durationNights ?? 1,
    price: travelPackage?.price ?? 0,
    currency: travelPackage?.currency ?? '',
    isActive: travelPackage?.isActive ?? true,
    isFeatured: travelPackage?.isFeatured ?? false,
    stays: toStayDefaults(travelPackage),
    departures: toDepartureDefaults(travelPackage),
    inclusions: toInclusionDefaults(travelPackage),
  };
}

// City stays — Makkah + Madinah (and more for Umrah Plus). Nights must sum to
// the package duration; the server rejects a mismatch.
function StaysFieldset({
  control,
  propertyOptions,
}: {
  control: Control<CreateFlightHotelPackageInput>;
  propertyOptions: ComboboxOption[];
}) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');
  const stays = useFieldArray({ control, name: 'stays' });

  return (
    <>
      <p className="text-xs text-muted-foreground">{t('staysHint')}</p>
      {stays.fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(15rem,24rem)_8rem_auto] sm:items-end"
        >
          <ComboboxFormField
            control={control}
            name={`stays.${index}.propertyCode` as const}
            label={t('stayProperty')}
            options={propertyOptions}
          />
          <NumberFormField
            control={control}
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
    </>
  );
}

// Included / excluded line items.
function InclusionsFieldset({
  control,
}: {
  control: Control<CreateFlightHotelPackageInput>;
}) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');
  const inclusions = useFieldArray({ control, name: 'inclusions' });
  const inclusionKindOptions: ComboboxOption[] = [
    { value: 'included', label: t('inclusionIncluded') },
    { value: 'excluded', label: t('inclusionExcluded') },
  ];

  return (
    <>
      {inclusions.fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
        >
          <ComboboxFormField
            control={control}
            name={`inclusions.${index}.kind` as const}
            label={t('inclusionKind')}
            options={inclusionKindOptions}
          />
          <TextFormField
            control={control}
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
        onClick={() => inclusions.append({ kind: 'included', label: '' })}
      >
        <Plus className="h-4 w-4" /> {t('addInclusion')}
      </Button>
    </>
  );
}

// Dated group departures with per-departure seat quota. Self-contained (owns its
// field array + labels) so the main form stays within the complexity budget.
function DeparturesFieldset({
  control,
  flightOptions,
}: {
  control: Control<CreateFlightHotelPackageInput>;
  flightOptions: ComboboxOption[];
}) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');
  const departures = useFieldArray({ control, name: 'departures' });

  return (
    <fieldset className="flex flex-col gap-3 rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">{t('departures')}</legend>
      {departures.fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(15rem,24rem)_11rem_auto] sm:items-end">
            <ComboboxFormField
              control={control}
              name={`departures.${index}.flightId` as const}
              label={t('flight')}
              options={flightOptions}
            />
            <DateFormField
              control={control}
              name={`departures.${index}.returnDate` as const}
              label={t('returnDate')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={tCommon('remove')}
              onClick={() => departures.remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_8rem_1fr] sm:items-end">
            <NumberFormField
              control={control}
              name={`departures.${index}.totalSeats` as const}
              label={t('totalSeats')}
              optional
            />
            <NumberFormField
              control={control}
              name={`departures.${index}.availableSeats` as const}
              label={t('availableSeats')}
              optional
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{t('totalSeatsHint')}</p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          departures.append({
            flightId: '',
            returnDate: undefined,
            seatsNote: undefined,
            totalSeats: undefined,
            availableSeats: undefined,
          })
        }
      >
        <Plus className="h-4 w-4" /> {t('addDeparture')}
      </Button>
    </fieldset>
  );
}

export function TravelPackageForm({
  travelPackage,
  flightOptions,
  propertyOptions,
  currencyOptions,
  providerOptions,
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
  const form = useForm<CreateFlightHotelPackageInput>({
    resolver: zodResolver(createFlightHotelPackageSchema),
    defaultValues: toFormDefaults(travelPackage),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      mealPlan: values.mealPlan || undefined,
      // Empty combobox → no provider (empty string is not a valid ULID).
      providerId: values.providerId || undefined,
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
            <TabsTrigger value="departures">{t('departures')}</TabsTrigger>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ComboboxFormField
                  control={form.control}
                  name="providerId"
                  label={t('provider')}
                  options={providerOptions}
                />
                <NumberFormField
                  control={form.control}
                  name="feePerSeat"
                  label={t('feePerSeat')}
                  step="any"
                  optional
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextFormField
                  control={form.control}
                  name="heroImageUrl"
                  label={t('heroImageUrl')}
                  placeholder={t('heroImageUrlPlaceholder')}
                  optional
                />

                <FileUploadFormField
                  control={form.control}
                  name="flyerUrl"
                  label={t('flyerUrl')}
                />
              </div>

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

              <CheckboxFormField
                control={form.control}
                name="isFeatured"
                label={t('isFeatured')}
                id="travel-package-is-featured"
              />
            </TabsContent>

            <TabsContent value="departures" className="flex flex-col gap-4">
              <DeparturesFieldset
                control={form.control}
                flightOptions={flightOptions}
              />
            </TabsContent>

            {/* Stays — Makkah + Madinah (and more for Umrah Plus). Nights must
                sum to Duration; the server rejects a mismatch. */}
            <TabsContent value="stays" className="flex flex-col gap-3">
              <StaysFieldset
                control={form.control}
                propertyOptions={propertyOptions}
              />
            </TabsContent>

            {/* Inclusions — included / excluded line items. */}
            <TabsContent value="inclusions" className="flex flex-col gap-3">
              <InclusionsFieldset control={form.control} />
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
