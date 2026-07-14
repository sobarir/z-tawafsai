'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateRateRuleInput,
  Currency,
  Package,
  Property,
  RateRule,
  RoomType,
  Season,
} from '@repo/shared';
import { createRateRuleSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { Form } from '@/components/ui/form';
import {
  toCurrencyOptions,
  toListingOptions,
  toRoomTypeOptions,
  toSeasonOptions,
} from '@/libs/combobox-options';

/** Sentinel for "no room type" (package rate rules) — Combobox needs a real string value. */
export const NO_ROOM_TYPE = '__none__';

interface RateRuleFormProps {
  rateRule?: RateRule;
  properties: Property[];
  packages: Package[];
  seasons: Season[];
  roomTypes: RoomType[];
  currencies: Currency[];
  onSubmit: (values: CreateRateRuleInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function RateRuleForm({
  rateRule,
  properties,
  packages,
  seasons,
  roomTypes,
  currencies,
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
      listingId: rateRule?.listingId ?? '',
      seasonId: rateRule?.seasonId ?? '',
      roomTypeId: rateRule?.roomTypeId ?? undefined,
      minOccupancy: rateRule?.minOccupancy ?? 1,
      maxOccupancy: rateRule?.maxOccupancy ?? 1,
      amount: rateRule?.amount ?? 0,
      currency: rateRule?.currency ?? '',
    },
  });

  const selectedListingId = useWatch({
    control: form.control,
    name: 'listingId',
  });
  const seasonsForListing = seasons.filter(
    (s) => s.listingId === selectedListingId,
  );

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      roomTypeId:
        values.roomTypeId === NO_ROOM_TYPE ? undefined : values.roomTypeId,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <ComboboxFormField
          control={form.control}
          name="listingId"
          label={t('listingId')}
          options={toListingOptions(properties, packages)}
          disabled={isEdit}
        />

        <ComboboxFormField
          control={form.control}
          name="seasonId"
          label={t('seasonId')}
          options={toSeasonOptions(seasonsForListing)}
          disabled={isEdit || !selectedListingId}
        />

        <ComboboxFormField
          control={form.control}
          name="roomTypeId"
          label={t('roomTypeId')}
          options={[
            { value: NO_ROOM_TYPE, label: t('noRoomType') },
            ...toRoomTypeOptions(roomTypes),
          ]}
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
