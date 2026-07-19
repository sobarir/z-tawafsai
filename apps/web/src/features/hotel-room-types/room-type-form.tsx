'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateRoomTypeInput, RoomType } from '@repo/shared';
import { createRoomTypeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface RoomTypeFormProps {
  roomType?: RoomType;
  onSubmit: (values: CreateRoomTypeInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function RoomTypeForm({
  roomType,
  onSubmit,
  onCancel,
  submitting,
}: RoomTypeFormProps) {
  const t = useTranslations('catalog.roomTypes.fields');
  const tCommon = useTranslations('common');

  const form = useForm<CreateRoomTypeInput>({
    resolver: zodResolver(createRoomTypeSchema),
    defaultValues: {
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
