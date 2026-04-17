import React from 'react';
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

  it('renders a combobox text input', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: undefined, isLoading: true, isSuccess: false, isError: false,
    } as any);
    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('initial value is rendered as `{name}.{version}` in the input', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [{ id: '1', modelName: 'Customer', modelVersion: 3 }],
      isLoading: false, isSuccess: true, isError: false,
    } as any);
    renderWithClient(<ModelPicker value={{ entityName: 'Customer', modelVersion: 3 }} onChange={vi.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('Customer.3');
  });

  it('typing filters by substring; options sort by name asc, version desc', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [
        { id: '1', modelName: 'Customer', modelVersion: 1 },
        { id: '2', modelName: 'Customer', modelVersion: 2 },
        { id: '3', modelName: 'Order',    modelVersion: 1 },
      ],
      isLoading: false, isSuccess: true, isError: false,
    } as any);
    renderWithClient(<ModelPicker value={null} onChange={vi.fn()} />);
    await userEvent.type(screen.getByRole('combobox'), 'Cus');
    const opts = await screen.findAllByText(/Customer\.\d+/);
    expect(opts[0]).toHaveTextContent('Customer.2');
    expect(opts[1]).toHaveTextContent('Customer.1');
    expect(screen.queryByText('Order.1')).not.toBeInTheDocument();
  });

  it('emits ModelRef when an option is selected', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [{ id: '1', modelName: 'Customer', modelVersion: 1 }],
      isLoading: false, isSuccess: true, isError: false,
    } as any);
    renderWithClient(<ModelPicker value={null} onChange={onChange} />);
    // Typing the exact `{name}.{version}` text matches an option and fires onChange with the ModelRef
    await userEvent.type(screen.getByRole('combobox'), 'Customer.1');
    expect(onChange).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
  });

  it('emits null when the input is fully cleared', async () => {
    const onChange = vi.fn();
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [{ id: '1', modelName: 'Customer', modelVersion: 1 }],
      isLoading: false, isSuccess: true, isError: false,
    } as any);
    renderWithClient(<ModelPicker value={{ entityName: 'Customer', modelVersion: 1 }} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
