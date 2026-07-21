'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  City,
  CreateFlightHotelPackageInput,
  FlightHotelPackage,
  Property,
} from '@repo/shared';
import { createFlightHotelPackageSchema } from '@repo/shared';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  type Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { CheckboxFormField } from '@/components/shared/checkbox-form-field';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { DateFormField } from '@/components/shared/date-form-field';
import { FileUploadFormField } from '@/components/shared/file-upload-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Button } from '@/components/ui/button';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TravelPackageFormProps {
  travelPackage?: FlightHotelPackage;
  flightOptions: ComboboxOption[];
  cityOptions: ComboboxOption[];
  cities: City[];
  properties: Property[];
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
      cityCode: stay.cityCode,
      propertyCode: stay.propertyCode,
      sequence: stay.sequence,
      nights: stay.nights,
    })) ?? [{ cityCode: '', propertyCode: '', sequence: 1, nights: 1 }]
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
      outboundFlightIds: departure.outboundFlights.map((f) => f.id),
      inboundFlightIds: departure.inboundFlights.map((f) => f.id),
      departureDate: departure.departureDate,
      returnDate: departure.returnDate ?? undefined,
      seatsNote: departure.seatsNote ?? undefined,
      totalSeats: departure.totalSeats ?? undefined,
      availableSeats: departure.availableSeats ?? undefined,
      price: departure.price ?? 0,
      currency: departure.currency ?? 'USD',
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
  cityOptions,
  cities,
  properties,
  propertyOptions,
}: {
  control: Control<CreateFlightHotelPackageInput>;
  cityOptions: ComboboxOption[];
  cities: City[];
  properties: Property[];
  propertyOptions: ComboboxOption[];
}) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');
  const stays = useFieldArray({ control, name: 'stays' });
  const watchedStays = useWatch({ control, name: 'stays' }) || [];

  return (
    <>
      <p className="text-xs text-muted-foreground">{t('staysHint')}</p>
      {stays.fields.map((field, index) => {
        const selectedCityCode = watchedStays[index]?.cityCode;
        const selectedCityName = cities.find(
          (c) => c.cityCode === selectedCityCode,
        )?.name;

        let filteredPropertyOptions = propertyOptions;
        if (selectedCityName) {
          const matchingProperties = properties.filter(
            (p) => p.destination === selectedCityName,
          );
          const matchingCodes = new Set(
            matchingProperties.map((p) => p.propertyCode),
          );
          filteredPropertyOptions = propertyOptions.filter((opt) =>
            matchingCodes.has(opt.value),
          );
        }

        return (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[12rem_minmax(12rem,20rem)_8rem_auto] sm:items-end"
          >
            <ComboboxFormField
              control={control}
              name={`stays.${index}.cityCode` as const}
              label={t('stayCity', { fallback: 'City' })}
              options={cityOptions}
            />
            <ComboboxFormField
              control={control}
              name={`stays.${index}.propertyCode` as const}
              label={t('stayProperty')}
              options={filteredPropertyOptions}
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
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          stays.append({
            cityCode: '',
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

// Manages a string[] field (outboundFlightIds / inboundFlightIds) within a
// departure. Renders a fixed 2-slot UI matching the 2-stop-max architecture
// decision. Uses useWatch + setValue on the typed `departures` top-level path
// so no type assertions are needed — RHF can't statically resolve paths with
// runtime indices into primitive arrays, and Controller/FormField would require
// `as any` on the name prop.
const MAX_FLIGHT_SLOTS = 2;

function DepartureFlightPicker({
  departureIndex,
  direction,
  label,
  options,
}: {
  departureIndex: number;
  direction: 'outboundFlightIds' | 'inboundFlightIds';
  label: string;
  options: ComboboxOption[];
}) {
  const { setValue } = useFormContext<CreateFlightHotelPackageInput>();
  const departures = useWatch<CreateFlightHotelPackageInput>({
    name: 'departures',
  }) as CreateFlightHotelPackageInput['departures'];
  const ids = departures?.[departureIndex]?.[direction] ?? [];

  const updateSlot = (slot: number, value: string) => {
    const next = [...ids];
    next[slot] = value;
    // Keep the array compact — remove trailing empty slots
    while (next.length > 0 && !next[next.length - 1]) next.pop();

    const current = departures ?? [];
    const existing = current[departureIndex];
    if (!existing) return;

    const updated: NonNullable<CreateFlightHotelPackageInput['departures']> = [
      ...current.slice(0, departureIndex),
      { ...existing, [direction]: next },
      ...current.slice(departureIndex + 1),
    ];
    setValue('departures', updated, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: MAX_FLIGHT_SLOTS }, (_, slot) => (
        <FormItem key={slot}>
          <FormLabel>
            {label} {slot + 1}
            {slot > 0 ? ' (Optional)' : ''}
          </FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={ids[slot] ?? ''}
              onChange={(v) => updateSlot(slot, v)}
            />
          </FormControl>
        </FormItem>
      ))}
    </div>
  );
}

// Dated group departures with per-departure seat quota. Self-contained (owns its
// field array + labels) so the main form stays within the complexity budget.
function DeparturesFieldset({
  control,
  flightOptions,
  currencyOptions,
}: {
  control: Control<CreateFlightHotelPackageInput>;
  flightOptions: ComboboxOption[];
  currencyOptions: ComboboxOption[];
}) {
  const t = useTranslations('travelPackagesAdmin.travelPackages.fields');
  const tCommon = useTranslations('common');
  const departures = useFieldArray({ control, name: 'departures' });

  return (
    <div className="flex flex-col gap-3">
      {departures.fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-3 border-b border-border/50 pb-4 last:border-0 last:pb-0"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <DepartureFlightPicker
                departureIndex={index}
                direction="outboundFlightIds"
                label={`${t('flight')} (Outbound)`}
                options={flightOptions}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <DepartureFlightPicker
                departureIndex={index}
                direction="inboundFlightIds"
                label={`${t('flight')} (Inbound)`}
                options={flightOptions}
              />
            </div>
            <DateFormField
              control={control}
              name={`departures.${index}.departureDate` as const}
              label={t('departureDate')}
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
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid grid-cols-2 gap-3 min-w-[16rem] flex-1">
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
            <div className="grid grid-cols-2 gap-3 min-w-[16rem] flex-1">
              <NumberFormField
                control={control}
                name={`departures.${index}.price` as const}
                label={t('price')}
                step="any"
              />
              <ComboboxFormField
                control={control}
                name={`departures.${index}.currency` as const}
                label={t('currency')}
                options={currencyOptions}
              />
            </div>
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
            outboundFlightIds: [],
            inboundFlightIds: [],
            departureDate: '',
            returnDate: undefined,
            seatsNote: undefined,
            totalSeats: undefined,
            availableSeats: undefined,
            price: 0,
            currency: '',
          })
        }
      >
        <Plus className="h-4 w-4" /> {t('addDeparture')}
      </Button>
    </div>
  );
}

export function TravelPackageForm({
  travelPackage,
  flightOptions,
  cityOptions,
  cities,
  properties,
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
      departures: values.departures,
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

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden px-1 pt-2">
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

              <NumberFormField
                control={form.control}
                name="durationNights"
                label={t('durationNights')}
              />

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
                currencyOptions={currencyOptions}
              />
            </TabsContent>

            {/* Stays — Makkah + Madinah (and more for Umrah Plus). Nights must
                sum to Duration; the server rejects a mismatch. */}
            <TabsContent value="stays" className="flex flex-col gap-3">
              <StaysFieldset
                control={form.control}
                cityOptions={cityOptions}
                cities={cities}
                properties={properties}
                propertyOptions={propertyOptions}
              />
            </TabsContent>

            {/* Inclusions — included / excluded line items. */}
            <TabsContent value="inclusions" className="flex flex-col gap-3">
              <InclusionsFieldset control={form.control} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="border-t pt-4">
          <FormDialogActions
            cancelLabel={tCommon('cancel')}
            saveLabel={tCommon('save')}
            onCancel={onCancel}
            submitting={submitting}
          />
        </div>
      </form>
    </Form>
  );
}
