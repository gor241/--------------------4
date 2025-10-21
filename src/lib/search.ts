import type { CurrencyMeta } from '@/types/currencyMeta';

export function filterCurrencies(list: CurrencyMeta[], query: string): CurrencyMeta[] {
  if (!query.trim()) {
    return list;
  }

  const normalized = query.trim().toLowerCase();

  return list.filter((currency) => {
    const tokens = [
      currency.code,
      currency.name,
      currency.symbol ?? '',
      currency.symbolNative ?? '',
    ];
    return tokens.some((token) => token?.toLowerCase().includes(normalized));
  });
}
