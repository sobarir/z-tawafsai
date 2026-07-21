import { describe, expect, it } from 'vitest';
import { journeyDurationMinutes, tzOffsetMinutes } from './journey-duration';

const tz = new Map<string, string>([
  ['CGK', 'Asia/Jakarta'],
  ['NRT', 'Asia/Tokyo'],
  ['LHR', 'Europe/London'],
]);

describe('tzOffsetMinutes', () => {
  it('returns minutes east of UTC for DST-free zones', () => {
    expect(tzOffsetMinutes('Asia/Jakarta')).toBe(420);
    expect(tzOffsetMinutes('Asia/Tokyo')).toBe(540);
  });
});

describe('journeyDurationMinutes', () => {
  it('accounts for the offset change on an eastbound leg', () => {
    // CGK 09:00 (+07) -> NRT 17:15 (+09): 8h15m local, 6h15m elapsed.
    expect(journeyDurationMinutes('CGK', '09:00', 'NRT', '17:15', 0, tz)).toBe(
      375,
    );
  });

  it('accounts for a large westbound offset swing', () => {
    // CGK 01:00 (+07) -> LHR 20:00 (BST +01): 19h local, 25h elapsed.
    expect(journeyDurationMinutes('CGK', '01:00', 'LHR', '20:00', 0, tz)).toBe(
      1500,
    );
  });

  it('adds a day for an overnight arrival', () => {
    // NRT 22:00 (+09) -> CGK 05:00 next day (+07): +2h offset west.
    expect(journeyDurationMinutes('NRT', '22:00', 'CGK', '05:00', 1, tz)).toBe(
      540,
    );
  });

  it('falls back to the local span when a timezone is unknown', () => {
    // XXX has no zone -> no offset correction, just local elapsed.
    expect(journeyDurationMinutes('CGK', '09:00', 'XXX', '17:15', 0, tz)).toBe(
      495,
    );
  });
});
