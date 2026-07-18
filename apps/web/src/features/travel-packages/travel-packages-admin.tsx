'use client';

import type { FlightHotelPackage } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListTravelPackagesQueryKey,
  useCreateTravelPackage,
  useDeleteTravelPackage,
  useListFlights,
  useListHotelCurrencies,
  useListHotelProperties,
  useListTravelPackages,
  useUpdateTravelPackage,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import {
  toCurrencyOptions,
  toFlightOptions,
  toPropertyOptions,
} from '@/libs/combobox-options';
import { getTravelPackageColumns } from './columns';
import { TravelPackageForm } from './travel-package-form';

export function TravelPackagesAdmin() {
  const t = useTranslations('travelPackagesAdmin.travelPackages');
  const tAdmin = useTranslations('travelPackagesAdmin');
  const tCommon = useTranslations('common');

  const { data: travelPackages, isLoading } = useListTravelPackages();
  const { data: flights } = useListFlights();
  const { data: properties } = useListHotelProperties();
  const { data: currencies } = useListHotelCurrencies();

  const flightOptions = useMemo(
    () => toFlightOptions(flights ?? []),
    [flights],
  );
  const propertyOptions = useMemo(
    () => toPropertyOptions(properties ?? []),
    [properties],
  );
  const currencyOptions = useMemo(
    () => toCurrencyOptions(currencies ?? []),
    [currencies],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlightHotelPackage | null>(null);
  const [deleting, setDeleting] = useState<FlightHotelPackage | null>(null);

  const feedback = useCrudFeedback(
    getListTravelPackagesQueryKey(),
    'travelPackagesAdmin',
  );

  const createMutation = useCreateTravelPackage({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const updateMutation = useUpdateTravelPackage({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });

  const deleteMutation = useDeleteTravelPackage({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getTravelPackageColumns({
        columnLabels: {
          title: t('columns.title'),
          type: t('columns.type'),
          flight: t('columns.flight'),
          stays: t('columns.stays'),
          durationNights: t('columns.durationNights'),
          price: t('columns.price'),
          isActive: t('columns.isActive'),
        },
        activeLabel: tCommon('yes'),
        inactiveLabel: tCommon('no'),
        actionsLabel: tAdmin('actions'),
        openMenuLabel: tAdmin('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (travelPackage) => {
          setEditing(travelPackage);
          setFormOpen(true);
        },
        onDelete: (travelPackage) => setDeleting(travelPackage),
      }),
    [t, tAdmin, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        namespace="travelPackagesAdmin"
        columns={columns}
        data={travelPackages ?? []}
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
            {tAdmin('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <TravelPackageForm
          travelPackage={editing ?? undefined}
          flightOptions={flightOptions}
          propertyOptions={propertyOptions}
          currencyOptions={currencyOptions}
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
        namespace="travelPackagesAdmin"
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={deleting?.title ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
