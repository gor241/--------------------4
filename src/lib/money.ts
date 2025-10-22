import { CURRENCY_BY_CODE } from '@/data/currencies';

const DEFAULT_FRACTION_DIGITS = 2;
const MAX_FRACTION_DIGITS = 6;

// Округление до шага (например, 0.05 для CHF), компенсирует погрешность FP
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

// Форматирование денежной суммы с учётом метаданных валюты
export function formatMoney(
  value: number,
  code: string,
  opts?: {
    digits?: number;
    locale?: string;
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
