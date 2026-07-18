'use client';

import type { Property, Season } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface SeasonColumnsOptions {
  columnLabels: {
    property: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  properties: Property[];
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export function getSeasonColumns({
  columnLabels,
  properties,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: SeasonColumnsOptions): ColumnDef<Season>[] {
  const propertyName = (propertyCode: string): string => {
    const property = properties.find((p) => p.propertyCode === propertyCode);
    return property?.displayName ?? propertyCode;
  };

  return [
    {
      id: 'property',
      header: columnLabels.property,
      cell: ({ row }) => propertyName(row.original.propertyCode),
    },
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'startDate', header: columnLabels.startDate },
    { accessorKey: 'endDate', header: columnLabels.endDate },
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
