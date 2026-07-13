'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Airline, Airport, CreateFlightInput } from '@repo/shared';
import { createFlightSchema, legRoleSchema } from '@repo/shared';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toAirlineOptions, toAirportOptions } from '@/libs/combobox-options';
import { FlightPriceFields } from './flight-price-fields';
import { OffsetDateTimeField } from './offset-date-time-field';

interface FlightCreateFormProps {
  airports: Airport[];
  airlines: Airline[];
  onSubmit: (values: CreateFlightInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FlightCreateForm({
  airports,
  airlines,
  onSubmit,
  onCancel,
  submitting,
}: FlightCreateFormProps) {
  const t = useTranslations('schedule.flights.fields');
  const tStatus = useTranslations('schedule.flights.status');
  const tLegRole = useTranslations('schedule.flights.legRole');
  const tCommon = useTranslations('common');

  const airportOptions = toAirportOptions(airports);
  const airlineOptions = toAirlineOptions(airlines);

  const form = useForm<CreateFlightInput>({
    resolver: zodResolver(createFlightSchema),
    defaultValues: {
      operatingAirline: '',
      flightNumber: '',
      originAirport: '',
      destAirport: '',
      departureTime: '',
      arrivalTime: '',
      aircraftType: undefined,
      status: 'ACTIVE',
      price: 0,
      currency: 'USD',
      legs: undefined,
    },
  });

  const legs = useFieldArray({ control: form.control, name: 'legs' });
  const multiLeg = form.watch('legs') !== undefined;

  const toggleMultiLeg = (checked: boolean) => {
    if (checked) {
      form.setValue('legs', [
        {
          role: 'TECHNICAL_STOP',
          depAirport: '',
          arrAirport: '',
          departureTime: '',
          arrivalTime: '',
        },
        {
          role: 'TECHNICAL_STOP',
          depAirport: '',
          arrAirport: '',
          departureTime: '',
          arrivalTime: '',
        },
      ]);
    } else {
      form.setValue('legs', undefined);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="operatingAirline"
            label={t('operatingAirline')}
            options={airlineOptions}
          />

          <TextFormField
            control={form.control}
            name="flightNumber"
            label={t('flightNumber')}
            placeholder={t('flightNumberPlaceholder')}
            uppercase
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('departureTime')}</FormLabel>
                <FormControl>
                  <OffsetDateTimeField
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arrivalTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('arrivalTime')}</FormLabel>
                <FormControl>
                  <OffsetDateTimeField
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                    control={form.control}
                    name={`legs.${index}.role`}
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

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`legs.${index}.departureTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('legDeparture')}</FormLabel>
                        <FormControl>
                          <OffsetDateTimeField
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`legs.${index}.arrivalTime`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('legArrival')}</FormLabel>
                        <FormControl>
                          <OffsetDateTimeField
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="outlineDestructive"
                  size="sm"
                  className="w-fit"
                  disabled={legs.fields.length <= 2}
                  onClick={() => legs.remove(index)}
                >
                  <Trash2Icon /> {t('removeLeg')}
                </Button>
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
                  departureTime: '',
                  arrivalTime: '',
                })
              }
            >
              <PlusIcon /> {t('addLeg')}
            </Button>
          </div>
        ) : null}

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
