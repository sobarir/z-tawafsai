'use client';

import type { TravelProvider } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListTravelProvidersQueryKey,
  useCreateTravelProvider,
  useDeleteTravelProvider,
  useListTravelProviders,
  useUpdateTravelProvider,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getTravelProviderColumns } from './columns';
import { TravelProviderForm } from './travel-provider-form';

export function TravelProvidersAdmin() {
  const t = useTranslations('travelProvidersAdmin');
  const tCommon = useTranslations('common');

  const { data: providers, isLoading } = useListTravelProviders();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TravelProvider | null>(null);
  const [deleting, setDeleting] = useState<TravelProvider | null>(null);

  const feedback = useCrudFeedback(
    getListTravelProvidersQueryKey(),
    'travelProvidersAdmin',
  );

  const createMutation = useCreateTravelProvider({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateTravelProvider({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteTravelProvider({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getTravelProviderColumns({
        columnLabels: {
          name: t('columns.name'),
          licenseNumber: t('columns.licenseNumber'),
          contactPhone: t('columns.contactPhone'),
          isActive: t('columns.isActive'),
        },
        activeLabel: tCommon('yes'),
        inactiveLabel: tCommon('no'),
        actionsLabel: t('actions'),
        openMenuLabel: t('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (provider) => {
          setEditing(provider);
          setFormOpen(true);
        },
        onDelete: (provider) => setDeleting(provider),
      }),
    [t, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="travelProvidersAdmin"
        columns={columns}
        data={providers ?? []}
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
            {t('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <TravelProviderForm
          provider={editing ?? undefined}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: values,
              });
            } else {
              await createMutation.mutateAsync({ data: values });
            }
          }}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        namespace="travelProvidersAdmin"
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
