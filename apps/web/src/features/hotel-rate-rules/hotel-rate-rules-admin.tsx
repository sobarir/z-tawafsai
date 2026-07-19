'use client';

import type { RateRule } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelRateRulesQueryKey,
  useCreateHotelRateRule,
  useDeleteHotelRateRule,
  useListHotelCurrencies,
  useListHotelProperties,
  useListHotelRateRules,
  useListHotelRoomTypes,
  useListHotelSeasons,
  useUpdateHotelRateRule,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getRateRuleColumns } from './columns';
import { RateRuleForm } from './rate-rule-form';

export function HotelRateRulesAdmin() {
  const t = useTranslations('catalog.rateRules');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: rateRules, isLoading } = useListHotelRateRules();
  const { data: properties } = useListHotelProperties();
  const { data: seasons } = useListHotelSeasons();
  const { data: roomTypes } = useListHotelRoomTypes();
  const { data: currencies } = useListHotelCurrencies();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RateRule | null>(null);
  const [deleting, setDeleting] = useState<RateRule | null>(null);

  const feedback = useCrudFeedback(getListHotelRateRulesQueryKey(), 'catalog');

  const createMutation = useCreateHotelRateRule({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelRateRule({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelRateRule({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getRateRuleColumns({
        columnLabels: {
          property: t('columns.property'),
          season: t('columns.season'),
          roomType: t('columns.roomType'),
          band: t('columns.band'),
          amount: t('columns.amount'),
        },
        standardSeasonLabel: t('standardSeason'),
        properties: properties ?? [],
        seasons: seasons ?? [],
        roomTypes: roomTypes ?? [],
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (rateRule) => {
          setEditing(rateRule);
          setFormOpen(true);
        },
        onDelete: (rateRule) => setDeleting(rateRule),
      }),
    [t, properties, seasons, roomTypes, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={rateRules ?? []}
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
        <RateRuleForm
          rateRule={editing ?? undefined}
          properties={properties ?? []}
          seasons={seasons ?? []}
          roomTypes={roomTypes ?? []}
          currencies={currencies ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  seasonId: values.seasonId,
                  roomTypeId: values.roomTypeId,
                  minOccupancy: values.minOccupancy,
                  maxOccupancy: values.maxOccupancy,
                  amount: values.amount,
                  currency: values.currency,
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
        name={
          deleting ? `${deleting.minOccupancy}-${deleting.maxOccupancy}` : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
