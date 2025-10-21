import { useEffect, useMemo, useState } from 'react';

import { AmountInput } from '@/components/AmountInput';
import { CurrencyModal } from '@/components/CurrencyModal';
import { CurrencySelect } from '@/components/CurrencySelect';
import { NetworkBadge } from '@/components/NetworkBadge';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ResultBlock } from '@/components/ResultBlock';
import { Skeleton } from '@/components/Skeleton';
import { SwapButton } from '@/components/SwapButton';
import { useOnlineStatus } from '@/app/providers/OnlineProvider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useKeyboardListNav } from '@/hooks/useKeyboardListNav';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import currenciesData from '@/data/currencies.json';
import { parseAmount } from '@/lib/money';
import { filterCurrencies } from '@/lib/search';
import type { CurrencyMeta } from '@/types/currencyMeta';

const DEFAULT_PAIR: { from: string; to: string } = { from: 'USD', to: 'EUR' };
const DEFAULT_AMOUNT = '100';

export function Converter(): JSX.Element {
  const { online, lastChangedAt } = useOnlineStatus();
  const [amountInput, setAmountInput] = useLocalStorage<string>(
    'converter::amount',
    DEFAULT_AMOUNT,
  );
  const [pair, setPair] = useLocalStorage<{ from: string; to: string }>(
    'converter::pair',
    DEFAULT_PAIR,
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<'from' | 'to'>('from');
  const [modalQuery, setModalQuery] = useState('');

  const currencies = currenciesData as CurrencyMeta[];
  const filteredCurrencies = useMemo(
    () => filterCurrencies(currencies, modalQuery),
    [currencies, modalQuery],
  );

  const { highlightedIndex, handleKeyDown, setHighlightedIndex } = useKeyboardListNav(
    filteredCurrencies.length,
    (nextIndex) => {
      if (nextIndex === -1) {
        setModalOpen(false);
        return;
      }

      const currency = filteredCurrencies[nextIndex];
      if (currency) {
        handleCurrencySelect(currency.code);
      }
    },
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [modalQuery, filteredCurrencies.length, setHighlightedIndex]);

  const debouncedAmount = useDebouncedValue(amountInput);
  const numericAmount = useMemo(() => parseAmount(debouncedAmount), [debouncedAmount]);

  const { status, error, rates, refresh, convert } = useExchangeRates(pair.from, [
    pair.to,
  ]);
  const conversion = convert(numericAmount, pair.from, pair.to);

  function handleAmountChange(value: string) {
    setAmountInput(value);
  }

  function handleOpenModal(target: 'from' | 'to') {
    setModalTarget(target);
    setModalOpen(true);
    setModalQuery('');
    setHighlightedIndex(0);
  }

  function handleCurrencySelect(code: string) {
    const nextPair = { ...pair, [modalTarget]: code } as typeof pair;
    setPair(nextPair);
    setModalOpen(false);
    setModalQuery('');
  }

  function handleSwap() {
    setPair({ from: pair.to, to: pair.from });
  }

  function handleRefresh() {
    void refresh();
  }

  const selectedCurrency = modalTarget === 'from' ? pair.from : pair.to;

  return (
    <div>
      <header>
        <NetworkBadge online={online} lastChangedAt={lastChangedAt} />
      </header>

      <main>
        <section>
          <AmountInput value={amountInput} onChange={handleAmountChange} />
          <div>
            <CurrencySelect
              label="From"
              value={pair.from}
              onOpenModal={() => handleOpenModal('from')}
            />
            <SwapButton onSwap={handleSwap} />
            <CurrencySelect
              label="To"
              value={pair.to}
              onOpenModal={() => handleOpenModal('to')}
            />
          </div>
        </section>

        <section>
          {status === 'loading' && <Skeleton height="4rem" />}
          {status === 'error' && <p role="alert">{error}</p>}
          {status !== 'loading' && status !== 'error' && (
            <ResultBlock
              amount={numericAmount}
              from={pair.from}
              to={pair.to}
              converted={conversion.result}
              rate={conversion.rate}
            />
          )}
        </section>
      </main>

      <OfflineBanner visible={!online} timestamp={rates?.timestamp ?? lastChangedAt} />

      <CurrencyModal
        isOpen={isModalOpen}
        currencies={filteredCurrencies}
        selectedCode={selectedCurrency}
        query={modalQuery}
        highlightedIndex={highlightedIndex}
        onQueryChange={setModalQuery}
        onSelect={handleCurrencySelect}
        onClose={() => setModalOpen(false)}
        onKeyDown={handleKeyDown}
      />

      <button type="button" onClick={handleRefresh}>
        Refresh rates
      </button>

      <footer>
        <small>
          Last updated: {rates ? new Date(rates.timestamp).toLocaleString() : '—'}
        </small>
      </footer>
    </div>
  );
}
