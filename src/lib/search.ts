/**
 * Filter a currency list by query, matching against code, name, or optional symbol while preserving order.
 * Returns the original list reference when the trimmed query is empty.
 */
export function filterCurrencies<
  T extends { code: string; name: string; symbol?: string },
>(query: string, list: readonly T[]): T[] {
  const trimmed = typeof query === 'string' ? query.trim() : '';

  if (trimmed.length === 0) {
    return list as T[];
  }

  const normalizedQuery = trimmed.toLowerCase();
  const matches: T[] = [];

  for (const item of list) {
    const codeMatches = item.code.toLowerCase().includes(normalizedQuery);
    const nameMatches = item.name.toLowerCase().includes(normalizedQuery);
    const symbolMatches =
      typeof item.symbol === 'string' &&
      item.symbol.toLowerCase().includes(normalizedQuery);

    if (codeMatches || nameMatches || symbolMatches) {
      matches.push(item);
    }
  }

  return matches;
}
