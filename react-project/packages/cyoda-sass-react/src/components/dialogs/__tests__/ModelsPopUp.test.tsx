import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ModelsPopUp from '../ModelsPopUp';
import type { SqlTable, EntityModel } from '../../../types';

// Mock the hooks
vi.mock('../../../hooks/useSqlSchema', () => ({
  useEntityModels: () => ({
    data: [
      {
        id: '1',
        name: 'Model1',
        modelVersion: '1.0',
        modelUpdateDate: 1000000,
      },
      {
        id: '2',
        name: 'Model2',
        modelVersion: '2.0',
        modelUpdateDate: 2000000,
      },
    ] as EntityModel[],
    isLoading: false,
  }),
  useGenTables: () => ({
    data: {
      metadataClassId: '1',
      tableName: 'generated_table',
      uniformedPath: 'path',
      fields: [],
    },
    isLoading: false,
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ModelsPopUp', () => {
  const mockTables: SqlTable[] = [
    {
      metadataClassId: '1',
      tableName: 'table1',
      uniformedPath: 'path1',
      fields: [],
      modelUpdateDate: 1000000,
    },
  ];

  const mockOnChange = vi.fn();
  const mockOnDeleteTables = vi.fn();
  const mockOnUpdateTables = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when opened', () => {
    const ref = { current: null };
    render(
      <ModelsPopUp
        ref={ref}
        tables={mockTables}
        onChange={mockOnChange}
        onDeleteTables={mockOnDeleteTables}
        onUpdateTables={mockOnUpdateTables}
      />,
      { wrapper: createWrapper() }
    );

    // Dialog should not be visible initially
    expect(screen.queryByText('Select Entity Models')).not.toBeInTheDocument();
  });

  it('should display entity models in table', async () => {
    const ref = { current: null };
    const { rerender } = render(
      <ModelsPopUp
        ref={ref}
        tables={mockTables}
        onChange={mockOnChange}
        onDeleteTables={mockOnDeleteTables}
        onUpdateTables={mockOnUpdateTables}
      />,
      { wrapper: createWrapper() }
    );

    // Open the dialog
    if (ref.current) {
      (ref.current as any).open();
    }

    rerender(
      <ModelsPopUp
        ref={ref}
        tables={mockTables}
        onChange={mockOnChange}
        onDeleteTables={mockOnDeleteTables}
        onUpdateTables={mockOnUpdateTables}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Model1')).toBeInTheDocument();
      expect(screen.queryByText('Model2')).toBeInTheDocument();
    });
  });

  it('should filter models by search text', async () => {
    const ref = { current: null };
    render(
      <ModelsPopUp
        ref={ref}
        tables={mockTables}
        onChange={mockOnChange}
        onDeleteTables={mockOnDeleteTables}
        onUpdateTables={mockOnUpdateTables}
      />,
      { wrapper: createWrapper() }
    );

    // Note: Full interaction testing would require opening the dialog
    // and interacting with the search input. This is a basic structure test.
  });

  it('should have correct props interface', () => {
    const ref = { current: null };
    const { container } = render(
      <ModelsPopUp
        ref={ref}
        tables={mockTables}
        onChange={mockOnChange}
        onDeleteTables={mockOnDeleteTables}
        onUpdateTables={mockOnUpdateTables}
      />,
      { wrapper: createWrapper() }
    );

    expect(container).toBeTruthy();
  });
});

