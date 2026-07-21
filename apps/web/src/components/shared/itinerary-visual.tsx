import { formatMinutes } from '@/libs/format-duration';
import { cn } from '@/libs/utils';

interface ItineraryVisualProps {
  departureTimeLocal: string;
  originAirport: string;
  arrivalTimeLocal: string;
  arrivalDayOffset: number;
  destAirport: string;
  durationMins: number;
  /** Total stops along the journey (connections + technical stops). */
  stops: number;
  /** Override the container classes (e.g. relax the datatable's min width). */
  className?: string;
}

/**
 * The OTA-style route strip used by the flights datatable and the travel-package
 * journey picker: departure time/airport, a connection line labelled with the
 * elapsed time and stop count, and arrival time/airport with a day-offset badge.
 */
export function ItineraryVisual({
  departureTimeLocal,
  originAirport,
  arrivalTimeLocal,
  arrivalDayOffset,
  destAirport,
  durationMins,
  stops,
  className,
}: ItineraryVisualProps) {
  const stopsText =
    stops <= 0 ? 'Nonstop' : `${stops} Stop${stops > 1 ? 's' : ''}`;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 w-full h-full py-2 min-w-[250px]',
        className,
      )}
    >
      {/* Origin */}
      <div className="flex flex-col items-center min-w-[50px]">
        <div className="text-lg font-bold leading-none">
          {departureTimeLocal}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {originAirport}
        </div>
      </div>

      {/* Connection Line */}
      <div className="flex flex-col flex-1 items-center justify-center -mt-1">
        <div className="text-xs text-muted-foreground mb-1">
          {formatMinutes(durationMins)}
        </div>
        <div className="w-full flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-border" />
          <div className="h-[2px] flex-1 bg-border" />
          <div className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>
        <div className="text-xs text-muted-foreground mt-1">{stopsText}</div>
      </div>

      {/* Destination */}
      <div className="flex flex-col items-center min-w-[50px]">
        <div className="text-lg font-bold leading-none flex items-start">
          {arrivalTimeLocal}
          {arrivalDayOffset > 0 && (
            <sup className="text-[10px] font-bold text-orange-600 ml-0.5 mt-0.5">
              +{arrivalDayOffset}
            </sup>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{destAirport}</div>
      </div>
    </div>
  );
}
