'use client';

import type { MctRule } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListMctRulesQueryKey,
  useCreateMctRule,
  useDeleteMctRule,
  useListAirlines,
  useListAirports,
  useListMctRules,
  useUpdateMctRule,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getMctRuleColumns } from './columns';
import { MctRuleForm } from './mct-rule-form';
import { MctRuleResolver } from './mct-rule-resolver';

export function MctRulesAdmin() {
  const t = useTranslations('schedule.mctRules');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: rules, isLoading } = useListMctRules();
  const { data: airports } = useListAirports();
  const { data: airlines } = useListAirlines();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MctRule | null>(null);
  const [deleting, setDeleting] = useState<MctRule | null>(null);

  const feedback = useCrudFeedback(getListMctRulesQueryKey());

  const createMutation = useCreateMctRule({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const updateMutation = useUpdateMctRule({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });

  const deleteMutation = useDeleteMctRule({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getMctRuleColumns({
        columnLabels: {
          arrivalAirport: t('columns.arrivalAirport'),
          departureAirport: t('columns.departureAirport'),
          scope: t('columns.scope'),
          arrivalAirline: t('columns.arrivalAirline'),
          departureAirline: t('columns.departureAirline'),
          arrivalTerminal: t('columns.arrivalTerminal'),
          departureTerminal: t('columns.departureTerminal'),
          mctMinutes: t('columns.mctMinutes'),
          maxConnectionMinutes: t('columns.maxConnectionMinutes'),
        },
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (rule) => {
          setEditing(rule);
          setFormOpen(true);
        },
        onDelete: (rule) => setDeleting(rule),
      }),
    [t, tSchedule, tCommon],
  );

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <EntityDataTable
        columns={columns}
        data={rules ?? []}
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

      <MctRuleResolver airports={airports ?? []} airlines={airlines ?? []} />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <MctRuleForm
          rule={editing ?? undefined}
          airports={airports ?? []}
          airlines={airlines ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  arrivalAirline: values.arrivalAirline,
                  departureAirline: values.departureAirline,
                  arrivalTerminal: values.arrivalTerminal,
                  departureTerminal: values.departureTerminal,
                  mctMinutes: values.mctMinutes,
                  maxConnectionMinutes: values.maxConnectionMinutes,
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
            ? `${deleting.departureAirport}→${deleting.arrivalAirport}`
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
