'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCurrencyInput, Currency } from '@repo/shared';
import { createCurrencySchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { FormDialogActions } from '@/components/shared/form-dialog-actions';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Form } from '@/components/ui/form';

interface CurrencyFormProps {
  currency?: Currency;
  onSubmit: (values: CreateCurrencyInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function CurrencyForm({
  currency,
  onSubmit,
  onCancel,
  submitting,
}: CurrencyFormProps) {
  const t = useTranslations('reference.currencies.fields');
  const tCommon = useTranslations('common');
  const isEdit = !!currency;

  const form = useForm<CreateCurrencyInput>({
    resolver: zodResolver(createCurrencySchema),
    defaultValues: {
      code: currency?.code ?? '',
      minorUnit: currency?.minorUnit ?? 2,
      symbol: currency?.symbol ?? '',
      name: currency?.name ?? '',
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="code"
            label={t('code')}
            placeholder={t('codePlaceholder')}
            disabled={isEdit}
            uppercase
          />
          <NumberFormField
            control={form.control}
            name="minorUnit"
            label={t('minorUnit')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextFormField
            control={form.control}
            name="symbol"
            label={t('symbol')}
            placeholder={t('symbolPlaceholder')}
          />
          <TextFormField
            control={form.control}
            name="name"
            label={t('name')}
            placeholder={t('namePlaceholder')}
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
