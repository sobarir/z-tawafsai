'use client';

import type { Flight, FlightMarketing } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';
import { Badge } from '@/components/ui/badge';

interface FlightMarketingColumnsOptions {
  flightsById: Map<string, Flight>;
  columnLabels: {
    flight: string;
    marketingAirline: string;
    marketingNumber: string;
    isOperatingCarrier: string;
  };
  yesLabel: string;
  noLabel: string;
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (row: FlightMarketing) => void;
  onDelete: (row: FlightMarketing) => void;
}

export function getFlightMarketingColumns({
  flightsById,
  columnLabels,
  yesLabel,
  noLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: FlightMarketingColumnsOptions): ColumnDef<FlightMarketing>[] {
  return [
    {
      id: 'flight',
      header: columnLabels.flight,
      cell: ({ row }) => {
        const flight = flightsById.get(row.original.flightId);
        return flight
          ? `${flight.operatingAirline}${flight.flightNumber} (${flight.originAirport}→${flight.destAirport})`
          : row.original.flightId;
      },
    },
    { accessorKey: 'marketingAirline', header: columnLabels.marketingAirline },
    { accessorKey: 'marketingNumber', header: columnLabels.marketingNumber },
    {
      accessorKey: 'isOperatingCarrier',
      header: columnLabels.isOperatingCarrier,
      cell: ({ row }) => (
        <Badge
          variant={row.original.isOperatingCarrier ? 'success' : 'outline'}
        >
          {row.original.isOperatingCarrier ? yesLabel : noLabel}
        </Badge>
      ),
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
