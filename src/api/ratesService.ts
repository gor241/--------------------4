import { buildUrl, getJSON } from '@/api/http';
import type { RatesPayload } from '@/types/rates';

const DEFAULT_VATS_BASE = 'https://api.vatcomply.com';
const DEFAULT_FXRATES_BASE = 'https://api.fxratesapi.com';
const REQUEST_TIMEOUT_MS = 10_000;

export interface RatesResponse {
  base: string;
  rates: Record<string, number>;
}

type RatesSource = 'vats' | 'fxrates';

/**
 * Helper that returns the configured source id: 'vats' | 'fxrates'
 */
export function getRatesSource(): RatesSource {
  const flag = import.meta.env.VITE_RATES_API;
  return flag === 'fxrates' ? 'fxrates' : 'vats';
}

/**
 * Fetch latest FX rates from configured provider and normalize to { base, rates }.
 * - VATComply: GET {BASE}/rates  -> { base, rates }
 * - fxratesapi: GET {BASE}/latest?api_key=... -> { base, rates }
 * Throws Error with user-friendly message on failure.
 */
export async function fetchRates(signal?: AbortSignal): Promise<RatesResponse> {
  const source = getRatesSource();
  const baseEnv = import.meta.env.VITE_API_BASE;
  const baseUrl =
    baseEnv ?? (source === 'fxrates' ? DEFAULT_FXRATES_BASE : DEFAULT_VATS_BASE);
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = source === 'fxrates' ? '/latest' : '/rates';
  const apiKey = import.meta.env.VITE_API_KEY;
  const query = source === 'fxrates' && apiKey ? { api_key: apiKey } : undefined;
  const url = buildUrl(`${normalizedBase}${path}`, query);

  try {
    const payload = await getJSON<RatesPayload>(url, {
      timeoutMs: REQUEST_TIMEOUT_MS,
      signal,
    });

    if (!isValidRatesPayload(payload)) {
      throw new Error('Invalid rates payload');
    }

    return {
      base: payload.base,
      rates: payload.rates,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid rates payload') {
      throw error;
    }

    throw new Error('Unable to fetch exchange rates');
  }
}

function isValidRatesPayload(payload: unknown): payload is RatesResponse {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const maybe = payload as Partial<RatesResponse>;

  if (typeof maybe.base !== 'string' || maybe.base.trim().length === 0) {
    return false;
  }

  if (!maybe.rates || typeof maybe.rates !== 'object') {
    return false;
  }

  for (const value of Object.values(maybe.rates)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return false;
    }
  }

  return true;
}
