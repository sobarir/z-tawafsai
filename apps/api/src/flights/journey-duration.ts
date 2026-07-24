// Schedule search is date-agnostic, but converting a local wall-clock time to a
// UTC instant needs a date to resolve the zone's offset. A fixed reference keeps
// durations deterministic; it is exact for the DST-free corridors this serves
// and at most an hour off near a DST boundary elsewhere.
const DURATION_REFERENCE = new Date('2025-06-15T12:00:00Z');
const MINUTES_PER_DAY = 24 * 60;

/** Minutes past local midnight for an HH:MM wall-clock time. */
export function parseLocalTime(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Minutes east of UTC for an IANA zone at the reference instant. */
export function tzOffsetMinutes(
  timeZone: string,
  at: Date = DURATION_REFERENCE,
): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/**
 * Elapsed minutes from first departure to final arrival across timezones:
 * (arrivalLocal - departureLocal) + dayOffset*1440 - (destOffset - originOffset).
 * Falls back to a same-zone estimate when an airport has no known timezone.
 */
export function journeyDurationMinutes(
  originAirport: string,
  departureTimeLocal: string,
  destAirport: string,
  arrivalTimeLocal: string,
  arrivalDayOffset: number,
  tzByAirport: Map<string, string>,
): number {
  const localSpan =
    parseLocalTime(arrivalTimeLocal) +
    arrivalDayOffset * MINUTES_PER_DAY -
    parseLocalTime(departureTimeLocal);
  const originTz = tzByAirport.get(originAirport);
  const destTz = tzByAirport.get(destAirport);
  if (!originTz || !destTz) return localSpan;
  return localSpan - (tzOffsetMinutes(destTz) - tzOffsetMinutes(originTz));
}
