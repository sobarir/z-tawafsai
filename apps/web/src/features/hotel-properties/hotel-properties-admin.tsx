'use client';

import type { Property } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelPropertiesQueryKey,
  useCreateHotelProperty,
  useDeleteHotelProperty,
  useListHotelProperties,
  useUpdateHotelProperty,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getPropertyColumns } from './columns';
import { PropertyForm } from './property-form';

export function HotelPropertiesAdmin() {
  const t = useTranslations('catalog.properties');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: properties, isLoading } = useListHotelProperties();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const feedback = useCrudFeedback(getListHotelPropertiesQueryKey(), 'catalog');

  const createMutation = useCreateHotelProperty({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelProperty({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelProperty({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getPropertyColumns({
        columnLabels: {
          propertyCode: t('columns.propertyCode'),
          displayName: t('columns.displayName'),
          destination: t('columns.destination'),
          countryCode: t('columns.countryCode'),
          starRating: t('columns.starRating'),
          isActive: t('columns.isActive'),
        },
        activeLabel: tCommon('yes'),
        inactiveLabel: tCommon('no'),
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (property) => {
          setEditing(property);
          setFormOpen(true);
        },
        onDelete: (property) => setDeleting(property),
      }),
    [t, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={properties ?? []}
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
        <PropertyForm
          property={editing ?? undefined}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                propertyCode: editing.propertyCode,
                data: {
                  displayName: values.displayName,
                  destination: values.destination,
                  countryCode: values.countryCode,
                  heroImageUrl: values.heroImageUrl,
                  isActive: values.isActive,
                  starRating: values.starRating,
                  address: values.address,
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
        name={deleting?.propertyCode ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting)
            deleteMutation.mutate({ propertyCode: deleting.propertyCode });
        }}
      />
    </div>
  );
}
