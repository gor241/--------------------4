import { CURRENCY_BY_CODE } from '@/data/currencies';

const DEFAULT_FRACTION_DIGITS = 2;
const MAX_FRACTION_DIGITS = 6;

/**
 * Round value to the nearest increment (e.g., CHF 0.05).
 * - If increment <= 0 or not finite, return the original value.
 * - Works with negative values.
 * - Must mitigate common FP errors (e.g., 1.005 -> 1.01).
 */
export function roundToIncrement(value: number, increment: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }

  if (!Number.isFinite(increment) || increment <= 0) {
    return value;
  }

  const step = Math.round(1 / increment);

  if (!Number.isFinite(step) || step === 0) {
    return value;
  }

  const scaled = value * step;
  const rounded = Math.round(scaled);
  const result = rounded / step;

  return Number.parseFloat(result.toFixed(10));
}

/**
 * Format a monetary amount based on currency metadata.
 * - Uses currency metadata (decimalDigits, rounding) from data/currencies.json.
 * - Applies rounding increment first (if > 0 and not disabled), then formats with Intl.NumberFormat.
 * - Does NOT prepend symbols; returns only the localized numeric string.
 * - If value is not finite, return an empty string "" (UI decides placeholder).
 */
export function formatMoney(
  value: number,
  code: string,
  opts?: {
    /** Override fraction digits; falls back to metadata.decimalDigits; default 2 if metadata missing */
    digits?: number;
    /** Locale for Intl.NumberFormat; default undefined (UA locale) */
    locale?: string;
    /** If false, skip increment rounding even if metadata.rounding > 0 */
    useRounding?: boolean;
  },
): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  const normalizedCode = code.toUpperCase();
  const meta = CURRENCY_BY_CODE[normalizedCode];

  const digitsOption =
    typeof opts?.digits === 'number'
      ? opts.digits
      : (meta?.decimalDigits ?? DEFAULT_FRACTION_DIGITS);
  const digits = clamp(digitsOption, 0, MAX_FRACTION_DIGITS);

  const roundingEnabled = opts?.useRounding !== false;
  const increment = roundingEnabled ? (meta?.rounding ?? 0) : 0;

  const roundedValue = increment > 0 ? roundToIncrement(value, increment) : value;

  return new Intl.NumberFormat(opts?.locale, {
    minimumFractionDigits: Math.min(digits, MAX_FRACTION_DIGITS),
    maximumFractionDigits: Math.min(digits, MAX_FRACTION_DIGITS),
  }).format(roundedValue);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
