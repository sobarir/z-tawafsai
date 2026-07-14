'use client';

import type { Currency } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface CurrencyColumnsOptions {
  columnLabels: {
    code: string;
    minorUnit: string;
    symbol: string;
    name: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export function getCurrencyColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: CurrencyColumnsOptions): ColumnDef<Currency>[] {
  return [
    { accessorKey: 'code', header: columnLabels.code },
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'symbol', header: columnLabels.symbol },
    { accessorKey: 'minorUnit', header: columnLabels.minorUnit },
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
