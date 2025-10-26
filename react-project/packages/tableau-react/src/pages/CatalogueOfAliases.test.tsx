/**
 * Unit tests for CatalogueOfAliases page
 */

import React from 'react';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CatalogueOfAliases from './CatalogueOfAliases';
import * as httpApiReact from '@cyoda/http-api-react';

// Mock the API functions
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    getAllCatalogItems: vi.fn(),
    createCatalogItem: vi.fn(),
    updateCatalogItem: vi.fn(),
    deleteCatalogItem: vi.fn(),
    exportCatalogItems: vi.fn(),
    importCatalogItems: vi.fn(),
  };
});

// Mock the child components
vi.mock('../components/CatalogueOfAliasesFilter', () => ({
  default: ({ value, onChange }: any) => (
    <div data-testid="catalogue-filter">
      <input
        data-testid="filter-search"
        value={value.search || ''}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </div>
  ),
}));

vi.mock('../components/CatalogueAliasDialog', () => ({
  default: React.forwardRef(({ onCreate, onUpdate }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      open: vi.fn(),
      close: vi.fn(),
    }));
    return <div data-testid="alias-dialog" />;
  }),
}));

vi.mock('../components/CatalogueAliasChangeStateDialog', () => ({
  default: React.forwardRef(({ onStateChanged }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      open: vi.fn(),
      close: vi.fn(),
    }));
    return <div data-testid="change-state-dialog" />;
  }),
}));

vi.mock('../components/ReportsNavigation', () => ({
  default: () => <div data-testid="reports-navigation">Navigation</div>,
}));

// Mock data
const mockCatalogItems = [
  {
    id: '1',
    name: 'Test Alias 1',
    desc: 'Description 1',
    entityClass: 'com.example.Entity1',
    user: 'user1',
    state: 'ACTIVE',
    createDate: '2024-01-01T10:00:00Z',
    aliasDef: {
      name: 'Test Alias 1',
      aliasType: 'SIMPLE',
      aliasPaths: {
        '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
        value: [],
      },
    },
  },
  {
    id: '2',
    name: 'Test Alias 2',
    desc: 'Description 2',
    entityClass: 'com.example.Entity2',
    user: 'user2',
    state: 'DRAFT',
    createDate: '2024-01-02T10:00:00Z',
    aliasDef: {
      name: 'Test Alias 2',
      aliasType: 'COMPLEX',
      aliasPaths: {
        '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
        value: [],
      },
    },
  },
];

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

describe('CatalogueOfAliases', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a container for each test
    container = document.createElement('div');
    container.setAttribute('id', 'test-container');
    document.body.appendChild(container);

    vi.clearAllMocks();
    (httpApiReact.getAllCatalogItems as any).mockResolvedValue({
      data: mockCatalogItems,
    });
  });

  afterEach(() => {
    // Clean up DOM
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
    cleanup();
    vi.clearAllMocks();
  });

  it('should render the page with title and navigation', async () => {
    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    expect(screen.getByText('Catalogue of Aliases')).toBeInTheDocument();
    expect(screen.getByTestId('reports-navigation')).toBeInTheDocument();
  });

  it('should render action buttons', async () => {
    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  });

  it('should load and display catalog items', async () => {
    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(httpApiReact.getAllCatalogItems).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
      expect(screen.getByText('Test Alias 2')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    (httpApiReact.getAllCatalogItems as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should filter items by search text', async () => {
    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('filter-search');
    await userEvent.type(searchInput, 'Test Alias 1');

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Alias 2')).not.toBeInTheDocument();
    });
  });

  it('should handle create new alias', async () => {
    const user = userEvent.setup();
    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new/i });
    await user.click(createButton);

    // Dialog should be rendered
    expect(screen.getByTestId('alias-dialog')).toBeInTheDocument();
  });

  it('should handle delete alias with confirmation', async () => {
    const user = userEvent.setup();
    (httpApiReact.deleteCatalogItem as any).mockResolvedValue({});

    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find delete button in the first row
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row

    const deleteButton = within(firstDataRow).getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText(/do you really want to remove/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Click OK to confirm
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(httpApiReact.deleteCatalogItem).toHaveBeenCalledWith('1');
    }, { timeout: 10000 });
  }, 15000);

  it('should handle bulk delete', async () => {
    const user = userEvent.setup();
    (httpApiReact.deleteCatalogItem as any).mockResolvedValue({});

    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Select checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First item
    await user.click(checkboxes[2]); // Second item

    // Bulk delete button should appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete selected/i })).toBeInTheDocument();
    }, { timeout: 10000 });

    const bulkDeleteButton = screen.getByRole('button', { name: /delete selected/i });
    await user.click(bulkDeleteButton);

    // Confirmation modal
    await waitFor(() => {
      expect(screen.getByText(/do you really want to remove 2 aliases/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(httpApiReact.deleteCatalogItem).toHaveBeenCalledTimes(2);
    }, { timeout: 10000 });
  }, 15000);

  it('should handle export', async () => {
    const user = userEvent.setup();
    const mockExportData = {
      '@bean': 'com.cyoda.core.model.catalog.CatalogItemExportImportContainer',
      aliases: mockCatalogItems,
    };
    (httpApiReact.exportCatalogItems as any).mockResolvedValue({ data: mockExportData });

    // Mock URL.createObjectURL and document.createElement
    const originalCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const element = originalCreateElement('a');
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tag);
    });

    const { container: renderContainer } = render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);

    await waitFor(() => {
      expect(httpApiReact.exportCatalogItems).toHaveBeenCalled();
    }, { timeout: 10000 });

    // Cleanup
    createElementSpy.mockRestore();
  }, 15000);

  it('should handle import', async () => {
    const user = userEvent.setup();
    (httpApiReact.importCatalogItems as any).mockResolvedValue({});

    const mockFile = new File(
      [JSON.stringify({ aliases: mockCatalogItems })],
      'test.json',
      { type: 'application/json' }
    );

    // Mock file.text() method
    mockFile.text = vi.fn().mockResolvedValue(JSON.stringify({ aliases: mockCatalogItems }));

    const originalCreateElement = document.createElement.bind(document);
    let fileInput: HTMLInputElement | null = null;

    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'input') {
        fileInput = originalCreateElement('input') as HTMLInputElement;
        fileInput.type = 'file';
        fileInput.accept = '.json';

        // Store the onchange handler
        let onchangeHandler: ((e: Event) => void) | null = null;
        Object.defineProperty(fileInput, 'onchange', {
          get: () => onchangeHandler,
          set: (handler) => {
            onchangeHandler = handler;
          },
          configurable: true,
        });

        // Mock the click to trigger file selection
        fileInput.click = vi.fn(() => {
          // Simulate file selection
          Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
            writable: false,
            configurable: true,
          });

          // Trigger the onchange handler if it exists
          if (onchangeHandler) {
            const changeEvent = new Event('change', { bubbles: true });
            Object.defineProperty(changeEvent, 'target', {
              value: fileInput,
              writable: false,
            });
            onchangeHandler(changeEvent);
          }
        });

        return fileInput;
      }
      return originalCreateElement(tag);
    });

    render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    const importButton = screen.getByRole('button', { name: /import/i });
    await user.click(importButton);

    await waitFor(() => {
      expect(httpApiReact.importCatalogItems).toHaveBeenCalled();
    }, { timeout: 10000 });

    // Cleanup
    createElementSpy.mockRestore();
  }, 15000);

  it('should display table columns correctly', async () => {
    const { container: renderContainer } = render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Alias 1')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Check column headers - use getAllByText for columns that might appear multiple times
    // (e.g., in both filter component and table)
    const nameHeaders = screen.getAllByText('Name');
    expect(nameHeaders.length).toBeGreaterThan(0);

    const descriptionHeaders = screen.getAllByText('Description');
    expect(descriptionHeaders.length).toBeGreaterThan(0);

    expect(screen.getByText('Entity')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('State')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  }, 10000);

  it('should display entity short names', async () => {
    const { container: renderContainer } = render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Entity1')).toBeInTheDocument();
      expect(screen.getByText('Entity2')).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 10000);

  it('should handle API errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (httpApiReact.getAllCatalogItems as any).mockRejectedValue(new Error('API Error'));

    const { container: renderContainer } = render(<CatalogueOfAliases />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(httpApiReact.getAllCatalogItems).toHaveBeenCalled();
    }, { timeout: 10000 });

    consoleError.mockRestore();
  }, 10000);
});

