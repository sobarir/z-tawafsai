'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airline, Airport, CreateFlightInput, Flight } from '@repo/shared';
import { createFlightSchema, legRoleSchema } from '@repo/shared';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';
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
 * Turn an existing flight into editable form values. A single-leg flight keeps
 * `legs` undefined (the multi-leg editor stays collapsed and the server
 * re-derives the one FULL leg); a technical-stop flight seeds the leg editor.
 */
export function flightToFormValues(flight: Flight): CreateFlightInput {
  const isMultiLeg = flight.legs.length > 1;
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
          role: leg.role,
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
  const tLegRole = useTranslations('schedule.flights.legRole');
  const tCommon = useTranslations('common');

  const airportOptions = toAirportOptions(airports);
  const airlineOptions = toAirlineOptions(airlines);
  const identityLocked = mode === 'edit';

  const form = useForm<CreateFlightInput>({
    resolver: async (data, context, options) => {
      const processedData = { ...data };
      if (processedData.legs && processedData.legs.length === 0) {
        processedData.legs = undefined;
      }
      // biome-ignore lint/suspicious/noExplicitAny: RHF resolver generic mismatch with the Zod schema
      const resolver = zodResolver(createFlightSchema) as any;
      return resolver(processedData, context, options);
    },
    defaultValues,
  });

  const legs = useFieldArray({ control: form.control, name: 'legs' });
  const watchedLegs = form.watch('legs') || [];
  const multiLeg = watchedLegs.length > 0;

  const toggleMultiLeg = (checked: boolean) => {
    if (checked) {
      form.setValue('legs', [
        {
          role: 'TECHNICAL_STOP',
          depAirport: '',
          arrAirport: '',
          departureTimeLocal: '',
          arrivalTimeLocal: '',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
        {
          role: 'TECHNICAL_STOP',
          depAirport: '',
          arrAirport: '',
          departureTimeLocal: '',
          arrivalTimeLocal: '',
          departureDayOffset: 0,
          arrivalDayOffset: 0,
        },
      ]);
    } else {
      form.setValue('legs', []);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

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
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="operatingAirline"
                label={t('operatingAirline')}
                options={airlineOptions}
                disabled={identityLocked}
              />

              <TextFormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="flightNumber"
                label={t('flightNumber')}
                placeholder={t('flightNumberPlaceholder')}
                uppercase
                disabled={identityLocked}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ComboboxFormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="originAirport"
                label={t('originAirport')}
                options={airportOptions}
              />

              <ComboboxFormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="destAirport"
                label={t('destAirport')}
                options={airportOptions}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
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
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
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
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="arrivalDayOffset"
                label={t('arrivalDayOffset')}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextFormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
                name="aircraftType"
                label={t('aircraftType')}
                placeholder={t('aircraftTypePlaceholder')}
                uppercase
                optional
              />

              <FormField
                // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                control={form.control as any}
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

            {/* biome-ignore lint/suspicious/noExplicitAny: shared field control generic */}
            <FlightPriceFields control={form.control as any} />
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

            {multiLeg ? (
              <div className="flex flex-col gap-4 rounded-md border p-3">
                {legs.fields.map((legField, index) => (
                  <div
                    key={legField.id}
                    className="flex flex-col gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormField
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.role` as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('legRole')}</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {legRoleSchema.options.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {tLegRole(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ComboboxFormField
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.depAirport` as any}
                        label={t('legDepAirport')}
                        options={airportOptions}
                      />

                      <ComboboxFormField
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.arrAirport` as any}
                        label={t('legArrAirport')}
                        options={airportOptions}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <FormField
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.departureTimeLocal` as any}
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
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.departureDayOffset` as any}
                        label={t('departureDayOffset')}
                      />

                      <FormField
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.arrivalTimeLocal` as any}
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
                        // biome-ignore lint/suspicious/noExplicitAny: shared field control generic
                        control={form.control as any}
                        // biome-ignore lint/suspicious/noExplicitAny: RHF field-array path
                        name={`legs.${index}.arrivalDayOffset` as any}
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
                      role: 'TECHNICAL_STOP',
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
