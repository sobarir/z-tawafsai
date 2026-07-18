'use client';

import type { Property } from '@repo/shared';
import { propertyTypeSchema } from '@repo/shared';
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
  useListCities,
  useListHotelProperties,
  useUpdateHotelProperty,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { toCityNameOptions } from '@/libs/combobox-options';
import { getPropertyColumns } from './columns';
import { PropertyForm } from './property-form';

export function HotelPropertiesAdmin() {
  const t = useTranslations('catalog.properties');
  const tPropertyType = useTranslations('catalog.properties.types');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: properties, isLoading } = useListHotelProperties();
  const { data: cities } = useListCities();
  const cityNameOptions = useMemo(
    () => toCityNameOptions(cities ?? []),
    [cities],
  );

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
          type: t('columns.type'),
          destination: t('columns.destination'),
          countryCode: t('columns.countryCode'),
          starRating: t('columns.starRating'),
          distance: t('columns.distance'),
          contact: t('columns.contact'),
          isActive: t('columns.isActive'),
        },
        typeLabels: Object.fromEntries(
          propertyTypeSchema.options.map((type) => [type, tPropertyType(type)]),
        ) as Record<Property['type'], string>,
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
    [t, tPropertyType, tCatalog, tCommon],
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
          cityNameOptions={cityNameOptions}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                propertyCode: editing.propertyCode,
                data: {
                  type: values.type,
                  displayName: values.displayName,
                  destination: values.destination,
                  countryCode: values.countryCode,
                  heroImageUrl: values.heroImageUrl,
                  isActive: values.isActive,
                  starRating: values.starRating,
                  address: values.address,
                  distanceMeters: values.distanceMeters,
                  distanceNote: values.distanceNote,
                  contactPhone: values.contactPhone,
                  contactEmail: values.contactEmail,
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
