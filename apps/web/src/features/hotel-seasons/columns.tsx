'use client';

import type { Season } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface SeasonColumnsOptions {
  columnLabels: {
    name: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export function getSeasonColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: SeasonColumnsOptions): ColumnDef<Season>[] {
  return [
    { accessorKey: 'name', header: columnLabels.name },
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
