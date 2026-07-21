'use client';

import type { Flight } from '@repo/shared';
import type { Column } from 'react-data-grid';
import { ItineraryVisual } from '@/components/shared/itinerary-visual';
import { RowActionsCell } from '@/components/shared/row-actions-cell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/libs/format-currency';

export type FlightRow = Flight & {
  airlineDisplay: string;
  durationMins: number;
  codeshareAirlineDisplay?: string;
  codeshareFlightNumber?: string;
};

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  SUSPENDED: 'destructive',
  SEASONAL: 'secondary',
};

export interface FlightFilters {
  operatingAirline: string;
  flightNumber: string;
  itinerary: string;
  price: string;
  status: string;
}

function FilterHeader({
  name,
  filterValue,
  onFilterChange,
}: {
  name: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-1.5 h-full justify-between">
      <span className="font-semibold leading-none">{name}</span>
      <Input
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder="Filter..."
        className="h-7 text-xs font-normal placeholder:text-muted-foreground/70"
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ItineraryCell({ row }: { row: FlightRow }) {
  return (
    <ItineraryVisual
      departureTimeLocal={row.departureTimeLocal}
      originAirport={row.originAirport}
      arrivalTimeLocal={row.arrivalTimeLocal}
      arrivalDayOffset={row.arrivalDayOffset}
      destAirport={row.destAirport}
      durationMins={row.durationMins}
      stops={row.legs.length - 1}
    />
  );
}

export interface FlightColumnsOptions {
  locale: string;
  columnLabels: {
    operatingAirline: string;
    flightNumber: string;
    itinerary: string;
    price: string;
    status: string;
  };
  statusLabels: Record<string, string>;
  actionsLabel: string;
  openMenuLabel: string;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
  onView: (flight: FlightRow) => void;
  onEdit: (flight: FlightRow) => void;
  onDelete: (flight: FlightRow) => void;
  filters: FlightFilters;
  onFilterChange: (filters: FlightFilters) => void;
}

export function getFlightColumns({
  locale,
  columnLabels,
  statusLabels,
  actionsLabel,
  openMenuLabel,
  viewLabel,
  editLabel,
  deleteLabel,
  onView,
  onEdit,
  onDelete,
  filters,
  onFilterChange,
}: FlightColumnsOptions): Column<FlightRow>[] {
  return [
    {
      key: 'airlineDisplay',
      sortable: true,
      resizable: true,
      width: 180,
      name: columnLabels.operatingAirline,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.operatingAirline}
          filterValue={filters.operatingAirline}
          onFilterChange={(v) =>
            onFilterChange({ ...filters, operatingAirline: v })
          }
        />
      ),
      renderCell: ({ row }) => {
        return (
          <span className="font-semibold text-[15px]">
            {row.airlineDisplay}
          </span>
        );
      },
    },
    {
      key: 'flightNumber',
      sortable: true,
      resizable: true,
      name: columnLabels.flightNumber,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.flightNumber}
          filterValue={filters.flightNumber}
          onFilterChange={(v) =>
            onFilterChange({ ...filters, flightNumber: v })
          }
        />
      ),
      renderCell: ({ row }) => {
        if (row.codeshareAirlineDisplay && row.codeshareFlightNumber) {
          const marketingCode = row.codeshareAirlineDisplay.split(' - ')[0];
          return (
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-[15px] leading-tight">
                {marketingCode} {row.codeshareFlightNumber}
              </span>
              <span className="text-sm text-muted-foreground leading-tight mt-0.5">
                Op {row.operatingAirline} {row.flightNumber}
              </span>
            </div>
          );
        }
        return (
          <span className="font-semibold text-[15px]">
            {row.operatingAirline} {row.flightNumber}
          </span>
        );
      },
    },
    {
      key: 'itinerary',
      sortable: true,
      resizable: true,
      name: columnLabels.itinerary,
      width: 300,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.itinerary}
          filterValue={filters.itinerary}
          onFilterChange={(v) => onFilterChange({ ...filters, itinerary: v })}
        />
      ),
      renderCell: ({ row }) => <ItineraryCell row={row} />,
    },
    {
      key: 'price',
      sortable: true,
      resizable: true,
      name: columnLabels.price,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.price}
          filterValue={filters.price}
          onFilterChange={(v) => onFilterChange({ ...filters, price: v })}
        />
      ),
      renderCell: ({ row }) => formatCurrency(row.price, row.currency, locale),
    },
    {
      key: 'status',
      sortable: true,
      resizable: true,
      name: columnLabels.status,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.status}
          filterValue={filters.status}
          onFilterChange={(v) => onFilterChange({ ...filters, status: v })}
        />
      ),
      renderCell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      name: actionsLabel,
      width: 60,
      renderCell: ({ row }) => (
        <RowActionsCell
          openMenuLabel={openMenuLabel}
          actions={[
            { label: viewLabel, onClick: () => onView(row) },
            { label: editLabel, onClick: () => onEdit(row) },
            {
              label: deleteLabel,
              onClick: () => onDelete(row),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];
}
