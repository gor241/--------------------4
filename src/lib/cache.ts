import type { RatesPayload } from '@/types/rates';

export const RATES_CACHE_KEY = 'cc-rates-cache';
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export interface RatesResponse extends RatesPayload {
  base: string;
  rates: Record<string, number>;
}

export interface RatesCacheEntry {
  payload: RatesResponse;
  timestamp: number;
  api?: 'vats' | 'fxrates';
}

type WriteOptions = {
  api?: 'vats' | 'fxrates';
};

// Чтение кешированных курсов из LocalStorage
export function readRatesCache(): RatesCacheEntry | null {
  try {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    const raw = storage.getItem(RATES_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isValidCacheEntry(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    return null;
  }
}

// Запись курсов в кеш с отметкой времени
export function writeRatesCache(payload: RatesResponse, opts?: WriteOptions): boolean {
  try {
    const storage = getStorage();

    if (!storage) {
      return false;
    }

    const entry: RatesCacheEntry = {
      payload,
      timestamp: Date.now(),
      api: opts?.api,
    };

    storage.setItem(RATES_CACHE_KEY, JSON.stringify(entry));

    return true;
  } catch (error) {
    return false;
  }
}

// Проверка истечения TTL кеша
export function isExpired(
  timestamp: number,
  ttl: number = DEFAULT_CACHE_TTL,
  now: number = Date.now(),
): boolean {
  if (!Number.isFinite(timestamp)) {
    return true;
  }

  const safeNow = Number.isFinite(now) ? now : Date.now();
  const safeTtl = Number.isFinite(ttl) && ttl >= 0 ? ttl : DEFAULT_CACHE_TTL;

  return safeNow - timestamp > safeTtl;
}

// Очистка кешированных курсов
export function clearRatesCache(): boolean {
  try {
    const storage = getStorage();

    if (!storage) {
      return false;
    }

    storage.removeItem(RATES_CACHE_KEY);

    return true;
  } catch (error) {
    return false;
  }
}

function getStorage(): Storage | null {
  if (typeof globalThis === 'undefined') {
    return null;
  }

  const storage = (globalThis as { localStorage?: Storage | null }).localStorage;

  return storage ?? null;
}

function isValidCacheEntry(value: unknown): value is RatesCacheEntry {
  if (!isObject<Record<string, unknown>>(value)) {
    return false;
  }

  const { payload, timestamp } = value;

  if (!isObject<Record<string, unknown>>(payload)) {
    return false;
  }

  if (!isNumberRecord(payload.rates)) {
    return false;
  }

  if (typeof payload.base !== 'string' || payload.base.length === 0) {
    return false;
  }

  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return false;
  }

  if (
    'api' in value &&
    value.api !== undefined &&
    value.api !== 'vats' &&
    value.api !== 'fxrates'
  ) {
    return false;
  }

  return true;
}

function isObject<T extends Record<string, unknown>>(value: unknown): value is T {
  return typeof value === 'object' && value !== null;
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!isObject<Record<string, unknown>>(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) => typeof item === 'number' && Number.isFinite(item),
  );
}
