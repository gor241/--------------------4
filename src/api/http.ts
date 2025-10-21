export type HttpClientConfig = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export type HttpResponse<T> = {
  data: T;
  status: number;
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | undefined>;
};

const defaultConfig: Required<HttpClientConfig> = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://api.vatcomply.com',
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function httpGet<T>(
  path: string,
  options: RequestOptions = {},
): Promise<HttpResponse<T>> {
  const config = {
    ...defaultConfig,
    headers: { ...defaultConfig.headers, ...options.headers },
  };
  const url = buildUrl(config.baseUrl, path, options.query);

  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: config.headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = (await response.json()) as T;

  return { data, status: response.status };
}

function buildUrl(
  base: string,
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const url = new URL(path, base);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}
