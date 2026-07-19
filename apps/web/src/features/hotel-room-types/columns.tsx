'use client';

import type { RoomType } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface RoomTypeColumnsOptions {
  columnLabels: {
    name: string;
    maxOccupancy: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomType: RoomType) => void;
}

export function getRoomTypeColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: RoomTypeColumnsOptions): ColumnDef<RoomType>[] {
  return [
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'maxOccupancy', header: columnLabels.maxOccupancy },
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
