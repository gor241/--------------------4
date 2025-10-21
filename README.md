# Currency Converter — React + TypeScript

SPA to convert currencies with live FX rates, cache, and offline support.

## Tech Stack
- Vite, React, TypeScript, Vitest, and React Testing Library
- LocalStorage caching with a five-minute TTL and offline fallback
- Rate providers: VATComply or fxratesapi.com selected via environment configuration

## Getting Started
- Prerequisites: Node.js LTS (18+ recommended)
- Install dependencies:
  ```bash
  npm install
  ```
- Start the development server:
  ```bash
  npm run dev
  ```
- Create a production build:
  ```bash
  npm run build
  ```
- Run the test suite:
  ```bash
  npm run test
  ```
- Lint and format code:
  ```bash
  npm run lint
  npm run format
  ```

## Environment Configuration
Create a `.env` file in the project root and set the rate provider:
```bash
VITE_RATES_API=vats
VITE_API_BASE=https://api.vatcomply.com
# For fxrates:
# VITE_RATES_API=fxrates
# VITE_API_BASE=https://api.fxratesapi.com
# VITE_API_KEY=YOUR_KEY
```
`VITE_RATES_API` selects the provider (`vats` or `fxrates`). `VITE_API_BASE` points to the provider endpoint, and `VITE_API_KEY` is only required when using fxratesapi.

## Architecture Overview
- Entry point: `src/main.tsx` mounts the app shell and global providers.
- Feature composition: `src/features/Converter/Converter.tsx` wires inputs, selectors, result display, and network indicators.
- Components: modular UI elements in `src/components/*` (AmountInput, CurrencySelect, ResultBlock, etc.).
- Hooks: `src/hooks` contains shared logic (`useExchangeRates`, `useDebouncedValue`, `useLocalStorage`, keyboard navigation).
- Lib utilities: currency formatting, conversion math, search, caching, and money helpers live in `src/lib`.
- API layer: `src/api/http.ts` and `src/api/ratesService.ts` wrap fetch, provider selection, and normalization.
- Data: currency metadata in `data/currencies.json` with TypeScript helpers in `src/data`.
- Cache strategy: `useExchangeRates` stores the last successful response in LocalStorage with a five-minute TTL, refreshes in the background when online, and falls back to cached data offline.
- Live UX: input value is debounced (~250 ms) and manual rate refresh is throttled to avoid spamming the API.
- Accessibility: modal and form controls expose ARIA labels, announce statuses, and support full keyboard navigation (↑/↓, Enter, Esc).

## Development Notes
- Strict TypeScript mode enforced; ESLint and Prettier configurations ensure consistent style.
- Testing strategy combines unit tests for lib utilities and hooks with integration/UI coverage for converter flows and modal interactions.
- Known limitations / future ideas: add a PWA manifest for installable offline experience; consider virtualized lists for very large currency datasets.

## Deployment
- Deploy to Vercel or Netlify with build command `npm run build` and output directory `dist/`.
