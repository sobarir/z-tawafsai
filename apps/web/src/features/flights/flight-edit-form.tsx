'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { Flight, UpdateFlightInput } from '@repo/shared';
import { updateFlightSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { TextFormField } from '@/components/shared/text-form-field';
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
import { FlightPriceFields } from './flight-price-fields';

interface FlightEditFormProps {
  flight: Flight;
  onSubmit: (values: UpdateFlightInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function FlightEditForm({
  flight,
  onSubmit,
  onCancel,
  submitting,
}: FlightEditFormProps) {
  const t = useTranslations('schedule.flights.fields');
  const tStatus = useTranslations('schedule.flights.status');
  const tCommon = useTranslations('common');
  const tNotice = useTranslations('schedule');

  const form = useForm<UpdateFlightInput>({
    resolver: zodResolver(updateFlightSchema),
    defaultValues: {
      aircraftType: flight.aircraftType ?? undefined,
      status: flight.status,
      price: flight.price,
      currency: flight.currency,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-muted-foreground">
          {tNotice('noUpdateNotice')}
        </p>

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

        <FlightPriceFields control={form.control} />

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
