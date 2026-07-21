/** Elapsed time between two ISO instants as "Xh Ym" — timezone-agnostic (absolute instants). */
export function formatDuration(startIso: string, endIso: string): string {
  const totalMinutes = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000,
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

/** A raw minute count as "Xh Ym" ("Ym" under an hour, "0m" for non-positive). */
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
