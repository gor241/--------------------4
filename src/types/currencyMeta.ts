export type CurrencyMeta = {
  code: string;
  name: string;
  symbol: string | null;
  symbolNative: string | null;
  decimalDigits: number;
  rounding: number;
  countryCodeISO2: string | null;
  flagSrc: string | null;
};
