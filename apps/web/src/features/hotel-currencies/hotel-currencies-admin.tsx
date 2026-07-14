'use client';

import type { Currency } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelCurrenciesQueryKey,
  useCreateHotelCurrency,
  useDeleteHotelCurrency,
  useListHotelCurrencies,
  useUpdateHotelCurrency,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getCurrencyColumns } from './columns';
import { CurrencyForm } from './currency-form';

export function HotelCurrenciesAdmin() {
  const t = useTranslations('catalog.currencies');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: currencies, isLoading } = useListHotelCurrencies();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [deleting, setDeleting] = useState<Currency | null>(null);

  const feedback = useCrudFeedback(getListHotelCurrenciesQueryKey(), 'catalog');

  const createMutation = useCreateHotelCurrency({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelCurrency({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelCurrency({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getCurrencyColumns({
        columnLabels: {
          code: t('columns.code'),
          minorUnit: t('columns.minorUnit'),
          symbol: t('columns.symbol'),
          name: t('columns.name'),
        },
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (currency) => {
          setEditing(currency);
          setFormOpen(true);
        },
        onDelete: (currency) => setDeleting(currency),
      }),
    [t, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={currencies ?? []}
        isLoading={isLoading}
        toolbar={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            {tCatalog('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <CurrencyForm
          currency={editing ?? undefined}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                code: editing.code,
                data: {
                  minorUnit: values.minorUnit,
                  symbol: values.symbol,
                  name: values.name,
                },
              });
            } else {
              await createMutation.mutateAsync({ data: values });
            }
          }}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        namespace="catalog"
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={deleting?.code ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ code: deleting.code });
        }}
      />
    </div>
  );
}
