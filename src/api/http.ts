const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
};

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface GetJSONOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Build an absolute URL with query parameters appended.
 * @param base A fully qualified base URL.
 * @param params Optional query parameters to append.
 */
export function buildUrl(base: string, params?: QueryParams): string {
  const url = new URL(base);

  if (!params) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

/**
 * Perform an HTTP GET request that resolves with parsed JSON data.
 * @template T Expected response payload shape.
 * @param url Target URL to request. Should be absolute.
 * @param options Optional request configuration.
 */
export async function getJSON<T>(url: string, options: GetJSONOptions = {}): Promise<T> {
  const { headers, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...DEFAULT_HEADERS, ...headers },
      signal: controller.signal,
    });

    const rawBody = await response.text();

    if (!response.ok) {
      let errorDetail = rawBody || response.statusText;

      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody) as Record<string, unknown>;

          if (parsed && typeof parsed === 'object') {
            const message = parsed.message ?? parsed.error;

            if (typeof message === 'string' && message.trim().length > 0) {
              errorDetail = message;
            }
          }
        } catch {
          // Ignore JSON parsing error for error responses, fallback to raw body.
        }
      }

      const detailSuffix = errorDetail ? ` - ${errorDetail}` : '';
      throw new Error(`Request failed with status ${response.status}${detailSuffix}`);
    }

    if (!rawBody) {
      throw new Error('Invalid JSON');
    }

    let parsedBody: unknown;

    try {
      parsedBody = JSON.parse(rawBody) as unknown;
    } catch {
      throw new Error('Invalid JSON');
    }

    if (parsedBody === null || typeof parsedBody !== 'object') {
      throw new Error('Invalid JSON');
    }

    return parsedBody as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    if (
      error instanceof Error &&
      (error.message === 'Invalid JSON' || error.message.startsWith('Request failed'))
    ) {
      throw error;
    }

    throw new Error('Network error');
  } finally {
    clearTimeout(timeout);
  }
}
