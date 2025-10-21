import { describe, expect, it } from 'vitest';
import { convert } from '../../src/lib/convert';

describe('convert', () => {
  const base = 'EUR';
  const rates = {
    USD: 1.1,
    GBP: 0.9,
  };

  it('returns original amount when from and to currency match', () => {
    const amount = 123.45;
    const result = convert({ amount, from: 'USD', to: 'USD', base, rates });

    expect(result).toBe(amount);
  });

  it('calculates cross currency conversion using base-relative rates', () => {
    const amount = 100;
    const result = convert({ amount, from: 'USD', to: 'GBP', base, rates });

    expect(result).toBeCloseTo(81.818181, 6);
  });

  it('throws when encountering an unknown currency code', () => {
    expect(() =>
      convert({ amount: 10, from: 'USD', to: 'JPY', base, rates }),
    ).toThrow('Unknown currency code');
  });

  it('treats base currency as rate 1 when converting from or to base', () => {
    const usdToBase = convert({ amount: 100, from: 'USD', to: base, base, rates });
    const baseToGbp = convert({ amount: 50, from: base, to: 'GBP', base, rates });

    expect(usdToBase).toBeCloseTo(90.909091, 6);
    expect(baseToGbp).toBeCloseTo(45, 6);
  });
});
