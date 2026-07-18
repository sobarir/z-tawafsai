'use client';

import type { FlightHotelPackage } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface TravelPackageColumnsOptions {
  columnLabels: {
    title: string;
    type: string;
    flight: string;
    stays: string;
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
    { accessorKey: 'type', header: columnLabels.type },
    {
      id: 'flight',
      header: columnLabels.flight,
      cell: ({ row }) => {
        const { flight } = row.original;
        return `${flight.operatingAirline}${flight.flightNumber} (${flight.originAirport}→${flight.destAirport})`;
      },
    },
    {
      id: 'stays',
      header: columnLabels.stays,
      cell: ({ row }) =>
        row.original.stays.map((stay) => stay.destination).join(' → '),
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
