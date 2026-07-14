'use client';

import type { FlightHotelPackage } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface TravelPackageColumnsOptions {
  columnLabels: {
    title: string;
    flight: string;
    property: string;
    durationNights: string;
    price: string;
    isActive: string;
  };
  activeLabel: string;
  inactiveLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (travelPackage: FlightHotelPackage) => void;
  onDelete: (travelPackage: FlightHotelPackage) => void;
}

export function getTravelPackageColumns({
  columnLabels,
  activeLabel,
  inactiveLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: TravelPackageColumnsOptions): ColumnDef<FlightHotelPackage>[] {
  return [
    { accessorKey: 'title', header: columnLabels.title },
    {
      id: 'flight',
      header: columnLabels.flight,
      cell: ({ row }) => {
        const { flight } = row.original;
        return `${flight.operatingAirline}${flight.flightNumber} (${flight.originAirport}→${flight.destAirport})`;
      },
    },
    {
      id: 'property',
      header: columnLabels.property,
      cell: ({ row }) => row.original.property.displayName,
    },
    { accessorKey: 'durationNights', header: columnLabels.durationNights },
    {
      id: 'price',
      header: columnLabels.price,
      cell: ({ row }) => `${row.original.currency} ${row.original.price}`,
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
