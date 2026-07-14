'use client';

import type { Package } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface PackageColumnsOptions {
  columnLabels: {
    packageCode: string;
    displayName: string;
    destination: string;
    countryCode: string;
    durationNights: string;
    isActive: string;
  };
  activeLabel: string;
  inactiveLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}

export function getPackageColumns({
  columnLabels,
  activeLabel,
  inactiveLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: PackageColumnsOptions): ColumnDef<Package>[] {
  return [
    { accessorKey: 'packageCode', header: columnLabels.packageCode },
    { accessorKey: 'displayName', header: columnLabels.displayName },
    { accessorKey: 'destination', header: columnLabels.destination },
    { accessorKey: 'countryCode', header: columnLabels.countryCode },
    { accessorKey: 'durationNights', header: columnLabels.durationNights },
    {
      id: 'isActive',
      header: columnLabels.isActive,
      cell: ({ row }) => (row.original.isActive ? activeLabel : inactiveLabel),
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
