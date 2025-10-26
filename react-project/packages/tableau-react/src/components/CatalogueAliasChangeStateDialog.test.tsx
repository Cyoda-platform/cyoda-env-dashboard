/**
 * Unit tests for CatalogueAliasChangeStateDialog component
 */

import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
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
  { name: 'ACTIVATE', label: 'Activate' },
  { name: 'DEACTIVATE', label: 'Deactivate' },
  { name: 'ARCHIVE', label: 'Archive' },
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Change State')).toBeInTheDocument();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText(/Test Alias/)).toBeInTheDocument();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(httpApiReact.getEntityTransitions).toHaveBeenCalledWith(
        'com.example.Entity',
        '123'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
      expect(screen.getByText('Archive')).toBeInTheDocument();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    const activateOption = screen.getByText('Activate');
    await user.click(activateOption);

    await waitFor(() => {
      const okButton = screen.getByRole('button', { name: /ok/i });
      expect(okButton).not.toBeDisabled();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    // Select transition
    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    const activateOption = screen.getByText('Activate');
    await user.click(activateOption);

    // Click OK
    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(httpApiReact.executeEntityTransition).toHaveBeenCalledWith(
        'com.example.Entity',
        '123',
        'ACTIVATE'
      );
    });
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    // Select and execute transition
    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    const activateOption = screen.getByText('Activate');
    await user.click(activateOption);

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(mockOnStateChanged).toHaveBeenCalled();
    });
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Change State')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Change State')).not.toBeInTheDocument();
    });

    expect(httpApiReact.executeEntityTransition).not.toHaveBeenCalled();
  });

  it('should disable OK button when no transition is selected', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasChangeStateDialog
        ref={ref}
        onStateChanged={mockOnStateChanged}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeDisabled();
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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Change State')).toBeInTheDocument();
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

    ref.current?.open(mockCatalogItem);

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

    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    // Select and execute transition
    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    const activateOption = screen.getByText('Activate');
    await user.click(activateOption);

    const okButton = screen.getByRole('button', { name: /ok/i });
    await user.click(okButton);

    await waitFor(() => {
      expect(httpApiReact.executeEntityTransition).toHaveBeenCalled();
    });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to execute transition/i)).toBeInTheDocument();
    });
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
    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    // Select transition
    const select = screen.getByRole('combobox');
    await user.click(select);

    await waitFor(() => {
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    const activateOption = screen.getByText('Activate');
    await user.click(activateOption);

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Reopen dialog
    ref.current?.open(mockCatalogItem);

    await waitFor(() => {
      expect(screen.getByText('Select transition:')).toBeInTheDocument();
    });

    // OK button should be disabled (no selection)
    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeDisabled();
  });
});

