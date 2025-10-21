import type { ChangeEvent, KeyboardEvent } from 'react';

import type { CurrencyMeta } from '@/types/currencyMeta';

type CurrencyModalProps = {
  isOpen: boolean;
  currencies: CurrencyMeta[];
  selectedCode?: string;
  query: string;
  highlightedIndex?: number;
  onQueryChange: (value: string) => void;
  onSelect: (code: string) => void;
  onClose: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function CurrencyModal({
  isOpen,
  currencies,
  selectedCode,
  query,
  highlightedIndex,
  onQueryChange,
  onSelect,
  onClose,
  onKeyDown,
}: CurrencyModalProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" onKeyDown={onKeyDown} tabIndex={-1}>
      <header>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onQueryChange(event.target.value)
          }
          placeholder="Search currency"
        />
        <button type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <ul role="listbox">
        {currencies.map((currency, index) => (
          <li key={currency.code}>
            <button
              type="button"
              onClick={() => onSelect(currency.code)}
              aria-selected={currency.code === selectedCode}
              data-highlighted={index === highlightedIndex}
              role="option"
            >
              <span>{currency.code}</span>
              <span>{currency.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
