import { describe, expect, it } from 'vitest';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  it('formats a USD amount for en-US', () => {
    expect(formatCurrency(545, 'USD', 'en-US')).toBe('$545.00');
  });

  it("rounds to the currency's minor unit", () => {
    expect(formatCurrency(129.999, 'USD', 'en-US')).toBe('$130.00');
  });

  it("uses the given locale's formatting conventions", () => {
    expect(formatCurrency(1234.5, 'EUR', 'de-DE')).toBe('1.234,50 €');
  });
});
