'use client';

import type { Flight } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getListFlightsQueryKey,
  useCreateFlight,
  useDeleteFlight,
  useListAirlines,
  useListAirports,
  useListFlights,
  useUpdateFlight,
} from '@/libs/api/generated/endpoints';
import { useCrudFeedback } from '@/libs/api/use-crud-feedback';
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

  const { onSuccess, onError } = useCrudFeedback(getListFlightsQueryKey());

  const createMutation = useCreateFlight({
    mutation: {
      onSuccess: onSuccess('createSuccess', () => setCreateOpen(false)),
      onError,
    },
  });

  const updateMutation = useUpdateFlight({
    mutation: {
      onSuccess: onSuccess('updateSuccess', () => setEditing(null)),
      onError,
    },
  });

  const deleteMutation = useDeleteFlight({
    mutation: {
      onSuccess: onSuccess('deleteSuccess', () => setDeleting(null)),
      onError,
    },
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('createTitle')}</DialogTitle>
          </DialogHeader>
          <FlightCreateForm
            airports={airports ?? []}
            airlines={airlines ?? []}
            submitting={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (values) => {
              await createMutation.mutateAsync({ data: values });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('editTitle')}</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      <FlightLegsDialog
        flight={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={tSchedule('deleteConfirmTitle')}
        description={tSchedule('deleteConfirmDescription', {
          name: deleting
            ? `${deleting.operatingAirline}${deleting.flightNumber}`
            : '',
        })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
