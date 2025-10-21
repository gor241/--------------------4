import { describe, expect, it } from 'vitest';
import { formatMoney, roundToIncrement } from '../../src/lib/money';

describe('roundToIncrement', () => {
  it('rounds up to the nearest increment when above midpoint', () => {
    const result = roundToIncrement(1.03, 0.05);

    expect(result).toBeCloseTo(1.05, 6);
  });

  it('rounds down to the nearest increment when below midpoint', () => {
    const result = roundToIncrement(1.02, 0.05);

    expect(result).toBeCloseTo(1.0, 6);
  });

  it('returns zero unchanged when value is zero', () => {
    const result = roundToIncrement(0, 0.05);

    expect(result).toBe(0);
  });

  it('handles negative numbers symmetrically', () => {
    const up = roundToIncrement(-1.03, 0.05);
    const down = roundToIncrement(-1.02, 0.05);

    expect(up).toBeCloseTo(-1.05, 6);
    expect(down).toBeCloseTo(-1.0, 6);
  });

  it('returns original value when increment is non-positive', () => {
    const negativeIncrement = roundToIncrement(1.23, -0.01);
    const zeroIncrement = roundToIncrement(1.23, 0);

    expect(negativeIncrement).toBeCloseTo(1.23, 6);
    expect(zeroIncrement).toBeCloseTo(1.23, 6);
  });
});

describe('formatMoney', () => {
  it('uses currency metadata decimal digits when formatting', () => {
    const formatted = formatMoney(1234.56, 'JPY', { locale: 'en-US' });

    expect(formatted).toBe('1,235');
  });

  it('applies rounding increment before formatting', () => {
    const formatted = formatMoney(1.03, 'CHF', { locale: 'en-US' });

    expect(formatted).toBe('1.05');
  });

  it('returns empty string when value is not finite', () => {
    expect(formatMoney(Number.NaN, 'USD')).toBe('');
    expect(formatMoney(Number.POSITIVE_INFINITY, 'USD')).toBe('');
  });
});
