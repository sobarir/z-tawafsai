'use client';

import type { Airline, Flight, FlightMarketing } from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { type SortColumn, TreeDataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListFlightsQueryKey,
  useCreateFlight,
  useDeleteFlight,
  useListAirlines,
  useListAirports,
  useListFlightMarketing,
  useListFlights,
  useUpdateFlight,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import { formatCurrency } from '@/libs/format-currency';
import {
  type FlightFilters,
  type FlightRow,
  getFlightColumns,
} from './columns';

function getOffsetMinutes(timeZone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value;
    if (!tzPart || tzPart === 'GMT') return 0;

    const match = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = parseInt(match[2] || '0', 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + mins);
  } catch (_e) {
    return 0;
  }
}

import {
  emptyFlightFormValues,
  FlightForm,
  flightToFormValues,
} from './flight-form';
import { FlightLegsDialog } from './flight-legs-dialog';

/**
 * Elapsed minutes between departure and arrival, with both local times pulled
 * back to UTC through their airport's offset — a flight that lands "earlier"
 * than it departs is crossing zones, not travelling backwards.
 */
function flightDurationMinutes(
  flight: Flight,
  tzOffsets: Map<string, number>,
): number {
  const depOffset = tzOffsets.get(flight.originAirport) ?? 0;
  const arrOffset = tzOffsets.get(flight.destAirport) ?? 0;

  const [depH = 0, depM = 0] = flight.departureTimeLocal.split(':').map(Number);
  const [arrH = 0, arrM = 0] = flight.arrivalTimeLocal.split(':').map(Number);

  const depUtcMins = depH * 60 + depM - depOffset;
  const arrUtcMins =
    flight.arrivalDayOffset * 24 * 60 + arrH * 60 + arrM - arrOffset;

  return arrUtcMins - depUtcMins;
}

/** The first marketing identity mapped onto this flight by another carrier. */
function resolveCodeshare(
  flightId: string,
  marketings: FlightMarketing[] | undefined,
  airlines: Airline[],
): Pick<FlightRow, 'codeshareAirlineDisplay' | 'codeshareFlightNumber'> {
  const marketing = marketings?.find(
    (m) => m.flightId === flightId && !m.isOperatingCarrier,
  );
  if (!marketing) return {};

  const airline = airlines.find(
    (a) => a.airlineCode === marketing.marketingAirline,
  );
  return {
    codeshareAirlineDisplay: airline
      ? `${marketing.marketingAirline} - ${airline.name}`
      : marketing.marketingAirline,
    codeshareFlightNumber: marketing.marketingNumber,
  };
}

/**
 * Every filter box is a case-insensitive substring match. The itinerary box is
 * the exception: it matches any of the route's four display fields, so typing
 * an airport or a time both narrow the same column.
 */
function matchesFilters(
  row: FlightRow,
  filters: FlightFilters,
  labels: { price: string; status: string },
): boolean {
  const itinerary = filters.itinerary.toLowerCase();
  const itineraryMatches =
    !itinerary ||
    row.originAirport.toLowerCase().includes(itinerary) ||
    row.destAirport.toLowerCase().includes(itinerary) ||
    row.departureTimeLocal.toLowerCase().includes(itinerary) ||
    row.arrivalTimeLocal.toLowerCase().includes(itinerary);

  return (
    itineraryMatches &&
    row.airlineDisplay
      .toLowerCase()
      .includes(filters.operatingAirline.toLowerCase()) &&
    row.flightNumber
      .toLowerCase()
      .includes(filters.flightNumber.toLowerCase()) &&
    labels.price.includes(filters.price.toLowerCase()) &&
    labels.status.includes(filters.status.toLowerCase())
  );
}

/** Column-specific ordering; unsortable columns keep the incoming order. */
function compareFlightRows(
  a: FlightRow,
  b: FlightRow,
  columnKey: string,
): number {
  if (columnKey === 'airlineDisplay')
    return a.airlineDisplay.localeCompare(b.airlineDisplay);
  if (columnKey === 'flightNumber')
    return a.flightNumber.localeCompare(b.flightNumber);
  if (columnKey === 'price') return a.price - b.price;
  if (columnKey === 'status') return a.status.localeCompare(b.status);
  if (columnKey === 'itinerary') {
    const byDeparture = a.departureTimeLocal.localeCompare(
      b.departureTimeLocal,
    );
    return byDeparture !== 0
      ? byDeparture
      : a.arrivalTimeLocal.localeCompare(b.arrivalTimeLocal);
  }
  return 0;
}

export function FlightsAdmin() {
  const t = useTranslations('schedule.flights');
  const tStatus = useTranslations('schedule.flights.status');
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const { data: flights, isLoading } = useListFlights();
  const { data: airports } = useListAirports();
  const { data: airlines } = useListAirlines();
  const { data: marketings } = useListFlightMarketing();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Flight | null>(null);
  const [viewing, setViewing] = useState<Flight | null>(null);
  const [deleting, setDeleting] = useState<Flight | null>(null);

  const [filters, setFilters] = useState<FlightFilters>({
    operatingAirline: '',
    flightNumber: '',
    itinerary: '',
    price: '',
    status: '',
  });

  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  const [expandedGroupIds, setExpandedGroupIds] = useState<
    ReadonlySet<unknown>
  >(() => new Set());

  const feedback = useCrudFeedback(getListFlightsQueryKey());

  const createMutation = useCreateFlight({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setCreateOpen(false),
    ),
  });

  const updateMutation = useUpdateFlight({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () =>
      setEditing(null),
    ),
  });

  const deleteMutation = useDeleteFlight({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const gridRows = useMemo(() => {
    if (!flights || !airports || !airlines) return [];

    const tzOffsets = new Map(
      airports.map((a) => [a.airportCode, getOffsetMinutes(a.timezone)]),
    );

    const rows: FlightRow[] = flights.map((f) => {
      const airline = airlines.find(
        (a) => a.airlineCode === f.operatingAirline,
      );
      return {
        ...f,
        airlineDisplay: airline
          ? `${f.operatingAirline} - ${airline.name}`
          : f.operatingAirline,
        durationMins: flightDurationMinutes(f, tzOffsets),
        ...resolveCodeshare(f.id, marketings, airlines),
      };
    });

    return rows.filter((row) =>
      matchesFilters(row, filters, {
        price: formatCurrency(row.price, row.currency, locale).toLowerCase(),
        status: tStatus(row.status).toLowerCase(),
      }),
    );
  }, [flights, filters, tStatus, locale, airlines, airports, marketings]);

  const sortedGridRows = useMemo(() => {
    if (sortColumns.length === 0) return gridRows;

    return [...gridRows].sort((a, b) => {
      for (const sort of sortColumns) {
        const result = compareFlightRows(a, b, sort.columnKey);
        if (result !== 0) {
          return sort.direction === 'ASC' ? result : -result;
        }
      }
      return 0;
    });
  }, [gridRows, sortColumns]);

  const columns = useMemo(
    () =>
      getFlightColumns({
        locale,
        columnLabels: {
          operatingAirline: t('columns.operatingAirline'),
          flightNumber: t('columns.flightNumber'),
          itinerary: t('columns.route'),
          price: t('columns.price'),
          status: t('columns.status'),
        },
        statusLabels: {
          ACTIVE: tStatus('ACTIVE'),
          SUSPENDED: tStatus('SUSPENDED'),
          SEASONAL: tStatus('SEASONAL'),
        },
        actionsLabel: tSchedule('actions'),
        openMenuLabel: tSchedule('openMenu'),
        viewLabel: t('viewLegs'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onView: (flight) => setViewing(flight),
        onEdit: (flight) => setEditing(flight),
        onDelete: (flight) => setDeleting(flight),
        filters,
        onFilterChange: setFilters,
      }),
    [t, tStatus, tSchedule, tCommon, locale, filters],
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          {tSchedule('createButton')}
        </Button>
      </div>

      <div
        className={`flex flex-col flex-1 min-h-[500px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <TreeDataGrid
          columns={columns}
          rows={sortedGridRows}
          sortColumns={sortColumns}
          onSortColumnsChange={setSortColumns}
          rowKeyGetter={(row) => row.id}
          groupBy={['airlineDisplay']}
          rowGrouper={(rows, columnKey) => {
            const groups: Record<string, FlightRow[]> = {};
            for (const row of rows) {
              const key = String(row[columnKey as keyof FlightRow] ?? '');
              groups[key] ??= [];
              groups[key].push(row);
            }
            return groups;
          }}
          expandedGroupIds={expandedGroupIds}
          onExpandedGroupIdsChange={setExpandedGroupIds}
          className="rdg-light flex-1 min-h-[500px]"
          style={{ blockSize: 'auto' }}
          headerRowHeight={64}
          rowHeight={72}
        />
      </div>

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={t('createTitle')}
        contentClassName="sm:max-w-2xl"
      >
        <FlightForm
          mode="create"
          airports={airports ?? []}
          airlines={airlines ?? []}
          defaultValues={emptyFlightFormValues}
          submitting={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (values) => {
            await createMutation.mutateAsync({ data: values });
          }}
        />
      </EntityFormDialog>

      <EntityFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        title={t('editTitle')}
        contentClassName="sm:max-w-2xl"
      >
        {editing ? (
          <FlightForm
            mode="edit"
            airports={airports ?? []}
            airlines={airlines ?? []}
            defaultValues={flightToFormValues(editing)}
            submitting={updateMutation.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              // Identity keys are immutable; the update contract omits them.
              const { operatingAirline, flightNumber, ...data } = values;
              await updateMutation.mutateAsync({
                id: editing.id,
                data,
              });
            }}
          />
        ) : null}
      </EntityFormDialog>

      <FlightLegsDialog
        flight={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <EntityDeleteConfirm
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={
          deleting ? `${deleting.operatingAirline}${deleting.flightNumber}` : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
