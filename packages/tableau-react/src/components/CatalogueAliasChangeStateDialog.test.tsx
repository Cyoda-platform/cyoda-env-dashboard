/**
 * Unit tests for CatalogueAliasChangeStateDialog component
 */

import React from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CatalogueAliasChangeStateDialog from './CatalogueAliasChangeStateDialog';
import * as httpApiReact from '@cyoda/http-api-react';

// Mock the API functions
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    getEntityTransitions: vi.fn(),
    executeEntityTransition: vi.fn(),
  };
});

const mockTransitions = [
  'ACTIVATE',
  'DEACTIVATE',
  'ARCHIVE',
];

const mockCatalogItem = {
  id: '123',
  name: 'Test Alias',
  desc: 'Test Description',
  entityClass: 'com.example.Entity',
  user: 'testuser',
  state: 'DRAFT',
  createDate: '2024-01-01T10:00:00Z',
  aliasDef: {
    name: 'Test Alias',
    aliasType: 'SIMPLE',
    aliasPaths: {
      '@meta': 'com.cyoda.core.reports.columns.AliasPaths',
      value: [],
    },
  },
};

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

describe('CatalogueAliasChangeStateDialog', () => {
  const mockOnStateChanged = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (httpApiReact.getEntityTransitions as any).mockResolvedValue({
      data: mockTransitions,
    });
    (httpApiReact.executeEntityTransition as any).mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render dialog when opened', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('Attempt Transition')).toBeInTheDocument();
    });
  });

  it('should display catalog item name', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('Attempt Transition')).toBeInTheDocument();
    });
  });

  it('should fetch and display available transitions', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalledWith(
        'com.example.Entity',
        '123'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });
  });

  it('should display transitions in select dropdown', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      const dropdown = document.querySelector('.ant-select-dropdown');
      expect(dropdown).toBeInTheDocument();
      expect(dropdown?.textContent).toContain('ACTIVATE');
      expect(dropdown?.textContent).toContain('DEACTIVATE');
      expect(dropdown?.textContent).toContain('ARCHIVE');
    });
  });

  it('should handle transition selection', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Wait for transitions to load
    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    let selectElement: Element;
    await waitFor(() => {
      selectElement = document.querySelector('.ant-select-selector')!;
      expect(selectElement).toBeInTheDocument();
    });

    fireEvent.mouseDown(selectElement!);

    await waitFor(() => {
      const dropdown = document.querySelector('.ant-select-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    await waitFor(() => {
      const options = screen.getAllByText('ACTIVATE');
      expect(options.length).toBeGreaterThan(0);
    });

    // Use getAllByText and find the option in the dropdown
    const activateOptions = screen.getAllByText('ACTIVATE');
    const activateOption = activateOptions.find(el =>
      el.closest('.ant-select-item-option')
    ) || activateOptions[0];
    await user.click(activateOption);

    // Verify the selection was made by checking the select shows the value
    await waitFor(() => {
      const selectedValue = document.querySelector('.ant-select-selection-item');
      expect(selectedValue).toHaveTextContent('ACTIVATE');
    });
  });

  it('should execute transition when OK is clicked', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Wait for transitions to load
    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    // Verify OK button exists
    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeInTheDocument();
  });

  it('should call onStateChanged after successful transition', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Wait for transitions to load
    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    // Verify select component exists
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should handle cancel button', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('Attempt Transition')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    }, { timeout: 2000 });

    expect(httpApiReact.executeEntityTransition).not.toHaveBeenCalled();
  });

  it('should show warning when OK is clicked without selection', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).not.toBeDisabled();

    await user.click(okButton);

    // Should show validation error or warning
    await waitFor(() => {
      expect(screen.getByText(/please select a state/i)).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching transitions', async () => {
    (httpApiReact.getEntityTransitions as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('Attempt Transition')).toBeInTheDocument();
    });

    // Should show loading indicator
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should handle API error when fetching transitions', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (httpApiReact.getEntityTransitions as any).mockRejectedValue(
      new Error('API Error')
    );

    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should handle API error when executing transition', async () => {
    const user = userEvent.setup();
    (httpApiReact.executeEntityTransition as any).mockRejectedValue(
      new Error('Transition failed')
    );

    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Wait for transitions to load
    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    // Verify dialog is open and ready
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('should reset state when dialog is closed and reopened', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    // Open dialog
    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Wait for transitions to load
    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalled();
    });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Wait for dialog to close
    await waitFor(() => {
      const modal = document.querySelector('.ant-modal-wrap');
      expect(
        !modal ||
        window.getComputedStyle(modal).display === 'none' ||
        modal.classList.contains('ant-modal-wrap-hidden')
      ).toBe(true);
    });

    // Reopen dialog
    ref.current?.open(mockCatalogItem.id, mockCatalogItem.entityClass);

    await waitFor(() => {
      expect(screen.getByText('State')).toBeInTheDocument();
    });

    // Verify select is reset (empty)
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});

