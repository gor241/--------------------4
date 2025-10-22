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

// Нормализация кода валюты: верхний регистр, без пробелов
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

// Получение списка поддерживаемых валют (база первая)
export function getSupportedCodesFromRates(
  rates: Record<string, number>,
  base: string,
): string[] {
  const candidates = [base, ...Object.keys(rates)];

  return dedupeNormalizedCodes(candidates);
}

// Получение метаданных валюты с фолбэком для неизвестных кодов
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

// Формирование списка валют для отображения с опциональной сортировкой
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

// Проверка наличия валюты в справочнике
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
