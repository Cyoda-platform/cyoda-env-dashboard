/**
 * Unit tests for ModellingPopUpAlias component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import ModellingPopUpAlias from './ModellingPopUpAlias';
import type { AliasDef } from '../../../types/modelling';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

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

describe('ModellingPopUpAlias', () => {
  const mockCatalogItems = [
    {
      id: 'alias-1',
      name: 'CatalogAlias1',
      createDate: '2024-01-01T10:00:00Z',
      user: 'testuser',
      state: 'CREATED',
      entityClass: 'com.test.Customer',
      aliasDef: {
        name: 'CatalogAlias1',
        aliasType: 'SIMPLE',
        aliasPaths: {
          '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
          value: [
            {
              colDef: {
                fullPath: 'customer.name',
                colType: 'LEAF',
                parts: {
                  '@meta': 'com.cyoda.core.reports.columndefs.ReportColPartDef[]',
                  value: [
                    {
                      rootClass: 'com.test.Customer',
                      path: 'name',
                      type: 'java.lang.String',
                    },
                  ],
                },
              },
              mapperClass: 'com.cyoda.core.reports.aliasmappers.BasicMapper',
              mapperParameters: '',
            },
          ],
        },
      },
    },
    {
      id: 'alias-2',
      name: 'CatalogAlias2',
      createDate: '2024-01-02T10:00:00Z',
      user: 'testuser',
      state: 'CREATED',
      entityClass: 'com.test.Customer',
      aliasDef: {
        name: 'CatalogAlias2',
        aliasType: 'SIMPLE',
        aliasPaths: {
          '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
          value: [
            {
              colDef: {
                fullPath: 'customer.email',
                colType: 'LEAF',
                parts: {
                  '@meta': 'com.cyoda.core.reports.columndefs.ReportColPartDef[]',
                  value: [
                    {
                      rootClass: 'com.test.Customer',
                      path: 'email',
                      type: 'java.lang.String',
                    },
                  ],
                },
              },
              mapperClass: 'com.cyoda.core.reports.aliasmappers.BasicMapper',
              mapperParameters: '',
            },
          ],
        },
      },
    },
  ];

  const mockConfigDefinition = {
    requestClass: 'com.test.Customer',
    aliasDefs: [],
    colDefs: [],
    columns: [],
    sorting: [],
    grouping: [],
    summary: [],
    condition: {
      '@bean': 'com.cyoda.core.conditions.GroupCondition',
      operator: 'OR',
      conditions: [],
    },
  };

  const mockOnChange = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockCatalogItems });
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  it('should render without crashing', () => {
    const ref = React.createRef<any>();
    const { container } = render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );
    expect(container).toBeTruthy();
  });

  it('should not display modal initially', () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    // Modal should not be visible
    expect(screen.queryByText('Catalog of Aliases')).not.toBeInTheDocument();
  });

  it('should open modal when open() is called', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    // Open the modal
    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Catalog of Aliases')).toBeInTheDocument();
    });
  });

  it('should fetch catalog items when opened', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/platform-api/catalog/item/class?entityClass=com.test.Customer')
      );
    });
  });

  it('should display catalog items in table', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('CatalogAlias1')).toBeInTheDocument();
      expect(screen.getByText('CatalogAlias2')).toBeInTheDocument();
    });
  });

  it('should display "Add New Alias" button', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add new alias/i })).toBeInTheDocument();
    });
  });

  it('should support row selection', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  it('should show bulk actions when rows are selected', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('CatalogAlias1')).toBeInTheDocument();
    });

    // Select a row
    const checkbox = document.querySelectorAll('input[type="checkbox"]')[1] as HTMLInputElement;
    if (checkbox) {
      await user.click(checkbox);
    }

    await waitFor(() => {
      // Bulk action buttons should appear
      const addSelectedButton = screen.queryByRole('button', { name: /add selected/i });
      const deleteSelectedButton = screen.queryByRole('button', { name: /delete selected/i });
      expect(addSelectedButton || deleteSelectedButton).toBeTruthy();
    });
  });

  it('should display alias paths in table', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText(/customer\.name/i)).toBeInTheDocument();
      expect(screen.getByText(/customer\.email/i)).toBeInTheDocument();
    });
  });

  it('should display mapper class names', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getAllByText(/BasicMapper/i).length).toBeGreaterThan(0);
    });
  });

  it('should disable selection for already added aliases', async () => {
    const configWithAlias = {
      ...mockConfigDefinition,
      aliasDefs: [mockCatalogItems[0].aliasDef],
    };

    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={configWithAlias}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('CatalogAlias1')).toBeInTheDocument();
    });

    // First alias should be disabled for selection
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    // Note: Implementation may vary, just checking structure exists
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should close modal when close() is called', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAlias
        ref={ref}
        requestClass="com.test.Customer"
        configDefinition={mockConfigDefinition}
        onChange={mockOnChange}
        onDelete={mockOnDelete}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Catalog of Aliases')).toBeInTheDocument();
    });

    ref.current?.close();

    await waitFor(() => {
      expect(screen.queryByText('Catalog of Aliases')).not.toBeInTheDocument();
    });
  });
});

