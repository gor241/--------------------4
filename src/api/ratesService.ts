import { httpGet } from './http';
import type { RatesPayload, RatesQuery } from '@/types/rates';

const VAT_COMPLY_PATH = '/rates';
const FX_RATES_PATH = '/latest';

function isVatComply(baseUrl: string): boolean {
  return baseUrl.includes('vatcomply');
}

export async function fetchRates({
  base,
  symbols = [],
  apiKey,
}: RatesQuery): Promise<RatesPayload> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://api.vatcomply.com';
  const searchSymbols = symbols.length ? symbols.join(',') : undefined;

  const { data } = await httpGet<RatesPayload>(
    isVatComply(baseUrl) ? VAT_COMPLY_PATH : FX_RATES_PATH,
    {
      query: {
        base,
        symbols: searchSymbols,
        access_key: apiKey ?? import.meta.env.VITE_FXRATES_API_KEY,
      },
    },
  );

  return data;
}
