'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateRoomTypeInput, Property, RoomType } from '@repo/shared';
import { createRoomTypeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { ComboboxFormField } from '@/components/shared/combobox-form-field';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';
import { toPropertyOptions } from '@/libs/combobox-options';

interface RoomTypeFormProps {
  roomType?: RoomType;
  properties: Property[];
  onSubmit: (values: CreateRoomTypeInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function RoomTypeForm({
  roomType,
  properties,
  onSubmit,
  onCancel,
  submitting,
}: RoomTypeFormProps) {
  const t = useTranslations('catalog.roomTypes.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!roomType;

  const form = useForm<CreateRoomTypeInput>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
      propertyCode: roomType?.propertyCode ?? '',
      name: roomType?.name ?? '',
      maxOccupancy: roomType?.maxOccupancy ?? 1,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
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
        <TextFormField
          control={form.control}
          name="name"
          label={t('name')}
          placeholder={t('namePlaceholder')}
        />
        <NumberFormField
          control={form.control}
          name="maxOccupancy"
          label={t('maxOccupancy')}
        />

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
