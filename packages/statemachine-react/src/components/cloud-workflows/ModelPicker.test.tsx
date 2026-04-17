import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('lists models from the hook, sorted by modelUpdateDate desc then modelName asc', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED', modelUpdateDate: '2026-04-10T10:00:00Z' },
        { id: '2', modelName: 'Order', modelVersion: 2, currentState: 'LOCKED', modelUpdateDate: '2026-04-12T10:00:00Z' },
        { id: '3', modelName: 'Apple', modelVersion: 1, currentState: 'LOCKED' }, // no date — sorts last
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));

    const options = await screen.findAllByText(/v\d+\)/);
    // Expected order: Order (newest), Customer (next), Apple (no date — last; alphabetical among undated)
    expect(options[0]).toHaveTextContent('Order (v2)');
    expect(options[1]).toHaveTextContent('Customer (v1)');
    expect(options[2]).toHaveTextContent('Apple (v1)');
  });

  it('emits ModelRef on selection', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Customer (v1)'));

    expect(onChange).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
  });

  it('emits null when the selection is cleared', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED' },
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(
      <ModelPicker value={{ entityName: 'Customer', modelVersion: 1 }} onChange={onChange} />
    );

    // Ant Design renders a clear button when allowClear and a value is set.
    // In this Ant Design version the clear icon has aria-label "close-circle".
    const clearBtn = screen.getByLabelText('close-circle');
    await userEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('shows the load-error message when the hook reports isError', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('boom'),
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    // Open the dropdown so the notFoundContent renders.
    return userEvent.click(screen.getByRole('combobox')).then(() => {
      expect(screen.getByText(/Failed to load: boom/)).toBeInTheDocument();
    });
  });

  it('shows "No models" placeholder when the data is loaded but empty', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('No models')).toBeInTheDocument();
  });

  it('sorts equal-date workflows by version desc as a final tiebreaker', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1, currentState: 'LOCKED', modelUpdateDate: '2026-04-12T10:00:00Z' },
        { id: '2', modelName: 'Customer', modelVersion: 2, currentState: 'LOCKED', modelUpdateDate: '2026-04-12T10:00:00Z' },
      ],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);

    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));
    const options = await screen.findAllByText(/v\d+\)/);
    expect(options[0]).toHaveTextContent('Customer (v2)');
    expect(options[1]).toHaveTextContent('Customer (v1)');
  });
});
