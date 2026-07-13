'use client';

import type { InterlineAgreement } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';
import { Badge } from '@/components/ui/badge';

interface InterlineAgreementColumnsOptions {
  columnLabels: {
    inboundAirline: string;
    outboundAirline: string;
    bagThroughChecked: string;
  };
  yesLabel: string;
  noLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  deleteLabel: string;
  onDelete: (agreement: InterlineAgreement) => void;
}

export function getInterlineAgreementColumns({
  columnLabels,
  yesLabel,
  noLabel,
  actionsLabel,
  openMenuLabel,
  deleteLabel,
  onDelete,
}: InterlineAgreementColumnsOptions): ColumnDef<InterlineAgreement>[] {
  return [
    { accessorKey: 'inboundAirline', header: columnLabels.inboundAirline },
    { accessorKey: 'outboundAirline', header: columnLabels.outboundAirline },
    {
      accessorKey: 'bagThroughChecked',
      header: columnLabels.bagThroughChecked,
      cell: ({ row }) => (
        <Badge variant={row.original.bagThroughChecked ? 'success' : 'outline'}>
          {row.original.bagThroughChecked ? yesLabel : noLabel}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: actionsLabel,
      cell: ({ row }) => (
        <RowActionsCell
          openMenuLabel={openMenuLabel}
          actions={[
            {
              label: deleteLabel,
              onClick: () => onDelete(row.original),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];
}
