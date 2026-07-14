'use client';

import type { Airline } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

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
    actionsColumn({
      actionsLabel,
      openMenuLabel,
      editLabel,
      deleteLabel,
      onEdit,
      onDelete,
    }),
  ];
}
