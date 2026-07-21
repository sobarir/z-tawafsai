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
  useListAirports,
  useListCities,
  useListFlights,
  useListHotelCurrencies,
  useListHotelProperties,
  useListTravelPackages,
  useListTravelProviders,
  useUpdateTravelPackage,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import {
  toAirportOptions,
  toCityOptions,
  toCurrencyOptions,
  toPropertyOptions,
  toProviderOptions,
} from '@/libs/combobox-options';
import { getTravelPackageColumns } from './columns';
import { TravelPackageForm } from './travel-package-form';
import { TravelPackageInventoryDialog } from './travel-package-inventory-dialog';

export function TravelPackagesAdmin() {
  const t = useTranslations('travelPackagesAdmin.travelPackages');
  const tAdmin = useTranslations('travelPackagesAdmin');
  const tCommon = useTranslations('common');

  const { data: travelPackages, isLoading } = useListTravelPackages();
  const { data: flights } = useListFlights();
  const { data: airports } = useListAirports();
  const { data: properties } = useListHotelProperties();
  const { data: currencies } = useListHotelCurrencies();
  const { data: providers } = useListTravelProviders();
  const { data: cities } = useListCities();

  const airportOptions = useMemo(
    () => toAirportOptions(airports ?? []),
    [airports],
  );
  const cityOptions = useMemo(() => toCityOptions(cities ?? []), [cities]);
  const propertyOptions = useMemo(
    () => toPropertyOptions(properties ?? []),
    [properties],
  );
  const currencyOptions = useMemo(
    () => toCurrencyOptions(currencies ?? []),
    [currencies],
  );
  const providerOptions = useMemo(
    () => toProviderOptions(providers ?? []),
    [providers],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlightHotelPackage | null>(null);
  const [deleting, setDeleting] = useState<FlightHotelPackage | null>(null);
  // Track by id so the inventory dialog re-derives from fresh list data after a
  // booking mutation invalidates the packages query (updated seat counts).
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = travelPackages?.find((pkg) => pkg.id === viewingId) ?? null;

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
          isFeatured: t('columns.isFeatured'),
        },
        typeLabels: {
          umrah: t('fields.typeUmrah'),
          umrah_plus: t('fields.typeUmrahPlus'),
          hajj: t('fields.typeHajj'),
        },
        activeLabel: tCommon('yes'),
        inactiveLabel: tCommon('no'),
        actionsLabel: tAdmin('actions'),
        openMenuLabel: tAdmin('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        manageSeatsLabel: t('manageSeats'),
        onEdit: (travelPackage) => {
          setEditing(travelPackage);
          setFormOpen(true);
        },
        onDelete: (travelPackage) => setDeleting(travelPackage),
        onManageSeats: (travelPackage) => setViewingId(travelPackage.id),
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
        contentClassName="sm:max-w-2xl"
      >
        <TravelPackageForm
          travelPackage={editing ?? undefined}
          airportOptions={airportOptions}
          flights={flights ?? []}
          cityOptions={cityOptions}
          cities={cities ?? []}
          properties={properties ?? []}
          propertyOptions={propertyOptions}
          currencyOptions={currencyOptions}
          providerOptions={providerOptions}
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

      <TravelPackageInventoryDialog
        travelPackage={viewing}
        open={viewingId !== null}
        onOpenChange={(open) => !open && setViewingId(null)}
      />
    </div>
  );
}
