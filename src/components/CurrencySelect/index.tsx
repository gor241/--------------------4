import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

import type { CurrencyMeta } from '@/lib/currencyList';

const CurrencyModal = lazy(() =>
  import('@/components/CurrencyModal').then((module) => ({
    default: module.CurrencyModal,
  })),
);

type Props = {
  value: string;
  onChange: (code: string) => void;
  currencies: readonly CurrencyMeta[];
  label?: string;
};

export function CurrencySelect({
  value,
  onChange,
  currencies,
  label,
}: Props): JSX.Element {
  const [open, setOpen] = useState(false);

  const currentCurrency = useMemo(() => {
    const next = currencies.find((currency) => currency.code === value);

    if (next) {
      return next;
    }

    return {
      code: value,
      name: value,
    } as CurrencyMeta;
  }, [currencies, value]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
    },
    [onChange],
  );

  const ariaLabel = label ?? `Choose currency (${value})`;
  const { flagSrc, code, symbol } = currentCurrency;

  return (
    <>
      <button
        type="button"
        className="currency-select"
        onClick={handleOpen}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {flagSrc ? (
          <img
            src={flagSrc}
            alt=""
            aria-hidden="true"
            className="currency-select__flag"
          />
        ) : null}
        <span className="currency-select__code">{code}</span>
        {symbol ? <span className="currency-select__symbol">{symbol}</span> : null}
      </button>
      <Suspense fallback={null}>
        <CurrencyModal
          open={open}
          onClose={handleClose}
          list={currencies}
          selectedCode={value}
          onSelect={handleSelect}
        />
      </Suspense>
    </>
  );
}
