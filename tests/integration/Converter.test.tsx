import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Converter } from '../../src/features/Converter/Converter';
import { useExchangeRates } from '../../src/hooks/useExchangeRates';
import { useOnlineStatus } from '../../src/app/providers/OnlineProvider';

vi.mock('../../src/hooks/useExchangeRates');
vi.mock('../../src/app/providers/OnlineProvider');

const mockUseExchangeRates = vi.mocked(useExchangeRates);
const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

const BASE_TIMESTAMP = 1_700_000_000_000;

type ExchangeResult = ReturnType<typeof useExchangeRates>;

const createBaseState = (): ExchangeResult => ({
  data: {
    base: 'EUR',
    rates: {
      USD: 1.2,
      GBP: 0.9,
    },
  },
  updatedAt: BASE_TIMESTAMP,
  loading: false,
  error: null,
  reload: vi.fn(),
});

function renderConverter() {
  return render(<Converter />);
}

describe('Converter integration', () => {
  beforeEach(() => {
    mockUseExchangeRates.mockReturnValue(createBaseState());
    mockUseOnlineStatus.mockReturnValue({ online: true, lastChangedAt: null });
    window.localStorage.clear();
  });

  afterEach(() => {
    mockUseExchangeRates.mockReset();
    mockUseOnlineStatus.mockReset();
  });

  it('shows online badge and computes result after debounced amount input', async () => {
    renderConverter();

    const badge = screen.getByRole('status', { name: /online/i });
    expect(badge).toBeInTheDocument();

    const user = userEvent.setup();
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '100,00');

    await waitFor(
      () => {
        expect(screen.getByRole('status', { name: /120[.,]00/ })).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('swaps currencies and recalculates result', async () => {
    renderConverter();

    const user = userEvent.setup();
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '10');

    await user.click(screen.getByRole('button', { name: /swap currencies/i }));

    await waitFor(
      () => {
        expect(screen.getByRole('status', { name: /8[.,]33/ })).toBeInTheDocument();
      },
      { timeout: 1000 },
    );
  });

  it('disables refresh button while reload promise is pending', async () => {
    const reload = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    mockUseExchangeRates.mockReturnValue({ ...createBaseState(), reload });

    renderConverter();

    const user = userEvent.setup();
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(refreshButton).toBeDisabled();

    expect(reload).toHaveBeenCalledTimes(1);

    await waitFor(
      () => {
        expect(refreshButton).not.toBeDisabled();
      },
      { timeout: 1000 },
    );
  });

  it('renders offline banner with cached timestamp when offline', () => {
    mockUseOnlineStatus.mockReturnValue({ online: false, lastChangedAt: BASE_TIMESTAMP });
    mockUseExchangeRates.mockReturnValue(createBaseState());

    renderConverter();

    const timestampText = new Date(BASE_TIMESTAMP).toLocaleString();
    const banner = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'span' &&
        content.includes('Using cached rates from') &&
        content.includes(timestampText)
      );
    });

    expect(banner).toBeInTheDocument();
    expect(banner.closest('[role="status"]')).toHaveAttribute('class', 'offline-banner');
  });
});
