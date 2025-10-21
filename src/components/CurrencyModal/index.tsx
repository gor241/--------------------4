import { useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent, MutableRefObject } from 'react';

import type { CurrencyMeta } from '@/lib/currencyList';
import { filterCurrencies } from '@/lib/search';

type Props = {
  open: boolean;
  onClose: () => void;
  list: readonly CurrencyMeta[];
  selectedCode: string;
  onSelect: (code: string) => void;
};

type ActiveItemRef = MutableRefObject<HTMLLIElement | null>;

const ARIA_LABEL = 'Select currency';

export function CurrencyModal({
  open,
  onClose,
  list,
  selectedCode,
  onSelect,
}: Props): JSX.Element | null {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);
  const activeItemRef: ActiveItemRef = useRef<HTMLLIElement | null>(null);
  const dialogId = useId();
  const listboxId = `${dialogId}-listbox`;

  const filtered = useMemo(() => filterCurrencies(query, list), [query, list]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (searchRef.current) {
      searchRef.current.focus();
      searchRef.current.select();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (filtered.length === 0) {
      setActiveIndex(-1);
      return;
    }

    const selectedIndex = filtered.findIndex((item) => item.code === selectedCode);

    setActiveIndex((prev) => {
      if (selectedIndex >= 0) {
        return selectedIndex;
      }

      if (prev >= 0 && prev < filtered.length) {
        return prev;
      }

      return 0;
    });
  }, [filtered, open, selectedCode]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, filtered]);

  const selectAtIndex = useCallback(
    (index: number) => {
      const item = filtered[index];

      if (!item) {
        return;
      }

      onSelect(item.code);
      onClose();
    },
    [filtered, onClose, onSelect],
  );

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!open) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (filtered.length === 0) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();

        setActiveIndex((prev) => {
          const lastIndex = filtered.length - 1;

          if (lastIndex < 0) {
            return -1;
          }

          const current = prev >= 0 && prev <= lastIndex ? prev : 0;
          const nextIndex =
            event.key === 'ArrowDown'
              ? (current + 1) % filtered.length
              : (current - 1 + filtered.length) % filtered.length;

          return nextIndex;
        });

        if (listboxRef.current) {
          listboxRef.current.focus();
        }

        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();

        setActiveIndex((prev) => {
          if (prev >= 0 && prev < filtered.length) {
            selectAtIndex(prev);
            return prev;
          }

          if (filtered.length > 0) {
            selectAtIndex(0);
            return 0;
          }

          return prev;
        });
      }
    },
    [filtered, open, onClose, selectAtIndex],
  );

  const handleItemMouseEnter = useCallback((event: MouseEvent<HTMLLIElement>) => {
    const { index } = event.currentTarget.dataset;

    if (typeof index === 'string') {
      const parsed = Number.parseInt(index, 10);

      if (!Number.isNaN(parsed)) {
        setActiveIndex(parsed);
      }
    }
  }, []);

  const handleItemMouseDown = useCallback((event: MouseEvent<HTMLLIElement>) => {
    event.preventDefault();
  }, []);

  const handleItemClick = useCallback(
    (event: MouseEvent<HTMLLIElement>) => {
      const { code } = event.currentTarget.dataset;

      if (typeof code === 'string') {
        onSelect(code);
        onClose();
      }
    },
    [onClose, onSelect],
  );

  if (!open) {
    return null;
  }

  const activeId =
    activeIndex >= 0 && activeIndex < filtered.length
      ? `${listboxId}-option-${filtered[activeIndex].code}`
      : undefined;

  return (
    <div className="currency-modal__backdrop" role="presentation">
      <div
        className="currency-modal"
        role="dialog"
        aria-label={ARIA_LABEL}
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search currency"
          aria-label="Search currency"
        />
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={activeId}
        >
          {filtered.map((currency, index) => {
            const isSelected = currency.code === selectedCode;
            const isActive = index === activeIndex;

            return (
              <li
                key={currency.code}
                id={`${listboxId}-option-${currency.code}`}
                role="option"
                aria-selected={isSelected}
                data-code={currency.code}
                data-index={index}
                className={`currency-modal__item${isActive ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                onMouseEnter={handleItemMouseEnter}
                onMouseDown={handleItemMouseDown}
                onClick={handleItemClick}
                ref={isActive ? activeItemRef : undefined}
              >
                {currency.flagSrc ? (
                  <img
                    src={currency.flagSrc}
                    alt=""
                    aria-hidden="true"
                    className="currency-modal__flag"
                  />
                ) : null}
                <span className="currency-modal__name">{currency.name}</span>
                <span className="currency-modal__code">{currency.code}</span>
                {currency.symbol ? (
                  <span className="currency-modal__symbol">{currency.symbol}</span>
                ) : null}
              </li>
            );
          })}
          {filtered.length === 0 ? (
            <li className="currency-modal__empty" role="presentation">
              No currencies found.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
