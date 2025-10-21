const DECIMAL_SEPARATORS = /[.,]/g;

/**
 * Parse user-entered amount supporting both "." and "," as decimal separators.
 * Handles common thousand separators and whitespace.
 * Returns NaN if the input cannot be parsed into a finite number.
 */
export function parseAmount(input: string): number {
  const trimmed = input.trim();

  if (trimmed === '') {
    return Number.NaN;
  }

  const withoutSpaces = trimmed.replace(/\u00A0/g, '').replace(/\s+/g, '');

  if (withoutSpaces === '') {
    return Number.NaN;
  }

  let sign = '';
  let numericPart = withoutSpaces;

  if (numericPart[0] === '+' || numericPart[0] === '-') {
    sign = numericPart[0];
    numericPart = numericPart.slice(1);
  }

  if (numericPart === '' || numericPart.includes('+') || numericPart.includes('-')) {
    return Number.NaN;
  }

  const lastDot = numericPart.lastIndexOf('.');
  const lastComma = numericPart.lastIndexOf(',');
  let decimalIndex: number | null = null;

  if (lastDot !== -1 && lastComma !== -1) {
    decimalIndex = Math.max(lastDot, lastComma);
  } else if (lastDot !== -1) {
    decimalIndex = lastDot;
  } else if (lastComma !== -1) {
    decimalIndex = lastComma;
  }

  const normalized = normalizeNumberString(numericPart, decimalIndex);

  if (normalized === '') {
    return Number.NaN;
  }

  const numericValue = Number(`${sign}${normalized}`);

  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function normalizeNumberString(value: string, decimalIndex: number | null): string {
  if (decimalIndex === null) {
    return value.replace(DECIMAL_SEPARATORS, '');
  }

  const integerPart = value.slice(0, decimalIndex).replace(DECIMAL_SEPARATORS, '');
  const fractionalPart = value.slice(decimalIndex + 1).replace(DECIMAL_SEPARATORS, '');

  return fractionalPart === '' ? integerPart : `${integerPart}.${fractionalPart}`;
}

/**
 * Localized number formatting with sane defaults.
 * - Defaults: maximumFractionDigits = 2, minimumFractionDigits = 0, locale = undefined (user agent)
 * - Does not apply currency-specific rounding (that happens in money.ts)
 */
export function formatNumber(
  value: number,
  opts?: {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    locale?: string;
  },
): string {
  const { maximumFractionDigits = 2, minimumFractionDigits = 0, locale } = opts ?? {};

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(value);
}
