export type RatesRecord = Record<string, number>;

export type RatesPayload = {
  base: string;
  date?: string;
  rates: RatesRecord;
};

export type CachedRates = RatesPayload & {
  timestamp: number;
};

export type RatesQuery = {
  base: string;
  symbols?: string[];
  apiKey?: string;
};
