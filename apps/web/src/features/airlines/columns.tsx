'use client';

import type { Airline } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';

interface AirlineColumnsOptions {
  columnLabels: {
    airlineCode: string;
    icaoCode: string;
    name: string;
    countryCode: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (airline: Airline) => void;
  onDelete: (airline: Airline) => void;
}

export function getAirlineColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: AirlineColumnsOptions): ColumnDef<Airline>[] {
  return [
    { accessorKey: 'airlineCode', header: columnLabels.airlineCode },
    {
      accessorKey: 'icaoCode',
      header: columnLabels.icaoCode,
      cell: ({ row }) => row.original.icaoCode ?? '—',
    },
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'countryCode', header: columnLabels.countryCode },
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
