'use client';

import type { MctRule } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';

interface MctRuleColumnsOptions {
  columnLabels: {
    arrivalAirport: string;
    departureAirport: string;
    scope: string;
    arrivalAirline: string;
    departureAirline: string;
    arrivalTerminal: string;
    departureTerminal: string;
    mctMinutes: string;
    maxConnectionMinutes: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (rule: MctRule) => void;
  onDelete: (rule: MctRule) => void;
}

export function getMctRuleColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: MctRuleColumnsOptions): ColumnDef<MctRule>[] {
  return [
    { accessorKey: 'arrivalAirport', header: columnLabels.arrivalAirport },
    { accessorKey: 'departureAirport', header: columnLabels.departureAirport },
    { accessorKey: 'scope', header: columnLabels.scope },
    {
      accessorKey: 'arrivalAirline',
      header: columnLabels.arrivalAirline,
      cell: ({ row }) => row.original.arrivalAirline ?? '—',
    },
    {
      accessorKey: 'departureAirline',
      header: columnLabels.departureAirline,
      cell: ({ row }) => row.original.departureAirline ?? '—',
    },
    {
      accessorKey: 'arrivalTerminal',
      header: columnLabels.arrivalTerminal,
      cell: ({ row }) => row.original.arrivalTerminal ?? '—',
    },
    {
      accessorKey: 'departureTerminal',
      header: columnLabels.departureTerminal,
      cell: ({ row }) => row.original.departureTerminal ?? '—',
    },
    { accessorKey: 'mctMinutes', header: columnLabels.mctMinutes },
    {
      accessorKey: 'maxConnectionMinutes',
      header: columnLabels.maxConnectionMinutes,
    },
    {
      id: 'actions',
      header: actionsLabel,
      cell: ({ row }) => (
        <RowActionsCell
          openMenuLabel={openMenuLabel}
          actions={[
            { label: editLabel, onClick: () => onEdit(row.original) },
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
