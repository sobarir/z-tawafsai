'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airline, Airport, CreateFlightInput, Flight } from '@repo/shared';
import { createFlightSchema } from '@repo/shared';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type Resolver, useFieldArray, useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toAirlineOptions, toAirportOptions } from '@/libs/combobox-options';
import { FlightPriceFields } from './flight-price-fields';

/** Blank form state for the create flow. */
export const emptyFlightFormValues: CreateFlightInput = {
  operatingAirline: '',
  flightNumber: '',
  originAirport: '',
  destAirport: '',
  departureTimeLocal: '',
  arrivalTimeLocal: '',
  arrivalDayOffset: 0,
  aircraftType: undefined,
  status: 'ACTIVE',
  price: 0,
  currency: 'USD',
  legs: undefined,
};

/**
 * Turn an existing flight into editable form values. A nonstop flight keeps
 * `legs` undefined (the multi-leg editor stays collapsed and the server stores
 * no legs); a technical-stop flight seeds the leg editor.
 */
export function flightToFormValues(flight: Flight): CreateFlightInput {
  const isMultiLeg = flight.legs.length > 0;
  return {
    operatingAirline: flight.operatingAirline,
    flightNumber: flight.flightNumber,
    originAirport: flight.originAirport,
    destAirport: flight.destAirport,
    departureTimeLocal: flight.departureTimeLocal,
    arrivalTimeLocal: flight.arrivalTimeLocal,
    arrivalDayOffset: flight.arrivalDayOffset,
    aircraftType: flight.aircraftType ?? undefined,
    status: flight.status,
    price: flight.price,
    currency: flight.currency,
    legs: isMultiLeg
      ? flight.legs.map((leg) => ({
          depAirport: leg.depAirport,
          arrAirport: leg.arrAirport,
          departureTimeLocal: leg.departureTimeLocal,
          arrivalTimeLocal: leg.arrivalTimeLocal,
          departureDayOffset: leg.departureDayOffset,
          arrivalDayOffset: leg.arrivalDayOffset,
        }))
      : undefined,
  };
}

// zodResolver infers the schema's *input* type (arrivalDayOffset optional,
// legs pre-.min(2)), which doesn't unify with useForm's *output*
// CreateFlightInput. Assert the concrete resolver type — sound at runtime,
// and typed (not `any`).
const schemaResolver = zodResolver(
  createFlightSchema,
) as Resolver<CreateFlightInput>;

/**
 * `useFieldArray` materialises `legs` as `[]` even while the multi-leg editor
 * is off, and the schema's `.min(2)` then rejects it — invisibly, because an
 * array-root error has no field of its own to render into, so Save just did
 * nothing. Empty means nonstop here (same as the unchecked toggle), so strip
 * it back to `undefined` before the schema sees it.
 */
const flightResolver: Resolver<CreateFlightInput> = (
  values,
  context,
  options,
) =>
  schemaResolver(
    { ...values, legs: values.legs?.length ? values.legs : undefined },
    context,
    options,
  );

interface FlightFormProps {
  airports: Airport[];
  airlines: Airline[];
  /** `edit` locks the identity keys (operating airline + flight number). */
  mode: 'create' | 'edit';
  defaultValues: CreateFlightInput;
  onSubmit: (values: CreateFlightInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FlightForm({
  airports,
  airlines,
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: FlightFormProps) {
  const t = useTranslations('schedule.flights.fields');
  const tStatus = useTranslations('schedule.flights.status');
  const tCommon = useTranslations('common');

  const airportOptions = toAirportOptions(airports);
  const airlineOptions = toAirlineOptions(airlines);
  const identityLocked = mode === 'edit';

  const form = useForm<CreateFlightInput>({
    resolver: flightResolver,
    defaultValues,
  });

  const legs = useFieldArray({ control: form.control, name: 'legs' });
  const watchedLegs = form.watch('legs') || [];
  const multiLeg = watchedLegs.length > 0;

  const toggleMultiLeg = (checked: boolean) => {
    if (checked) {
      form.setValue('legs', [
        {
          depAirport: '',
          arrAirport: '',
          departureTimeLocal: '',
          arrivalTimeLocal: '',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
        {
          depAirport: '',
          arrAirport: '',
          departureTimeLocal: '',
          arrivalTimeLocal: '',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
      ]);
    } else {
      // undefined (not []) so the schema's `.min(2)` never sees an empty array
      // and a single-leg flight round-trips to the server as "no legs given".
      form.setValue('legs', undefined);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  // The legs array's own errors (as opposed to a single leg field's) belong to
  // no input, so without this they would block Save with nothing on screen.
  const legsError = form.formState.errors.legs?.message;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="legs">Legs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ComboboxFormField
                control={form.control}
                name="operatingAirline"
                label={t('operatingAirline')}
                options={airlineOptions}
                disabled={identityLocked}
              />

              <TextFormField
                control={form.control}
                name="flightNumber"
                label={t('flightNumber')}
                placeholder={t('flightNumberPlaceholder')}
                uppercase
                disabled={identityLocked}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ComboboxFormField
                control={form.control}
                name="originAirport"
                label={t('originAirport')}
                options={airportOptions}
              />

              <ComboboxFormField
                control={form.control}
                name="destAirport"
                label={t('destAirport')}
                options={airportOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="departureTimeLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('departureTime')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="arrivalTimeLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('arrivalTime')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <NumberFormField
                control={form.control}
                name="arrivalDayOffset"
                label={t('arrivalDayOffset')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextFormField
                control={form.control}
                name="aircraftType"
                label={t('aircraftType')}
                placeholder={t('aircraftTypePlaceholder')}
                uppercase
                optional
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('status')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['ACTIVE', 'SUSPENDED', 'SEASONAL'] as const).map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {tStatus(status)}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FlightPriceFields control={form.control} />
          </TabsContent>

          <TabsContent value="legs" className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="multi-leg"
                checked={multiLeg}
                onCheckedChange={(checked) => toggleMultiLeg(checked === true)}
              />
              <Label htmlFor="multi-leg">{t('multiLeg')}</Label>
            </div>

            {legsError ? (
              <p className="text-sm text-destructive">{legsError}</p>
            ) : null}

            {multiLeg ? (
              <div className="flex flex-col gap-4 rounded-md border p-3">
                {legs.fields.map((legField, index) => (
                  <div
                    key={legField.id}
                    className="flex flex-col gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <ComboboxFormField
                        control={form.control}
                        name={`legs.${index}.depAirport`}
                        label={t('legDepAirport')}
                        options={airportOptions}
                      />

                      <ComboboxFormField
                        control={form.control}
                        name={`legs.${index}.arrAirport`}
                        label={t('legArrAirport')}
                        options={airportOptions}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <FormField
                        control={form.control}
                        name={`legs.${index}.departureTimeLocal`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('legDeparture')}</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <NumberFormField
                        control={form.control}
                        name={`legs.${index}.departureDayOffset`}
                        label={t('departureDayOffset')}
                      />

                      <FormField
                        control={form.control}
                        name={`legs.${index}.arrivalTimeLocal`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('legArrival')}</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <NumberFormField
                        control={form.control}
                        name={`legs.${index}.arrivalDayOffset`}
                        label={t('arrivalDayOffset')}
                      />
                    </div>

                    {watchedLegs.length > 2 && (
                      <Button
                        type="button"
                        variant="outlineDestructive"
                        size="sm"
                        className="w-fit"
                        onClick={() => legs.remove(index)}
                      >
                        <Trash2Icon /> {t('removeLeg')}
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() =>
                    legs.append({
                      depAirport: '',
                      arrAirport: '',
                      departureTimeLocal: '',
                      arrivalTimeLocal: '',
                      departureDayOffset: 0,
                      arrivalDayOffset: 0,
                    })
                  }
                >
                  <PlusIcon /> {t('addLeg')}
                </Button>
              </div>
            ) : null}
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
