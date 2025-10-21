import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CurrencyMeta } from '../../src/lib/currencyList';
import { CurrencyModal } from '../../src/components/CurrencyModal';

const currencies: CurrencyMeta[] = [
  {
    code: 'EUR',
    name: 'Euro',
    namePlural: 'Euros',
    symbol: '€',
    symbolNative: '€',
    decimalDigits: 2,
    rounding: 0,
    countryCodeISO2: 'EU',
    flagSrc: '',
  },
  {
    code: 'USD',
    name: 'US Dollar',
    namePlural: 'US dollars',
    symbol: '$',
    symbolNative: '$',
    decimalDigits: 2,
    rounding: 0,
    countryCodeISO2: 'US',
    flagSrc: '',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    namePlural: 'British pounds',
    symbol: '£',
    symbolNative: '£',
    decimalDigits: 2,
    rounding: 0,
    countryCodeISO2: 'GB',
    flagSrc: '',
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    namePlural: 'Japanese yen',
    symbol: '¥',
    symbolNative: '¥',
    decimalDigits: 0,
    rounding: 0,
    countryCodeISO2: 'JP',
    flagSrc: '',
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    namePlural: 'Swiss francs',
    symbol: 'Fr',
    symbolNative: 'Fr',
    decimalDigits: 2,
    rounding: 0.05,
    countryCodeISO2: 'CH',
    flagSrc: '',
  },
];

function setup() {
  const onClose = vi.fn();
  const onSelect = vi.fn();

  render(
    <CurrencyModal
      open
      onClose={onClose}
      onSelect={onSelect}
      selectedCode="EUR"
      list={currencies}
    />,
  );

  const search = screen.getByRole('textbox', { name: /search currency/i });
  const listbox = screen.getByRole('listbox');

  return { search, listbox, onClose, onSelect };
}

describe('CurrencyModal accessibility and interactions', () => {
  it('focuses search input when opened', () => {
    const { search } = setup();

    expect(search).toHaveFocus();
  });

  it('filters by code and name case-insensitively', async () => {
    const { search } = setup();
    const user = userEvent.setup();

    await user.type(search, 'usd');
    expect(screen.getByRole('option', { name: /US Dollar/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Euro/i })).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'yen');
    expect(screen.getByRole('option', { name: /Japanese Yen/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /US Dollar/i })).not.toBeInTheDocument();
  });

  it('updates active option via arrow keys', async () => {
    const { listbox } = setup();
    const user = userEvent.setup();

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(listbox).toHaveAttribute('aria-activedescendant', expect.stringContaining('USD'));
    });

    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(listbox).toHaveAttribute('aria-activedescendant', expect.stringContaining('GBP'));
    });

    await user.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(listbox).toHaveAttribute('aria-activedescendant', expect.stringContaining('USD'));
    });
  });

  it('selects active option on Enter and triggers callbacks', async () => {
    const { listbox, onClose, onSelect } = setup();
    const user = userEvent.setup();

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith('GBP');
      expect(onClose).toHaveBeenCalled();
      expect(listbox).toHaveAttribute('aria-activedescendant', expect.stringContaining('GBP'));
    });
  });

  it('closes on Escape without selecting', async () => {
    const { onClose, onSelect } = setup();
    const user = userEvent.setup();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  it('provides dialog and listbox roles with aria attributes', () => {
    setup();

    const dialog = screen.getByRole('dialog', { name: /select currency/i });
    const listbox = screen.getByRole('listbox');
    const options = screen.getAllByRole('option');

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(listbox.id).toBeTruthy();
    expect(options[0]).toHaveAttribute('aria-selected');
    options.forEach((option) => {
      expect(option.id).toContain(listbox.id);
    });
  });
});
