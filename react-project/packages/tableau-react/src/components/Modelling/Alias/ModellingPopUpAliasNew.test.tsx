/**
 * Unit tests for ModellingPopUpAliasNew component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import ModellingPopUpAliasNew from './ModellingPopUpAliasNew';

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

describe('ModellingPopUpAliasNew', () => {
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

  const mockOnCreated = vi.fn();
  const mockOnUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.post.mockResolvedValue({ data: { id: 'new-alias-id', success: true } });
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
  });

  it('should render without crashing', () => {
    const ref = React.createRef<any>();
    const { container } = render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );
    expect(container).toBeTruthy();
  });

  it('should not display modal initially', () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Create New Alias')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Alias')).not.toBeInTheDocument();
  });

  it('should open modal in create mode', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText('Create New Alias')).toBeInTheDocument();
    });
  });

  it('should open modal in edit mode', async () => {
    const editItem = {
      id: 'alias-1',
      aliasDef: {
        name: 'ExistingAlias',
        aliasType: 'SIMPLE',
        aliasPaths: {
          '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
          value: [],
        },
      },
    };

    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer', editItem);

    await waitFor(() => {
      expect(screen.getByText('Edit Alias')).toBeInTheDocument();
    });
  });

  it('should display steps for alias creation', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      // Steps component should be visible
      const steps = document.querySelector('.ant-steps');
      expect(steps).toBeInTheDocument();
    });
  });

  it('should have Basic Info step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText(/basic info/i)).toBeInTheDocument();
    });
  });

  it('should have Select Columns step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText(/select columns/i)).toBeInTheDocument();
    });
  });

  it('should have Configure Mappers step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText(/configure mappers/i)).toBeInTheDocument();
    });
  });

  it('should have Review step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText(/review/i)).toBeInTheDocument();
    });
  });

  it('should display form fields in Basic Info step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      // Name field should be present
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toBeInTheDocument();
    });
  });

  it('should display alias type selector', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      // Alias Type field should be present
      const typeSelect = screen.getByLabelText(/alias type/i);
      expect(typeSelect).toBeInTheDocument();
    });
  });

  it('should have Next button on first step', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeInTheDocument();
    });
  });

  it('should navigate to next step when Next is clicked', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText('Create New Alias')).toBeInTheDocument();
    });

    // Fill in required fields
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'TestAlias');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should move to next step
    await waitFor(() => {
      const prevButton = screen.queryByRole('button', { name: /previous/i });
      expect(prevButton).toBeInTheDocument();
    });
  });

  it('should have Previous button on later steps', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText('Create New Alias')).toBeInTheDocument();
    });

    // Fill in required fields and go to next step
    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'TestAlias');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeInTheDocument();
    });
  });

  it('should close modal when close() is called', async () => {
    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer');

    await waitFor(() => {
      expect(screen.getByText('Create New Alias')).toBeInTheDocument();
    });

    ref.current?.close();

    await waitFor(() => {
      expect(screen.queryByText('Create New Alias')).not.toBeInTheDocument();
    });
  });

  it('should pre-fill form when editing existing alias', async () => {
    const editItem = {
      id: 'alias-1',
      aliasDef: {
        name: 'ExistingAlias',
        aliasType: 'SIMPLE',
        aliasPaths: {
          '@bean': 'com.cyoda.core.reports.columns.AliasPaths',
          value: [],
        },
      },
    };

    const ref = React.createRef<any>();
    render(
      <ModellingPopUpAliasNew
        ref={ref}
        configDefinition={mockConfigDefinition}
        onCreated={mockOnCreated}
        onUpdated={mockOnUpdated}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.test.Customer', editItem);

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('ExistingAlias');
    });
  });
});

