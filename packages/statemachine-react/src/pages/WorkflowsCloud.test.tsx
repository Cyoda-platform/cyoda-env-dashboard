import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('Duplicate row action opens the NameInputDialog', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /^Duplicate$/ }));
    await waitFor(() => {
      expect(screen.getByText('Duplicate workflow "Premium"')).toBeInTheDocument();
    });
  });

  it('Rename row action opens the NameInputDialog with the source name pre-filled', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: /^Rename$/ }));
    await waitFor(() => {
      expect(screen.getByText('Rename workflow "Premium"')).toBeInTheDocument();
      expect(screen.getByLabelText(/new name/i)).toHaveValue('Premium');
    });
  });

  it('Delete row action opens the DeleteWorkflowDialog with the kept-list', async () => {
    vi.mocked(useEntityModelList).mockReturnValue({
      data: [],
      isLoading: false,
      isSuccess: true,
      isError: false,
    } as any);
    vi.mocked(useWorkflowsList).mockReturnValue({
      data: [
        { name: 'Premium', desc: undefined, active: true, initialState: 'draft' },
        { name: 'Standard', desc: undefined, active: false, initialState: 'pending' },
      ],
      isLoading: false,
      dataUpdatedAt: Date.now(),
    } as any);

    renderPage('/workflows?entityName=Customer&modelVersion=1');

    const deleteButtons = await screen.findAllByRole('button', { name: /^Delete$/ });
    await userEvent.click(deleteButtons[0]);

    await waitFor(() => {
      // Dialog title mentions the target.
      expect(screen.getByText(/Delete workflow "Premium"/)).toBeInTheDocument();
    });
    // Kept-list (rendered inside the dialog) shows the remaining workflow.
    // Scope to the dialog because "Standard" also appears as a row in the
    // underlying table behind the modal.
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Standard')).toBeInTheDocument();
  });
});
