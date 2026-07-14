'use client';

import type { FxRate } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelFxRatesQueryKey,
  useCreateHotelFxRate,
  useDeleteHotelFxRate,
  useListHotelCurrencies,
  useListHotelFxRates,
  useUpdateHotelFxRate,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getFxRateColumns } from './columns';
import { FxRateForm } from './fx-rate-form';

export function HotelFxRatesAdmin() {
  const t = useTranslations('reference.fxRates');
  const tReference = useTranslations('reference');
  const tCommon = useTranslations('common');

  const { data: fxRates, isLoading } = useListHotelFxRates();
  const { data: currencies } = useListHotelCurrencies();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FxRate | null>(null);
  const [deleting, setDeleting] = useState<FxRate | null>(null);

  const feedback = useCrudFeedback(getListHotelFxRatesQueryKey(), 'reference');

  const createMutation = useCreateHotelFxRate({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelFxRate({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelFxRate({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getFxRateColumns({
        columnLabels: {
          baseCurrency: t('columns.baseCurrency'),
          quoteCurrency: t('columns.quoteCurrency'),
          ratePpm: t('columns.rate'),
          asOf: t('columns.asOf'),
        },
        actionsLabel: tReference('actions'),
        openMenuLabel: tReference('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (fxRate) => {
          setEditing(fxRate);
          setFormOpen(true);
        },
        onDelete: (fxRate) => setDeleting(fxRate),
      }),
    [t, tReference, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="reference"
        columns={columns}
        data={fxRates ?? []}
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
            {tReference('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <FxRateForm
          fxRate={editing ?? undefined}
          currencies={currencies ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            const ratePpm = Math.round(values.rate * 1_000_000);
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  baseCurrency: values.baseCurrency,
                  quoteCurrency: values.quoteCurrency,
                  ratePpm,
                  asOf: values.asOf,
                },
              });
            } else {
              await createMutation.mutateAsync({
                data: {
                  baseCurrency: values.baseCurrency,
                  quoteCurrency: values.quoteCurrency,
                  ratePpm,
                  asOf: values.asOf,
                },
              });
            }
          }}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        namespace="reference"
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={
          deleting ? `${deleting.baseCurrency}→${deleting.quoteCurrency}` : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
