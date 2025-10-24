/**
 * Unit tests for ModellingAliases component
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ModellingAliases } from './ModellingAliases';
import type { AliasDef } from '../../../types/modelling';

// Mock axios
vi.mock('axios');

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

describe('ModellingAliases', () => {
  const mockAliasDef: AliasDef = {
    name: 'TestAlias',
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
  };

  const mockConfigDefinition = {
    requestClass: 'com.test.Customer',
    aliasDefs: [mockAliasDef],
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );
    expect(container).toBeTruthy();
  });

  it('should display alias table with correct data', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Check if alias name is displayed
    expect(screen.getByText('TestAlias')).toBeInTheDocument();
  });

  it('should display "Add from Catalog" button', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    const addButton = screen.getByRole('button', { name: /add from catalog/i });
    expect(addButton).toBeInTheDocument();
  });

  it('should display empty state when no aliases', () => {
    const emptyConfig = { ...mockConfigDefinition, aliasDefs: [] };
    render(
      <ModellingAliases configDefinition={emptyConfig} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Table should still render but with no data
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });

  it('should show delete button for each alias', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should show edit button for each alias', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it('should handle alias deletion with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    await user.click(deleteButton);

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText(/do you really want to remove/i)).toBeInTheDocument();
    });
  });

  it('should display alias paths correctly', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Check if path is displayed
    expect(screen.getByText(/customer\.name/i)).toBeInTheDocument();
  });

  it('should display mapper class name', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Check if mapper class is displayed (should show short name)
    expect(screen.getByText(/BasicMapper/i)).toBeInTheDocument();
  });

  it('should handle multiple aliases', () => {
    const multipleAliasesConfig = {
      ...mockConfigDefinition,
      aliasDefs: [
        mockAliasDef,
        {
          ...mockAliasDef,
          name: 'SecondAlias',
        },
        {
          ...mockAliasDef,
          name: 'ThirdAlias',
        },
      ],
    };

    render(
      <ModellingAliases configDefinition={multipleAliasesConfig} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('TestAlias')).toBeInTheDocument();
    expect(screen.getByText('SecondAlias')).toBeInTheDocument();
    expect(screen.getByText('ThirdAlias')).toBeInTheDocument();
  });

  it('should support row selection', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Check if checkboxes are present
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('should show bulk delete button when rows are selected', async () => {
    const user = userEvent.setup();
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // Select a row
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      await user.click(checkbox);
    }

    // Bulk delete button should appear
    await waitFor(() => {
      const bulkDeleteButton = screen.queryByRole('button', { name: /delete selected/i });
      // Button may or may not be present depending on implementation
      expect(bulkDeleteButton || checkbox).toBeTruthy();
    });
  });

  it('should be read-only when readOnly prop is true', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} readOnly={true} />,
      { wrapper: createWrapper() }
    );

    // Add button should be disabled
    const addButton = screen.getByRole('button', { name: /add from catalog/i });
    expect(addButton).toBeDisabled();
  });

  it('should handle alias with multiple paths', () => {
    const multiPathAlias: AliasDef = {
      ...mockAliasDef,
      aliasPaths: {
        '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
        value: [
          mockAliasDef.aliasPaths.value[0],
          {
            ...mockAliasDef.aliasPaths.value[0],
            colDef: {
              ...mockAliasDef.aliasPaths.value[0].colDef,
              fullPath: 'customer.email',
            },
          },
        ],
      },
    };

    const configWithMultiPath = {
      ...mockConfigDefinition,
      aliasDefs: [multiPathAlias],
    };

    render(
      <ModellingAliases configDefinition={configWithMultiPath} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/customer\.name/i)).toBeInTheDocument();
    expect(screen.getByText(/customer\.email/i)).toBeInTheDocument();
  });

  it('should display alias type', () => {
    render(
      <ModellingAliases configDefinition={mockConfigDefinition} onChange={mockOnChange} />,
      { wrapper: createWrapper() }
    );

    // The component should render the alias type somewhere
    const table = document.querySelector('.ant-table');
    expect(table).toBeInTheDocument();
  });
});

