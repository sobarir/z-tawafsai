'use client';

import type { Airport } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListAirportsQueryKey,
  useCreateAirport,
  useDeleteAirport,
  useListAirports,
  useListCities,
  useUpdateAirport,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { toCityOptions } from '@/libs/combobox-options';
import { AirportForm } from './airport-form';
import { getAirportColumns } from './columns';

export function AirportsAdmin() {
  const t = useTranslations('schedule.airports');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: airports, isLoading } = useListAirports();
  const { data: cities } = useListCities();
  const cityOptions = useMemo(() => toCityOptions(cities ?? []), [cities]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Airport | null>(null);
  const [deleting, setDeleting] = useState<Airport | null>(null);

  const feedback = useCrudFeedback(getListAirportsQueryKey());

  const createMutation = useCreateAirport({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const updateMutation = useUpdateAirport({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });

  const deleteMutation = useDeleteAirport({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
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

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <AirportForm
          airport={editing ?? undefined}
          cityOptions={cityOptions}
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
      </EntityFormDialog>

      <EntityDeleteConfirm
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={deleting?.airportCode ?? ''}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ code: deleting.airportCode });
        }}
      />
    </div>
  );
}
