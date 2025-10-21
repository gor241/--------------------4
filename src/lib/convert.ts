type ConvertParams = {
  amount: number;
  from: string;
  to: string;
  base: string;
  rates: Record<string, number>;
};

const UNKNOWN_CURRENCY_ERROR = 'Unknown currency code';

function resolveRate(code: string, base: string, rates: Record<string, number>): number {
  if (code === base) {
    return 1;
  }

  const rate = rates[code];

  if (typeof rate !== 'number' || Number.isNaN(rate)) {
    throw new Error(UNKNOWN_CURRENCY_ERROR);
  }

  return rate;
}

export function convert(params: ConvertParams): number {
  const { amount, from, to, base, rates } = params;

  if (from === to) {
    return amount;
  }

  const rateTo = resolveRate(to, base, rates);
  const rateFrom = resolveRate(from, base, rates);

  return amount * (rateTo / rateFrom);
}
