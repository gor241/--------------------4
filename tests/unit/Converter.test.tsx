import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OnlineProvider } from '@/app/providers/OnlineProvider';
import { Converter } from '@/features/Converter/Converter';

function renderConverter() {
  render(
    <OnlineProvider>
      <Converter />
    </OnlineProvider>,
  );
}

describe('Converter', () => {
  it('renders amount input', () => {
    renderConverter();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
  });
});
