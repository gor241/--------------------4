import { CURRENCY_BY_CODE } from '@/data/currencies';

export interface CurrencyMeta {
  code: string;
  name: string;
  namePlural: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  rounding: number;
  countryCodeISO2: string;
  flagSrc: string;
}

type SortMode = 'none' | 'alpha';

const currencyByCode = CURRENCY_BY_CODE as Record<string, CurrencyMeta>;

/**
 * Normalize a currency code to uppercase without surrounding whitespace.
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Collect supported currency codes from API rates, keeping the base first.
 */
export function getSupportedCodesFromRates(
  rates: Record<string, number>,
  base: string,
): string[] {
  const candidates = [base, ...Object.keys(rates)];

  return dedupeNormalizedCodes(candidates);
}

/**
 * Return display metadata for the provided code, using fallback values when unknown.
 */
export function makeDisplayMeta(code: string): CurrencyMeta {
  const normalized = normalizeCode(code);
  const meta = currencyByCode[normalized];

  if (meta) {
    return meta;
  }

  return {
    code: normalized,
    name: normalized,
    namePlural: normalized,
    symbol: normalized,
    symbolNative: normalized,
    decimalDigits: 2,
    rounding: 0,
    countryCodeISO2: '',
    flagSrc: '',
  };
}

/**
 * Build a display-ready list of currency metadata from API codes.
 */
export function makeDisplayList(
  apiCodes: string[],
  opts?: {
    sort?: SortMode;
  },
): CurrencyMeta[] {
  const normalizedCodes = dedupeNormalizedCodes(apiCodes);
  const metadata = normalizedCodes.map(makeDisplayMeta);
  const sortMode: SortMode = opts?.sort ?? 'none';

  if (sortMode === 'alpha') {
    return [...metadata].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
  }

  return metadata;
}

/**
 * Determine whether the provided code exists in the currency metadata map.
 */
export function isKnownCurrency(code: string): boolean {
  const normalized = normalizeCode(code);

  return Boolean(currencyByCode[normalized]);
}

function dedupeNormalizedCodes(codes: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const code of codes) {
    const normalized = normalizeCode(code);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}
