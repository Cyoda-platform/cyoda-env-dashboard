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
});
