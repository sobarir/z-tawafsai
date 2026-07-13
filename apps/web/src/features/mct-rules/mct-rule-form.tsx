'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  Airline,
  Airport,
  CreateMctRuleInput,
  MctRule,
} from '@repo/shared';
import { createMctRuleSchema, mctScopeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
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
import { toAirlineOptions, toAirportOptions } from '@/libs/combobox-options';

interface MctRuleFormProps {
  rule?: MctRule;
  airports: Airport[];
  airlines: Airline[];
  onSubmit: (values: CreateMctRuleInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function MctRuleForm({
  rule,
  airports,
  airlines,
  onSubmit,
  onCancel,
  submitting,
}: MctRuleFormProps) {
  const t = useTranslations('schedule.mctRules.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!rule;

  const airportOptions = toAirportOptions(airports);
  const airlineOptions = toAirlineOptions(airlines);

  const form = useForm<CreateMctRuleInput>({
    resolver: zodResolver(createMctRuleSchema),
    defaultValues: {
      arrivalAirport: rule?.arrivalAirport ?? '',
      departureAirport: rule?.departureAirport ?? '',
      scope: rule?.scope ?? 'DD',
      arrivalAirline: rule?.arrivalAirline ?? undefined,
      departureAirline: rule?.departureAirline ?? undefined,
      arrivalTerminal: rule?.arrivalTerminal ?? undefined,
      departureTerminal: rule?.departureTerminal ?? undefined,
      mctMinutes: rule?.mctMinutes ?? 45,
      maxConnectionMinutes: rule?.maxConnectionMinutes ?? undefined,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="arrivalAirport"
            label={t('arrivalAirport')}
            options={airportOptions}
            disabled={isEdit}
          />

          <ComboboxFormField
            control={form.control}
            name="departureAirport"
            label={t('departureAirport')}
            options={airportOptions}
            disabled={isEdit}
          />
        </div>

        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('scope')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isEdit}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mctScopeSchema.options.map((scope) => (
                    <SelectItem key={scope} value={scope}>
                      {scope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ComboboxFormField
            control={form.control}
            name="arrivalAirline"
            label={t('arrivalAirline')}
            options={airlineOptions}
          />

          <ComboboxFormField
            control={form.control}
            name="departureAirline"
            label={t('departureAirline')}
            options={airlineOptions}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="arrivalTerminal"
            label={t('arrivalTerminal')}
            optional
          />

          <TextFormField
            control={form.control}
            name="departureTerminal"
            label={t('departureTerminal')}
            optional
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberFormField
            control={form.control}
            name="mctMinutes"
            label={t('mctMinutes')}
          />

          <NumberFormField
            control={form.control}
            name="maxConnectionMinutes"
            label={t('maxConnectionMinutes')}
            optional
          />
        </div>

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
