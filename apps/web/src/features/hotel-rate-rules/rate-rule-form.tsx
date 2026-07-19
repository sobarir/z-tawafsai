'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateRateRuleInput,
  Currency,
  Property,
  RateRule,
  RoomType,
  Season,
} from '@repo/shared';
import { createRateRuleSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { Form } from '@/components/ui/form';
import {
  toCurrencyOptions,
  toPropertyOptions,
  toRoomTypeOptions,
  toSeasonOptions,
} from '@/libs/combobox-options';

interface RateRuleFormProps {
  rateRule?: RateRule;
  properties: Property[];
  seasons: Season[];
  roomTypes: RoomType[];
  currencies: Currency[];
  initialPropertyCode?: string;
  onSubmit: (values: CreateRateRuleInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function RateRuleForm({
  rateRule,
  properties,
  seasons,
  roomTypes,
  currencies,
  initialPropertyCode,
  onSubmit,
  onCancel,
  submitting,
}: RateRuleFormProps) {
  const t = useTranslations('catalog.rateRules.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!rateRule;

  const form = useForm<CreateRateRuleInput>({
    resolver: zodResolver(createRateRuleSchema),
    defaultValues: {
      propertyCode: rateRule?.propertyCode ?? initialPropertyCode ?? '',
      // Undefined (empty) = the Standard, season-less base rate.
      seasonId: rateRule?.seasonId ?? undefined,
      roomTypeId: rateRule?.roomTypeId ?? '',
      minOccupancy: rateRule?.minOccupancy ?? 1,
      maxOccupancy: rateRule?.maxOccupancy ?? 1,
      amount: rateRule?.amount ?? 0,
      currency: rateRule?.currency ?? '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    // Empty season → Standard (season-less) base rate.
    await onSubmit({ ...values, seasonId: values.seasonId || undefined });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <ComboboxFormField
          control={form.control}
          name="propertyCode"
          label={t('propertyCode')}
          options={toPropertyOptions(properties)}
          disabled={isEdit}
        />

        <div className="flex flex-col gap-1">
          <ComboboxFormField
            control={form.control}
            name="seasonId"
            label={t('seasonId')}
            options={toSeasonOptions(seasons)}
            disabled={isEdit}
          />
          <p className="text-xs text-muted-foreground">
            {t('seasonStandardHint')}
          </p>
        </div>

        <ComboboxFormField
          control={form.control}
          name="roomTypeId"
          label={t('roomTypeId')}
          options={toRoomTypeOptions(roomTypes)}
          disabled={isEdit}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberFormField
            control={form.control}
            name="minOccupancy"
            label={t('minOccupancy')}
          />
          <NumberFormField
            control={form.control}
            name="maxOccupancy"
            label={t('maxOccupancy')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberFormField
            control={form.control}
            name="amount"
            label={t('amount')}
          />
          <ComboboxFormField
            control={form.control}
            name="currency"
            label={t('currency')}
            options={toCurrencyOptions(currencies)}
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
