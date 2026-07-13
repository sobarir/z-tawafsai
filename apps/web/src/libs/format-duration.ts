/** Elapsed time between two ISO instants as "Xh Ym" — timezone-agnostic (absolute instants). */
export function formatDuration(startIso: string, endIso: string): string {
  const totalMinutes = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
