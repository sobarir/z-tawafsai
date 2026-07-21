'use client';

import type {
  CreateFlightHotelPackageInput,
  Flight,
  FlightItinerary,
} from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ComboboxOption } from '@/components/ui/combobox';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useSearchFlights } from '@/libs/api/generated/endpoints';
import { formatCurrency } from '@/libs/format-currency';
import { formatMinutes } from '@/libs/format-duration';

type Direction = 'outboundFlightIds' | 'inboundFlightIds';
type Departures = NonNullable<CreateFlightHotelPackageInput['departures']>;

/** "GA874 · GA123", the marketing labels of a journey's flights. */
function flightNumbers(flights: Flight[]): string {
  return flights
    .map((f) => `${f.operatingAirline}${f.flightNumber}`)
    .join(' · ');
}

/** "CGK → KUL → JED", the airport chain a journey routes through. */
function routePath(flights: Flight[]): string {
  const first = flights[0];
  if (!first) return '';
  return [first.originAirport, ...flights.map((f) => f.destAirport)].join(
    ' → ',
  );
}

function JourneyRow({
  journey,
  locale,
  t,
  onSelect,
}: {
  journey: FlightItinerary;
  locale: string;
  t: ReturnType<typeof useTranslations<'flightSearch'>>;
  onSelect: () => void;
}) {
  const stops = journey.stopCount;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 p-3">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-sm">
          {flightNumbers(journey.flights)}
        </p>
        <p className="text-xs text-muted-foreground">
          {routePath(journey.flights)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={stops > 0 ? 'secondary' : 'outline'}>
            {stops > 0 ? t('stopsCount', { count: stops }) : t('direct')}
          </Badge>
          <span>{formatMinutes(journey.totalDurationMinutes)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-semibold text-primary">
          {formatCurrency(journey.totalPrice, journey.currency, locale)}
        </span>
        <Button type="button" size="sm" variant="secondary" onClick={onSelect}>
          {t('selectJourney')}
        </Button>
      </div>
    </div>
  );
}

// Replaces the fixed-slot flight ComboBoxes with an OTA-style route search: the
// user enters origin/destination airports, searches, and picks a whole journey
// (direct or MCT-validated connection). The chosen journey's flight ids are
// written to the departure's outbound/inbound array — the stored shape is
// unchanged. Uses useWatch + setValue on the typed `departures` path since RHF
// can't statically resolve runtime indices into a primitive string[].
export function JourneySearchPicker({
  departureIndex,
  direction,
  label,
  airportOptions,
  flights,
}: {
  departureIndex: number;
  direction: Direction;
  label: string;
  airportOptions: ComboboxOption[];
  flights: Flight[];
}) {
  const t = useTranslations('flightSearch');
  const locale = useLocale();
  const { setValue } = useFormContext<CreateFlightHotelPackageInput>();
  const departures = useWatch<CreateFlightHotelPackageInput>({
    name: 'departures',
  }) as Departures | undefined;
  const departure = departures?.[departureIndex];
  const ids = departure?.[direction] ?? [];

  const flightById = useMemo(
    () => new Map(flights.map((f) => [f.id, f])),
    [flights],
  );
  const selectedFlights = ids
    .map((id) => flightById.get(id))
    .filter((f): f is Flight => Boolean(f));

  // The inbound leg defaults to the reverse of the chosen outbound route.
  const outboundIds = departure?.outboundFlightIds ?? [];
  const reverseRoute = useMemo(() => {
    if (direction !== 'inboundFlightIds') return null;
    const first = flightById.get(outboundIds[0] ?? '');
    const last = flightById.get(outboundIds[outboundIds.length - 1] ?? '');
    if (!first || !last) return null;
    return { origin: last.destAirport, dest: first.originAirport };
  }, [direction, outboundIds, flightById]);

  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [params, setParams] = useState<{
    originAirport: string;
    destAirport: string;
  } | null>(null);
  const [editing, setEditing] = useState(ids.length === 0);

  // Pre-fill the inbound fields from the outbound route while still untouched.
  useEffect(() => {
    if (reverseRoute && !origin && !dest) {
      setOrigin(reverseRoute.origin);
      setDest(reverseRoute.dest);
    }
  }, [reverseRoute, origin, dest]);

  const { data: journeys, isFetching } = useSearchFlights(
    params ?? { originAirport: '', destAirport: '' },
    { query: { enabled: Boolean(params) } },
  );

  const selectJourney = (journey: FlightItinerary) => {
    const current = departures ?? [];
    const existing = current[departureIndex];
    if (!existing) return;
    const updated: Departures = [
      ...current.slice(0, departureIndex),
      { ...existing, [direction]: journey.flights.map((f) => f.id) },
      ...current.slice(departureIndex + 1),
    ];
    setValue('departures', updated, { shouldDirty: true });
    setEditing(false);
  };

  return (
    <FormItem className="gap-2">
      <FormLabel>{label}</FormLabel>

      {!editing && selectedFlights.length > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 p-3">
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-sm">
              {flightNumbers(selectedFlights)}
            </p>
            <p className="text-xs text-muted-foreground">
              {routePath(selectedFlights)}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            {t('changeJourney')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-border/60 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LabeledCombobox
              label={t('originAirport')}
              options={airportOptions}
              value={origin}
              onChange={setOrigin}
            />
            <LabeledCombobox
              label={t('destAirport')}
              options={airportOptions}
              value={dest}
              onChange={setDest}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-fit"
            disabled={!origin || !dest}
            loading={isFetching}
            onClick={() =>
              setParams({ originAirport: origin, destAirport: dest })
            }
          >
            {t('searchButton')}
          </Button>

          {params && !isFetching && (journeys?.length ?? 0) === 0 && (
            <p className="text-xs text-muted-foreground">{t('noResults')}</p>
          )}
          {journeys && journeys.length > 0 && (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {journeys.map((journey) => (
                <JourneyRow
                  key={journey.flights.map((f) => f.id).join('-')}
                  journey={journey}
                  locale={locale}
                  t={t}
                  onSelect={() => selectJourney(journey)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </FormItem>
  );
}
