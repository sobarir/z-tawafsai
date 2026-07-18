'use client';

import type { Season } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelSeasonsQueryKey,
  useCreateHotelSeason,
  useDeleteHotelSeason,
  useListHotelProperties,
  useListHotelSeasons,
  useUpdateHotelSeason,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getSeasonColumns } from './columns';
import { SeasonForm } from './season-form';

export function HotelSeasonsAdmin() {
  const t = useTranslations('catalog.seasons');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: seasons, isLoading } = useListHotelSeasons();
  const { data: properties } = useListHotelProperties();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [deleting, setDeleting] = useState<Season | null>(null);

  const feedback = useCrudFeedback(getListHotelSeasonsQueryKey(), 'catalog');

  const createMutation = useCreateHotelSeason({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelSeason({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelSeason({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getSeasonColumns({
        columnLabels: {
          property: t('columns.property'),
          name: t('columns.name'),
          startDate: t('columns.startDate'),
          endDate: t('columns.endDate'),
        },
        properties: properties ?? [],
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (season) => {
          setEditing(season);
          setFormOpen(true);
        },
        onDelete: (season) => setDeleting(season),
      }),
    [t, properties, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={seasons ?? []}
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
        <SeasonForm
          season={editing ?? undefined}
          properties={properties ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  name: values.name,
                  startDate: values.startDate,
                  endDate: values.endDate,
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
        name={deleting?.name ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
