'use client';

import type { Flight } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListFlightsQueryKey,
  useCreateFlight,
  useDeleteFlight,
  useListAirlines,
  useListAirports,
  useListFlights,
  useUpdateFlight,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getFlightColumns } from './columns';
import { FlightCreateForm } from './flight-create-form';
import { FlightEditForm } from './flight-edit-form';
import { FlightLegsDialog } from './flight-legs-dialog';

export function FlightsAdmin() {
  const t = useTranslations('schedule.flights');
  const tStatus = useTranslations('schedule.flights.status');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: flights, isLoading } = useListFlights();
  const { data: airports } = useListAirports();
  const { data: airlines } = useListAirlines();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [viewing, setViewing] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState<Flight | null>(null);

  const feedback = useCrudFeedback(getListFlightsQueryKey());

  const createMutation = useCreateFlight({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setCreateOpen(false),
    ),
  });

  const updateMutation = useUpdateFlight({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () =>
      setEditing(null),
    ),
  });

  const deleteMutation = useDeleteFlight({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getFlightColumns({
        locale,
        columnLabels: {
          operatingAirline: t('columns.operatingAirline'),
          flightNumber: t('columns.flightNumber'),
          route: t('columns.route'),
          departureTime: t('columns.departureTime'),
          arrivalTime: t('columns.arrivalTime'),
          aircraftType: t('columns.aircraftType'),
          price: t('columns.price'),
          status: t('columns.status'),
          legs: t('columns.legs'),
        },
        statusLabels: {
          ACTIVE: tStatus('ACTIVE'),
          SUSPENDED: tStatus('SUSPENDED'),
          SEASONAL: tStatus('SEASONAL'),
        },
        legsSummary: (count) => t('legsSummary', { count }),
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        viewLabel: t('viewLegs'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onView: (flight) => setViewing(flight),
        onEdit: (flight) => setEditing(flight),
        onDelete: (flight) => setDeleting(flight),
      }),
    [t, tStatus, tSchedule, tCommon, locale],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        columns={columns}
        data={flights ?? []}
        isLoading={isLoading}
        toolbar={
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            {tSchedule('createButton')}
          </Button>
        }
      />

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('createTitle')}
        contentClassName="sm:max-w-2xl"
      >
        <FlightCreateForm
          airports={airports ?? []}
          airlines={airlines ?? []}
          submitting={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync({ data: values });
          }}
        />
      </EntityFormDialog>

      <EntityFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={t('editTitle')}
        contentClassName="sm:max-w-md"
      >
        {editing ? (
          <FlightEditForm
            flight={editing}
            submitting={updateMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: values,
              });
            }}
          />
        ) : null}
      </EntityFormDialog>

      <FlightLegsDialog
        flight={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <EntityDeleteConfirm
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={
          deleting ? `${deleting.operatingAirline}${deleting.flightNumber}` : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
