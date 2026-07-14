'use client';

import type { FlightMarketing } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListFlightMarketingQueryKey,
  useCreateFlightMarketing,
  useDeleteFlightMarketing,
  useListAirlines,
  useListFlightMarketing,
  useListFlights,
  useUpdateFlightMarketing,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getFlightMarketingColumns } from './columns';
import { FlightMarketingForm } from './flight-marketing-form';

export function FlightMarketingAdmin() {
  const t = useTranslations('schedule.codeshare');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: entries, isLoading } = useListFlightMarketing();
  const { data: flights } = useListFlights();
  const { data: airlines } = useListAirlines();

  const flightsById = useMemo(
    () => new Map((flights ?? []).map((f) => [f.id, f])),
    [flights],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlightMarketing | null>(null);
  const [deleting, setDeleting] = useState<FlightMarketing | null>(null);

  const feedback = useCrudFeedback(getListFlightMarketingQueryKey());

  const createMutation = useCreateFlightMarketing({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const updateMutation = useUpdateFlightMarketing({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });

  const deleteMutation = useDeleteFlightMarketing({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getFlightMarketingColumns({
        flightsById,
        columnLabels: {
          flight: t('columns.flight'),
          marketingAirline: t('columns.marketingAirline'),
          marketingNumber: t('columns.marketingNumber'),
          isOperatingCarrier: t('columns.isOperatingCarrier'),
        },
        yesLabel: tCommon('yes'),
        noLabel: tCommon('no'),
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (row) => {
          setEditing(row);
          setFormOpen(true);
        },
        onDelete: (row) => setDeleting(row),
      }),
    [flightsById, t, tSchedule, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        columns={columns}
        data={entries ?? []}
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
        <FlightMarketingForm
          entry={editing ?? undefined}
          flights={flights ?? []}
          airlines={airlines ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  marketingNumber: values.marketingNumber,
                  isOperatingCarrier: values.isOperatingCarrier,
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
        name={
          deleting
            ? `${deleting.marketingAirline}${deleting.marketingNumber}`
            : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
