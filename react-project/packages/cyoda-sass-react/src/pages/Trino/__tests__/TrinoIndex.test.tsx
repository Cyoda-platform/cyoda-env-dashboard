import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TrinoIndex from '../TrinoIndex';
import type { SqlSchema } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useSqlSchema', () => ({
  useSchemas: () => ({
    data: [
      {
        id: '1',
        schemaName: 'schema1',
        tables: [],
        timestamp: 1000000,
      },
      {
        id: '2',
        schemaName: 'schema2',
        tables: [],
        timestamp: 2000000,
      },
    ] as SqlSchema[],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useDeleteSchema: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}));

// Mock the table state hook
vi.mock('../../../hooks/useTableSaveState', () => ({
  useTableSaveState: () => ({
    tableState: {},
    saveTableState: vi.fn(),
    resetTableState: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TrinoIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', async () => {
    render(<TrinoIndex />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Trino SQL Schema Management')).toBeInTheDocument();
    });
  });

  it('should render create button', async () => {
    render(<TrinoIndex />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Create Schema')).toBeInTheDocument();
    });
  });

  it('should render reset state button', async () => {
    render(<TrinoIndex />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Reset State')).toBeInTheDocument();
    });
  });

  it('should display schemas in table', async () => {
    render(<TrinoIndex />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('schema1')).toBeInTheDocument();
      expect(screen.getByText('schema2')).toBeInTheDocument();
    });
  });

  it('should render table columns', async () => {
    render(<TrinoIndex />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Schema Name')).toBeInTheDocument();
      expect(screen.getByText('Tables')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should render without crashing when no data', async () => {
    const { container } = render(<TrinoIndex />, { wrapper: createWrapper() });
    expect(container).toBeTruthy();
  });
});

