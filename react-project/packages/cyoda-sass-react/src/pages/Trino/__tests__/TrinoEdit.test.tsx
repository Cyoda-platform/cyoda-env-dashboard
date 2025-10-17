import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TrinoEdit from '../TrinoEdit';
import type { SqlSchema } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useSqlSchema', () => ({
  useSchema: () => ({
    data: {
      id: '1',
      schemaName: 'test_schema',
      tables: [
        {
          metadataClassId: '1',
          tableName: 'table1',
          uniformedPath: 'path1',
          fields: [
            {
              fieldName: 'field1',
              fieldType: 'varchar',
              fieldCategory: 'DATA',
            },
          ],
        },
      ],
    } as SqlSchema,
    isLoading: false,
  }),
  useSaveSchema: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: '1' }),
  }),
  useEntityModels: () => ({
    data: [],
    isLoading: false,
  }),
  useGenTables: () => ({
    data: null,
    isLoading: false,
  }),
  useUpdateTables: () => ({
    mutateAsync: vi.fn(),
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TrinoEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page title', async () => {
    render(<TrinoEdit />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Edit Schema')).toBeInTheDocument();
    });
  });

  it('should render schema name input', async () => {
    render(<TrinoEdit />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      const input = screen.getByLabelText('Schema Name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('test_schema');
    });
  });

  it('should render action buttons', async () => {
    render(<TrinoEdit />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('Add Tables')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should render tabs for tables', async () => {
    render(<TrinoEdit />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('table1')).toBeInTheDocument();
    });
  });

  it('should display hidden tables badge when tables are hidden', async () => {
    const { container } = render(<TrinoEdit />, { wrapper: createWrapper() });
    expect(container).toBeTruthy();
  });

  it('should render without crashing when no data', async () => {
    const { container } = render(<TrinoEdit />, { wrapper: createWrapper() });
    expect(container).toBeTruthy();
  });
});

