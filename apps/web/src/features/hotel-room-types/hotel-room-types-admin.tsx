'use client';

import type { RoomType } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelRoomTypesQueryKey,
  useCreateHotelRoomType,
  useDeleteHotelRoomType,
  useListHotelProperties,
  useListHotelRoomTypes,
  useUpdateHotelRoomType,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getRoomTypeColumns } from './columns';
import { RoomTypeForm } from './room-type-form';

export function HotelRoomTypesAdmin() {
  const t = useTranslations('catalog.roomTypes');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: roomTypes, isLoading } = useListHotelRoomTypes();
  const { data: properties } = useListHotelProperties();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoomType | null>(null);
  const [deleting, setDeleting] = useState<RoomType | null>(null);

  const feedback = useCrudFeedback(getListHotelRoomTypesQueryKey(), 'catalog');

  const createMutation = useCreateHotelRoomType({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelRoomType({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelRoomType({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getRoomTypeColumns({
        columnLabels: {
          propertyCode: t('columns.propertyCode'),
          name: t('columns.name'),
          maxOccupancy: t('columns.maxOccupancy'),
        },
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (roomType) => {
          setEditing(roomType);
          setFormOpen(true);
        },
        onDelete: (roomType) => setDeleting(roomType),
      }),
    [t, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={roomTypes ?? []}
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
        <RoomTypeForm
          roomType={editing ?? undefined}
          properties={properties ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  name: values.name,
                  maxOccupancy: values.maxOccupancy,
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
