'use client';

import type { Package } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelPackagesQueryKey,
  useCreateHotelPackage,
  useDeleteHotelPackage,
  useListHotelPackages,
  useUpdateHotelPackage,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getPackageColumns } from './columns';
import { PackageForm } from './package-form';

export function HotelPackagesAdmin() {
  const t = useTranslations('catalog.packages');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: packages, isLoading } = useListHotelPackages();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState<Package | null>(null);

  const feedback = useCrudFeedback(getListHotelPackagesQueryKey(), 'catalog');

  const createMutation = useCreateHotelPackage({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelPackage({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelPackage({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getPackageColumns({
        columnLabels: {
          packageCode: t('columns.packageCode'),
          displayName: t('columns.displayName'),
          destination: t('columns.destination'),
          countryCode: t('columns.countryCode'),
          durationNights: t('columns.durationNights'),
          isActive: t('columns.isActive'),
        },
        activeLabel: tCommon('yes'),
        inactiveLabel: tCommon('no'),
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (pkg) => {
          setEditing(pkg);
          setFormOpen(true);
        },
        onDelete: (pkg) => setDeleting(pkg),
      }),
    [t, tCatalog, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="catalog"
        columns={columns}
        data={packages ?? []}
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
        <PackageForm
          pkg={editing ?? undefined}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                packageCode: editing.packageCode,
                data: {
                  displayName: values.displayName,
                  destination: values.destination,
                  countryCode: values.countryCode,
                  heroImageUrl: values.heroImageUrl,
                  isActive: values.isActive,
                  durationNights: values.durationNights,
                  includes: values.includes,
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
        name={deleting?.packageCode ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting)
            deleteMutation.mutate({ packageCode: deleting.packageCode });
        }}
      />
    </div>
  );
}
