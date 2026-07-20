'use client';

import type { Flight } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/libs/format-currency';

const STATUS_VARIANT: Record<
  Flight['status'],
  'success' | 'warning' | 'secondary'
> = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  SEASONAL: 'secondary',
};

interface FlightColumnsOptions {
  locale: string;
  columnLabels: {
    operatingAirline: string;
    flightNumber: string;
    route: string;
    departureTime: string;
    arrivalTime: string;
    aircraftType: string;
    price: string;
    status: string;
    legs: string;
  };
  statusLabels: Record<Flight['status'], string>;
  legsSummary: (count: number) => string;
  actionsLabel: string;
  openMenuLabel: string;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
  onView: (flight: Flight) => void;
  onEdit: (flight: Flight) => void;
  onDelete: (flight: Flight) => void;
}

export function getFlightColumns({
  locale,
  columnLabels,
  statusLabels,
  legsSummary,
  actionsLabel,
  openMenuLabel,
  viewLabel,
  editLabel,
  deleteLabel,
  onView,
  onEdit,
  onDelete,
}: FlightColumnsOptions): ColumnDef<Flight>[] {
  return [
    {
      id: 'flightNumber',
      header: columnLabels.flightNumber,
      accessorFn: (flight) =>
        `${flight.operatingAirline}${flight.flightNumber}`,
    },
    {
      id: 'route',
      header: columnLabels.route,
      accessorFn: (flight) => `${flight.originAirport} → ${flight.destAirport}`,
    },
    {
      accessorKey: 'departureTimeLocal',
      header: columnLabels.departureTime,
      cell: ({ row }) => row.original.departureTimeLocal,
    },
    {
      accessorKey: 'arrivalTimeLocal',
      header: columnLabels.arrivalTime,
      cell: ({ row }) => row.original.arrivalTimeLocal,
    },
    {
      accessorKey: 'aircraftType',
      header: columnLabels.aircraftType,
      cell: ({ row }) => row.original.aircraftType ?? '—',
    },
    {
      accessorKey: 'price',
      header: columnLabels.price,
      cell: ({ row }) =>
        formatCurrency(row.original.price, row.original.currency, locale),
    },
    {
      accessorKey: 'status',
      header: columnLabels.status,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      id: 'legs',
      header: columnLabels.legs,
      cell: ({ row }) => (
        <button
          type="button"
          className="cursor-pointer underline-offset-2 hover:underline"
          onClick={() => onView(row.original)}
        >
          {legsSummary(row.original.legs.length)}
        </button>
      ),
    },
    {
      id: 'actions',
      header: actionsLabel,
      cell: ({ row }) => (
        <RowActionsCell
          openMenuLabel={openMenuLabel}
          actions={[
            { label: viewLabel, onClick: () => onView(row.original) },
            { label: editLabel, onClick: () => onEdit(row.original) },
            {
              label: deleteLabel,
              onClick: () => onDelete(row.original),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];
}
