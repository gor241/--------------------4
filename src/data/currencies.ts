import currencies from './currencies.json';
import type { CurrencyMeta } from '@/types/currencyMeta';

export const CURRENCIES = currencies as CurrencyMeta[];

export const CURRENCY_BY_CODE: Record<string, CurrencyMeta> = CURRENCIES.reduce<Record<string, CurrencyMeta>>(
  (acc, currency) => {
    acc[currency.code] = currency;
    return acc;
  },
  {},
);
