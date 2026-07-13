'use client';

import type { Airport } from '@repo/shared';
import { useTranslations } from 'next-intl';
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
  getListAirportsQueryKey,
  useCreateAirport,
  useDeleteAirport,
  useListAirports,
  useUpdateAirport,
} from '@/libs/api/generated/endpoints';
import { useCrudFeedback } from '@/libs/api/use-crud-feedback';
import { AirportForm } from './airport-form';
import { getAirportColumns } from './columns';

export function AirportsAdmin() {
  const t = useTranslations('schedule.airports');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: airports, isLoading } = useListAirports();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [deleting, setDeleting] = useState<Airport | null>(null);

  const { onSuccess, onError } = useCrudFeedback(getListAirportsQueryKey());

  const createMutation = useCreateAirport({
    mutation: {
      onSuccess: onSuccess('createSuccess', () => setFormOpen(false)),
      onError,
    },
  });

  const updateMutation = useUpdateAirport({
    mutation: {
      onSuccess: onSuccess('updateSuccess', () => {
        setFormOpen(false);
        setEditing(null);
      }),
      onError,
    },
  });

  const deleteMutation = useDeleteAirport({
    mutation: {
      onSuccess: onSuccess('deleteSuccess', () => setDeleting(null)),
      onError,
    },
  });

  const columns = useMemo(
    () =>
      getAirportColumns({
        columnLabels: {
          airportCode: t('columns.airportCode'),
          name: t('columns.name'),
          cityCode: t('columns.cityCode'),
          countryCode: t('columns.countryCode'),
          timezone: t('columns.timezone'),
          coordinates: t('columns.coordinates'),
        },
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (airport) => {
          setEditing(airport);
          setFormOpen(true);
        },
        onDelete: (airport) => setDeleting(airport),
      }),
    [t, tSchedule, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        columns={columns}
        data={airports ?? []}
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
            {tSchedule('createButton')}
          </Button>
        }
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? t('editTitle') : t('createTitle')}
            </DialogTitle>
          </DialogHeader>
          <AirportForm
            airport={editing ?? undefined}
            submitting={submitting}
            onCancel={() => setFormOpen(false)}
            onSubmit={async (values) => {
              if (editing) {
                await updateMutation.mutateAsync({
                  code: editing.airportCode,
                  data: {
                    icaoCode: values.icaoCode,
                    name: values.name,
                    cityCode: values.cityCode,
                    countryCode: values.countryCode,
                    timezone: values.timezone,
                    latitude: values.latitude,
                    longitude: values.longitude,
                  },
                });
              } else {
                await createMutation.mutateAsync({ data: values });
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={tSchedule('deleteConfirmTitle')}
        description={tSchedule('deleteConfirmDescription', {
          name: deleting?.airportCode ?? '',
        })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ code: deleting.airportCode });
        }}
      />
    </div>
  );
}
