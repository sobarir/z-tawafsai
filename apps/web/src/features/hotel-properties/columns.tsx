'use client';

import type { Property } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface PropertyColumnsOptions {
  columnLabels: {
    propertyCode: string;
    displayName: string;
    type: string;
    destination: string;
    countryCode: string;
    starRating: string;
    distance: string;
    contact: string;
    isActive: string;
  };
  typeLabels: Record<Property['type'], string>;
  activeLabel: string;
  inactiveLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export function getPropertyColumns({
  columnLabels,
  typeLabels,
  activeLabel,
  inactiveLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: PropertyColumnsOptions): ColumnDef<Property>[] {
  return [
    { accessorKey: 'displayName', header: columnLabels.displayName },
    {
      id: 'type',
      header: columnLabels.type,
      cell: ({ row }) => typeLabels[row.original.type],
    },
    { accessorKey: 'destination', header: columnLabels.destination },
    { accessorKey: 'countryCode', header: columnLabels.countryCode },
    {
      id: 'starRating',
      header: columnLabels.starRating,
      cell: ({ row }) => row.original.starRating ?? '—',
    },
    {
      id: 'distance',
      header: columnLabels.distance,
      cell: ({ row }) => {
        const { distanceMeters, distanceNote } = row.original;
        if (distanceMeters == null && !distanceNote) return '—';

        if (distanceMeters != null) {
          const noteLower = distanceNote?.toLowerCase();
          if (noteLower === 'less than') return `< ${distanceMeters}m`;
          if (noteLower === 'approx' || noteLower === 'approx.') return `~${distanceMeters}m`;
        }

        const parts = [
          distanceMeters != null ? `${distanceMeters}m` : null,
          distanceNote,
        ].filter(Boolean);
        return parts.join(' · ');
      },
    },
    {
      id: 'contact',
      header: columnLabels.contact,
      cell: ({ row }) =>
        row.original.contactPhone ?? row.original.contactEmail ?? '—',
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
