import { useCallback, useMemo, useState } from 'react';

import { useOnlineStatus } from '@/app/providers/OnlineProvider';
import { AmountInput } from '@/components/AmountInput';
import { CurrencySelect } from '@/components/CurrencySelect';
import { NetworkBadge } from '@/components/NetworkBadge';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ResultBlock } from '@/components/ResultBlock';
import { Skeleton } from '@/components/Skeleton';
import { SwapButton } from '@/components/SwapButton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { convert } from '@/lib/convert';
import { getSupportedCodesFromRates, makeDisplayList } from '@/lib/currencyList';
import { parseAmount } from '@/lib/format';

const DEFAULT_FROM = 'EUR';
const DEFAULT_TO = 'USD';
const DEFAULT_AMOUNT = '1';

export function Converter(): JSX.Element {
  const { online, lastChangedAt } = useOnlineStatus();
  const { data, updatedAt, loading, error, reload } = useExchangeRates(online);

  const [from, setFrom] = useLocalStorage('cc-from', DEFAULT_FROM);
  const [to, setTo] = useLocalStorage('cc-to', DEFAULT_TO);
  const [amountRaw, setAmountRaw] = useLocalStorage('cc-amount', DEFAULT_AMOUNT);

  const debouncedAmount = useDebouncedValue(amountRaw);
  const parsedAmount = useMemo(() => parseAmount(debouncedAmount), [debouncedAmount]);

  const supportedCodes = useMemo(() => {
    if (!data) {
      return [] as string[];
    }

    return getSupportedCodesFromRates(data.rates, data.base);
  }, [data]);

  const currencies = useMemo(() => {
    if (supportedCodes.length === 0) {
      return [];
    }

    return makeDisplayList(supportedCodes, { sort: 'alpha' });
  }, [supportedCodes]);

  const supportedSet = useMemo(() => new Set(supportedCodes), [supportedCodes]);
  const fromSupported = !data || supportedSet.has(from);
  const toSupported = !data || supportedSet.has(to);

  const result = useMemo(() => {
    if (!data) {
      return null;
    }

    if (Number.isNaN(parsedAmount) || !Number.isFinite(parsedAmount)) {
      return null;
    }

    if (!fromSupported || !toSupported) {
      return null;
    }

    try {
      return convert({
        amount: parsedAmount,
        from,
        to,
        base: data.base,
        rates: data.rates,
      });
    } catch {
      return null;
    }
  }, [data, from, fromSupported, parsedAmount, to, toSupported]);

  const unsupportedMessage = useMemo(() => {
    if (!data) {
      return null;
    }

    if (!fromSupported) {
      return `Currency ${from} is not available in the latest rates.`;
    }

    if (!toSupported) {
      return `Currency ${to} is not available in the latest rates.`;
    }

    return null;
  }, [data, from, fromSupported, to, toSupported]);

  const [isReloading, setIsReloading] = useState(false);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmountRaw(value);
    },
    [setAmountRaw],
  );

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, setFrom, setTo, to]);

  const handleReload = useCallback(async () => {
    setIsReloading(true);

    try {
      await reload();
    } finally {
      setIsReloading(false);
    }
  }, [reload]);

  const shouldShowError = !loading && (error || unsupportedMessage);
  const errorMessage = error ?? unsupportedMessage;
  const timestamp = updatedAt ?? lastChangedAt;

  return (
    <div className="container">
      <header className="header-row">
        <NetworkBadge online={online} updatedAt={updatedAt} />
        <button
          type="button"
          onClick={handleReload}
          disabled={isReloading}
          aria-disabled={isReloading}
          className="converter__refresh"
        >
          {isReloading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {!online ? <OfflineBanner updatedAt={timestamp ?? null} /> : null}

      <main className="card">
        <AmountInput value={amountRaw} onChange={handleAmountChange} />

        <div className="currency-row">
          <CurrencySelect value={from} onChange={setFrom} currencies={currencies} />
          <SwapButton onClick={handleSwap} />
          <CurrencySelect value={to} onChange={setTo} currencies={currencies} />
        </div>

        {loading ? (
          <Skeleton lines={2} />
        ) : shouldShowError ? (
          <div role="alert" className="converter__error">
            {errorMessage}
          </div>
        ) : (
          <ResultBlock value={result} code={to} />
        )}
      </main>
    </div>
  );
}
