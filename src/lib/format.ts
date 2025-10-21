export function formatNumber(
  value: number | null,
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {},
): string {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }

  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number | null,
  currency: string,
  locale = 'en-US',
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  });
}
