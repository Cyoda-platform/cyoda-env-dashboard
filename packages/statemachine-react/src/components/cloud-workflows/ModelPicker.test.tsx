import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModelPicker } from './ModelPicker';
import { useEntityModelList } from '../../hooks/useStatemachine';

vi.mock('../../hooks/useStatemachine', async () => {
  const actual = await vi.importActual<any>('../../hooks/useStatemachine');
  return {
    ...actual,
    useEntityModelList: vi.fn(),
  };
});

function renderWithClient(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe('ModelPicker', () => {
  beforeEach(() => {
    vi.mocked(useEntityModelList).mockReset();
  });

  it('renders the select control', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
