import { describe, expect, it } from 'vitest';
import { formatNumber, parseAmount } from '../../src/lib/format';

describe('parseAmount', () => {
  it('parses plain integers', () => {
    const result = parseAmount('123');

    expect(result).toBeCloseTo(123, 6);
  });

  it('parses US-style number with thousands separator', () => {
    const result = parseAmount('1,234.56');

    expect(result).toBeCloseTo(1234.56, 6);
  });

  it('parses EU-style number with swapped separators', () => {
    const result = parseAmount('1.234,56');

    expect(result).toBeCloseTo(1234.56, 6);
  });

  it('returns NaN for non-numeric strings', () => {
    const result = parseAmount('abc');

    expect(Number.isNaN(result)).toBe(true);
  });

  it('returns NaN for empty string', () => {
    const result = parseAmount('');

    expect(Number.isNaN(result)).toBe(true);
  });
});

describe('formatNumber', () => {
  it('formats numbers with default fraction digits', () => {
    const formatted = formatNumber(1234.5, { locale: 'en-US' });

    expect(formatted).toBe('1,234.5');
  });

  it('honors custom fraction digit configuration', () => {
    const formatted = formatNumber(12.3, {
      locale: 'en-US',
      maximumFractionDigits: 4,
      minimumFractionDigits: 2,
    });

    expect(formatted).toBe('12.30');
  });
});
