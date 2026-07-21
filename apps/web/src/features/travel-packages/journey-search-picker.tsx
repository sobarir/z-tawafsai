'use client';

import type {
  Airport,
  CreateFlightHotelPackageInput,
  Flight,
  FlightItinerary,
} from '@repo/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ItineraryVisual } from '@/components/shared/itinerary-visual';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useSearchFlights } from '@/libs/api/generated/endpoints';
import { toAirportOptions } from '@/libs/combobox-options';
import { formatCurrency } from '@/libs/format-currency';
import {
  buildDisplayItinerary,
  journeyFlightNumbers,
} from '@/libs/journey-display';

type Direction = 'outboundFlightIds' | 'inboundFlightIds';
type Departures = NonNullable<CreateFlightHotelPackageInput['departures']>;

function JourneyResult({
  journey,
  locale,
  onSelect,
}: {
  journey: FlightItinerary;
  locale: string;
  onSelect: () => void;
}) {
  const first = journey.flights[0];
  const last = journey.flights[journey.flights.length - 1];
  if (!first || !last) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-1 rounded-md border border-border/60 p-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-sm">
          {journeyFlightNumbers(journey.flights)}
        </span>
        <span className="font-semibold text-primary">
          {formatCurrency(journey.totalPrice, journey.currency, locale)}
        </span>
      </div>
      <ItineraryVisual
        departureTimeLocal={journey.departureTimeLocal}
        originAirport={first.originAirport}
        arrivalTimeLocal={journey.arrivalTimeLocal}
        arrivalDayOffset={journey.arrivalDayOffset}
        destAirport={last.destAirport}
        durationMins={journey.totalDurationMinutes}
        stops={journey.stopCount}
      />
    </button>
  );
}

// Composes a departure's flights (outbound/inbound) via an OTA-style route
// search in a popup: enter origin/destination airports, search, and pick a
// whole journey. The chosen journey's flight ids are written to the departure's
// array — the stored shape is unchanged. Uses useWatch + setValue on the typed
// `departures` path since RHF can't statically resolve a runtime index into a
// primitive string[].
export function JourneySearchPicker({
  departureIndex,
  direction,
  label,
  airports,
  flights,
}: {
  departureIndex: number;
  direction: Direction;
  label: string;
  airports: Airport[];
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

  const airportOptions = useMemo(() => toAirportOptions(airports), [airports]);
  const tzByAirport = useMemo(
    () => new Map(airports.map((a) => [a.airportCode, a.timezone])),
    [airports],
  );
  const flightById = useMemo(
    () => new Map(flights.map((f) => [f.id, f])),
    [flights],
  );

  const selectedFlights = ids
    .map((id) => flightById.get(id))
    .filter((f): f is Flight => Boolean(f));
  const selected =
    selectedFlights.length > 0
      ? buildDisplayItinerary(selectedFlights, tzByAirport)
      : null;

  // The inbound leg defaults to the reverse of the chosen outbound route.
  const outboundIds = departure?.outboundFlightIds ?? [];
  const reverseRoute = useMemo(() => {
    if (direction !== 'inboundFlightIds') return null;
    const first = flightById.get(outboundIds[0] ?? '');
    const last = flightById.get(outboundIds[outboundIds.length - 1] ?? '');
    if (!first || !last) return null;
    return { origin: last.destAirport, dest: first.originAirport };
  }, [direction, outboundIds, flightById]);

  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [params, setParams] = useState<{
    originAirport: string;
    destAirport: string;
  } | null>(null);

  const { data: journeys, isFetching } = useSearchFlights(
    params ?? { originAirport: '', destAirport: '' },
    { query: { enabled: Boolean(params) } },
  );

  const openDialog = () => {
    // Pre-fill the inbound route from the outbound while the fields are untouched.
    if (reverseRoute && !origin && !dest) {
      setOrigin(reverseRoute.origin);
      setDest(reverseRoute.dest);
    }
    setOpen(true);
  };

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
    setOpen(false);
  };

  return (
    <FormItem className="gap-2">
      <FormLabel>{label}</FormLabel>

      {selected ? (
        <div className="flex items-center gap-3 rounded-md border border-border/60 p-2">
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-semibold text-sm">
              {journeyFlightNumbers(selectedFlights)}
            </span>
            <ItineraryVisual {...selected} />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={openDialog}
          >
            {t('changeJourney')}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={openDialog}
        >
          {t('searchButton')}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
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
              <p className="text-sm text-muted-foreground">{t('noResults')}</p>
            )}
            {journeys && journeys.length > 0 && (
              <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
                {journeys.map((journey) => (
                  <JourneyResult
                    key={journey.flights.map((f) => f.id).join('-')}
                    journey={journey}
                    locale={locale}
                    onSelect={() => selectJourney(journey)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </FormItem>
  );
}
