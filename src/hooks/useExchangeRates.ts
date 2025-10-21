import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchRates } from '@/api/ratesService';
import { convertAmount, deriveRate } from '@/lib/convert';
import {
  DEFAULT_CACHE_TTL,
  RATES_CACHE_KEY,
  buildCachedRates,
  isExpired,
} from '@/lib/cache';
import { useLocalStorage } from './useLocalStorage';
import type { CachedRates } from '@/types/rates';

export type ExchangeStatus = 'idle' | 'loading' | 'success' | 'error';

export function useExchangeRates(
  base: string,
  symbols: string[],
): {
  status: ExchangeStatus;
  error: string | null;
  rates: CachedRates | null;
  refresh: () => Promise<void>;
  convert: (
    amount: number,
    from: string,
    to: string,
  ) => {
    rate: number | null;
    result: number | null;
  };
} {
  const [rates, setRates] = useLocalStorage<CachedRates | null>(RATES_CACHE_KEY, null);
  const [status, setStatus] = useState<ExchangeStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const shouldRefresh = useMemo(() => {
    if (!rates) {
      return true;
    }

    const relevantCodes = new Set([base, ...symbols]);
    const missing = Array.from(relevantCodes).some(
      (code) => rates.rates[code] === undefined && rates.base !== code,
    );

    return (
      rates.base !== base || missing || isExpired(rates.timestamp, DEFAULT_CACHE_TTL)
    );
  }, [base, rates, symbols]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    setError(null);

    try {
      const payload = await fetchRates({ base, symbols });
      const nextRates = buildCachedRates(payload);
      setRates(nextRates);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to fetch rates');
    }
  }, [base, setRates, symbols]);

  useEffect(() => {
    if (shouldRefresh) {
      void refresh();
    }
  }, [refresh, shouldRefresh]);

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      if (!rates) {
        return { rate: null, result: null };
      }

      const rate = deriveRate(from, to, rates);
      const result = convertAmount(amount, rate);

      return { rate, result };
    },
    [rates],
  );

  return {
    status,
    error,
    rates,
    refresh,
    convert,
  };
}
