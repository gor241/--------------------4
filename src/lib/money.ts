const DECIMAL_SEPARATOR_REGEX = /[.,]/g;

export function normalizeAmountInput(value: string): string {
  return value
    .replace(/[^0-9.,]/g, '')
    .replace(DECIMAL_SEPARATOR_REGEX, (match, offset, full) => {
      return match === ',' ? (full.slice(0, offset).includes('.') ? '' : '.') : match;
    });
}

export function parseAmount(value: string): number {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}
