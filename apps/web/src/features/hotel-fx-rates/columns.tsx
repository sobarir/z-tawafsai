'use client';

import type { FxRate } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface FxRateColumnsOptions {
  columnLabels: {
    baseCurrency: string;
    quoteCurrency: string;
    ratePpm: string;
    asOf: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (fxRate: FxRate) => void;
  onDelete: (fxRate: FxRate) => void;
}

export function getFxRateColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: FxRateColumnsOptions): ColumnDef<FxRate>[] {
  return [
    { accessorKey: 'baseCurrency', header: columnLabels.baseCurrency },
    { accessorKey: 'quoteCurrency', header: columnLabels.quoteCurrency },
    {
      id: 'rate',
      header: columnLabels.ratePpm,
      cell: ({ row }) => (row.original.ratePpm / 1_000_000).toLocaleString(),
    },
    {
      id: 'asOf',
      header: columnLabels.asOf,
      cell: ({ row }) => new Date(row.original.asOf).toLocaleString(),
    },
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
