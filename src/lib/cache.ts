import type { CachedRates, RatesPayload } from '@/types/rates';

export const RATES_CACHE_KEY = 'converter::rates';
export const SETTINGS_CACHE_KEY = 'converter::settings';
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

export function isExpired(timestamp: number, ttl = DEFAULT_CACHE_TTL): boolean {
  return Date.now() - timestamp > ttl;
}

export function buildCachedRates(
  payload: RatesPayload,
  timestamp = Date.now(),
): CachedRates {
  return {
    ...payload,
    timestamp,
  };
}
