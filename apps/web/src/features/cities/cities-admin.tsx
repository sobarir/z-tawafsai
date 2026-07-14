'use client';

import type { City } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListCitiesQueryKey,
  useCreateCity,
  useDeleteCity,
  useListCities,
  useUpdateCity,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { CityForm } from './city-form';
import { getCityColumns } from './columns';

export function CitiesAdmin() {
  const t = useTranslations('reference.cities');
  const tReference = useTranslations('reference');
  const tCommon = useTranslations('common');

  const { data: cities, isLoading } = useListCities();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [deleting, setDeleting] = useState<City | null>(null);

  const feedback = useCrudFeedback(getListCitiesQueryKey(), 'reference');

  const createMutation = useCreateCity({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const updateMutation = useUpdateCity({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });

  const deleteMutation = useDeleteCity({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getCityColumns({
        columnLabels: {
          cityCode: t('columns.cityCode'),
          name: t('columns.name'),
          countryCode: t('columns.countryCode'),
        },
        actionsLabel: tReference('actions'),
        openMenuLabel: tReference('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (city) => {
          setEditing(city);
          setFormOpen(true);
        },
        onDelete: (city) => setDeleting(city),
      }),
    [t, tReference, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  const openCreateForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const saveCity: Parameters<typeof CityForm>[0]['onSubmit'] = async (
    values,
  ) => {
    if (!editing) {
      await createMutation.mutateAsync({ data: values });
      return;
    }
    await updateMutation.mutateAsync({
      code: editing.cityCode,
      data: { name: values.name, countryCode: values.countryCode },
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="reference"
        columns={columns}
        data={cities ?? []}
        isLoading={isLoading}
        toolbar={
          <Button type="button" size="sm" onClick={openCreateForm}>
            {tReference('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <CityForm
          city={editing ?? undefined}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={saveCity}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        namespace="reference"
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={deleting?.cityCode ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ code: deleting.cityCode });
        }}
      />
    </div>
  );
}
