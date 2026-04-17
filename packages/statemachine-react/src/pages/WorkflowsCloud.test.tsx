import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { App } from 'antd';
import { WorkflowsCloud } from './WorkflowsCloud';
import { useEntityModelList, useWorkflowsList } from '../hooks/useStatemachine';

vi.mock('../hooks/useStatemachine', async () => {
  const actual = await vi.importActual<any>('../hooks/useStatemachine');
  return {
    ...actual,
    useEntityModelList: vi.fn(),
    useWorkflowsList: vi.fn(),
  };
});

function renderPage(initialPath: string = '/workflows') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App>
          <WorkflowsCloud />
        </App>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('WorkflowsCloud', () => {
  beforeEach(() => {
    vi.mocked(useEntityModelList).mockReset();
    vi.mocked(useWorkflowsList).mockReset();
  });

  it('renders the model picker', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('initializes from ?entityName + ?modelVersion in the URL', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
      ],
      isLoading: false,
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    // The table should render because modelRef was read from the URL.
    await waitFor(() => {
      expect(screen.getByText('Premium')).toBeInTheDocument();
    });
    // Hook was called with the parsed modelRef.
    expect(useWorkflowsList).toHaveBeenCalledWith({ entityName: 'Customer', modelVersion: 1 });
  });

  it('does not render the table if the URL has no model ref', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage('/workflows');

    expect(screen.queryByText(/no workflows/i)).not.toBeInTheDocument();
  });

  it('passes null to useWorkflowsList when no model is selected', () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderPage('/workflows');

    expect(useWorkflowsList).toHaveBeenCalledWith(null);
  });
});
