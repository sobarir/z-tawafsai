'use client';

import type { Package, Property, Season } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface SeasonColumnsOptions {
  columnLabels: {
    listing: string;
    name: string;
    startDate: string;
    endDate: string;
  };
  properties: Property[];
  packages: Package[];
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
  packages,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: SeasonColumnsOptions): ColumnDef<Season>[] {
  const listingName = (listingId: string): string => {
    const property = properties.find((p) => p.listingId === listingId);
    if (property) return property.displayName;
    const pkg = packages.find((p) => p.listingId === listingId);
    return pkg?.displayName ?? listingId;
  };

  return [
    {
      id: 'listing',
      header: columnLabels.listing,
      cell: ({ row }) => listingName(row.original.listingId),
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
