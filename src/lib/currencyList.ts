import type { CurrencyMeta } from '@/types/currencyMeta';

export type CurrencyDictionary = Record<string, CurrencyMeta>;

export function buildCurrencyDictionary(items: CurrencyMeta[]): CurrencyDictionary {
  return items.reduce<CurrencyDictionary>((acc, item) => {
    acc[item.code] = item;
    return acc;
  }, {});
}

export function getCurrency(
  dictionary: CurrencyDictionary,
  code: string,
): CurrencyMeta | undefined {
  return dictionary[code];
}
