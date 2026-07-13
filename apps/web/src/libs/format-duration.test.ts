import { describe, expect, it } from 'vitest';
import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('formats a same-day flight', () => {
    expect(formatDuration('2026-06-05T02:00:00Z', '2026-06-05T08:15:00Z')).toBe(
      '6h 15m',
    );
  });

  it('accounts for differing UTC offsets on each end', () => {
    // 09:00+07:00 -> 02:00Z; 17:15+09:00 -> 08:15Z; elapsed 6h15m.
    expect(
      formatDuration('2026-06-05T09:00:00+07:00', '2026-06-05T17:15:00+09:00'),
    ).toBe('6h 15m');
  });

  it('handles an overnight technical-stop flight spanning >24h', () => {
    // NH 10 CGK->LHR via BKK: 2026-06-01T01:00+07:00 (05-31T18:00Z) ->
    // 2026-06-01T20:00+01:00 (06-01T19:00Z) = 25h elapsed.
    expect(
      formatDuration('2026-06-01T01:00:00+07:00', '2026-06-01T20:00:00+01:00'),
    ).toBe('25h 0m');
  });
});
