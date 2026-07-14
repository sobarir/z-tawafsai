'use client';

import type { Airport } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface AirportColumnsOptions {
  columnLabels: {
    airportCode: string;
    name: string;
    cityCode: string;
    countryCode: string;
    timezone: string;
    coordinates: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (airport: Airport) => void;
  onDelete: (airport: Airport) => void;
}

export function getAirportColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: AirportColumnsOptions): ColumnDef<Airport>[] {
  return [
    { accessorKey: 'airportCode', header: columnLabels.airportCode },
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'cityCode', header: columnLabels.cityCode },
    { accessorKey: 'countryCode', header: columnLabels.countryCode },
    { accessorKey: 'timezone', header: columnLabels.timezone },
    {
      id: 'coordinates',
      header: columnLabels.coordinates,
      cell: ({ row }) => {
        const { latitude, longitude } = row.original;
        if (latitude == null || longitude == null) return '—';
        return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
      },
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
