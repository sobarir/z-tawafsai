'use client';

import type { SeasonWindow } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelSeasonWindowsQueryKey,
  useCreateHotelSeasonWindow,
  useDeleteHotelSeasonWindow,
  useListHotelProperties,
  useListHotelSeasons,
  useListHotelSeasonWindows,
  useUpdateHotelSeasonWindow,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getSeasonWindowColumns } from './columns';
import { SeasonWindowForm } from './season-window-form';

export function HotelSeasonWindowsAdmin() {
  const t = useTranslations('catalog.seasonWindows');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: seasonWindows, isLoading } = useListHotelSeasonWindows();
  const { data: properties } = useListHotelProperties();
  const { data: seasons } = useListHotelSeasons();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonWindow | null>(null);
  const [deleting, setDeleting] = useState<SeasonWindow | null>(null);

  const feedback = useCrudFeedback(
    getListHotelSeasonWindowsQueryKey(),
    'catalog',
  );

  const createMutation = useCreateHotelSeasonWindow({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelSeasonWindow({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelSeasonWindow({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getSeasonWindowColumns({
        columnLabels: {
          property: t('columns.property'),
          season: t('columns.season'),
          startDate: t('columns.startDate'),
          endDate: t('columns.endDate'),
        },
        properties: properties ?? [],
        seasons: seasons ?? [],
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (window) => {
          setEditing(window);
          setFormOpen(true);
        },
        onDelete: (window) => setDeleting(window),
      }),
    [t, properties, seasons, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={seasonWindows ?? []}
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
        <SeasonWindowForm
          seasonWindow={editing ?? undefined}
          properties={properties ?? []}
          seasons={seasons ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  seasonId: values.seasonId,
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
        name={deleting?.startDate ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
