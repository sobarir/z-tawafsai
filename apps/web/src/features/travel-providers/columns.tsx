'use client';

import type { TravelProvider } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface TravelProviderColumnsOptions {
  columnLabels: {
    name: string;
    licenseNumber: string;
    contactPhone: string;
    isActive: string;
  };
  activeLabel: string;
  inactiveLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (provider: TravelProvider) => void;
  onDelete: (provider: TravelProvider) => void;
}

export function getTravelProviderColumns({
  columnLabels,
  activeLabel,
  inactiveLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: TravelProviderColumnsOptions): ColumnDef<TravelProvider>[] {
  return [
    { accessorKey: 'name', header: columnLabels.name },
    {
      id: 'licenseNumber',
      header: columnLabels.licenseNumber,
      cell: ({ row }) => row.original.licenseNumber ?? '—',
    },
    {
      id: 'contactPhone',
      header: columnLabels.contactPhone,
      cell: ({ row }) => row.original.contactPhone ?? '—',
    },
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
