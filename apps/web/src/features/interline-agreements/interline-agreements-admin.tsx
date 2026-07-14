'use client';

import type { InterlineAgreement } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EntityDataTable } from '@/components/shared/entity-data-table';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListInterlineAgreementsQueryKey,
  useCreateInterlineAgreement,
  useDeleteInterlineAgreement,
  useListAirlines,
  useListInterlineAgreements,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { getInterlineAgreementColumns } from './columns';
import { InterlineAgreementForm } from './interline-agreement-form';
import { InterlineResolver } from './interline-resolver';

export function InterlineAgreementsAdmin() {
  const t = useTranslations('schedule.interlineAgreements');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  const { data: agreements, isLoading } = useListInterlineAgreements();
  const { data: airlines } = useListAirlines();

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<InterlineAgreement | null>(null);

  const feedback = useCrudFeedback(getListInterlineAgreementsQueryKey());

  const createMutation = useCreateInterlineAgreement({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });

  const deleteMutation = useDeleteInterlineAgreement({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const columns = useMemo(
    () =>
      getInterlineAgreementColumns({
        columnLabels: {
          inboundAirline: t('columns.inboundAirline'),
          outboundAirline: t('columns.outboundAirline'),
          bagThroughChecked: t('columns.bagThroughChecked'),
        },
        yesLabel: tCommon('yes'),
        noLabel: tCommon('no'),
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        deleteLabel: tCommon('delete'),
        onDelete: (agreement) => setDeleting(agreement),
      }),
    [t, tSchedule, tCommon],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <EntityDataTable
        columns={columns}
        data={agreements ?? []}
        isLoading={isLoading}
        toolbar={
          <Button type="button" size="sm" onClick={() => setFormOpen(true)}>
            {tSchedule('createButton')}
          </Button>
        }
      />

      <InterlineResolver airlines={airlines ?? []} />

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={t('createTitle')}
      >
        <InterlineAgreementForm
          airlines={airlines ?? []}
          submitting={createMutation.isPending}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync({ data: values });
          }}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={
          deleting
            ? `${deleting.inboundAirline} → ${deleting.outboundAirline}`
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
