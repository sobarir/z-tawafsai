'use client';

import type { Airline } from '@repo/shared';
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
  getListAirlinesQueryKey,
  useCreateAirline,
  useDeleteAirline,
  useListAirlines,
  useUpdateAirline,
} from '@/libs/api/generated/endpoints';
import { useCrudFeedback } from '@/libs/api/use-crud-feedback';
import { AirlineForm } from './airline-form';
import { getAirlineColumns } from './columns';

export function AirlinesAdmin() {
  const t = useTranslations('schedule.airlines');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: airlines, isLoading } = useListAirlines();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Airline | null>(null);
  const [deleting, setDeleting] = useState<Airline | null>(null);

  const { onSuccess, onError } = useCrudFeedback(getListAirlinesQueryKey());

  const createMutation = useCreateAirline({
    mutation: {
      onSuccess: onSuccess('createSuccess', () => setFormOpen(false)),
      onError,
    },
  });

  const updateMutation = useUpdateAirline({
    mutation: {
      onSuccess: onSuccess('updateSuccess', () => {
        setFormOpen(false);
        setEditing(null);
      }),
      onError,
    },
  });

  const deleteMutation = useDeleteAirline({
    mutation: {
      onSuccess: onSuccess('deleteSuccess', () => setDeleting(null)),
      onError,
    },
  });

  const columns = useMemo(
    () =>
      getAirlineColumns({
        columnLabels: {
          airlineCode: t('columns.airlineCode'),
          icaoCode: t('columns.icaoCode'),
          name: t('columns.name'),
          countryCode: t('columns.countryCode'),
        },
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (airline) => {
          setEditing(airline);
          setFormOpen(true);
        },
        onDelete: (airline) => setDeleting(airline),
      }),
    [t, tSchedule, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <EntityDataTable
        columns={columns}
        data={airlines ?? []}
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
          <AirlineForm
            airline={editing ?? undefined}
            submitting={submitting}
            onCancel={() => setFormOpen(false)}
            onSubmit={async (values) => {
              if (editing) {
                await updateMutation.mutateAsync({
                  code: editing.airlineCode,
                  data: {
                    icaoCode: values.icaoCode,
                    name: values.name,
                    countryCode: values.countryCode,
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
          name: deleting?.airlineCode ?? '',
        })}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ code: deleting.airlineCode });
        }}
      />
    </div>
  );
}
