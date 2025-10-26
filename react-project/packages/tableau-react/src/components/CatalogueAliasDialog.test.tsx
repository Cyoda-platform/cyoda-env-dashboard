/**
 * Unit tests for CatalogueAliasDialog component
 */

import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CatalogueAliasDialog from './CatalogueAliasDialog';
import * as httpApiReact from '@cyoda/http-api-react';

// Mock the API functions
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual('@cyoda/http-api-react');
  return {
    ...actual,
    getEntityClasses: vi.fn(),
    getCatalogMappers: vi.fn(),
  };
});

// Mock ModellingPopUp component
vi.mock('./ModellingPopUp', () => ({
  default: React.forwardRef(({ onColumnsSelected }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      open: (entityClass: string) => {
        // Simulate column selection
        setTimeout(() => {
          onColumnsSelected([
            {
              colName: 'testColumn',
              colType: 'SIMPLE',
              path: 'test.path',
            },
          ]);
        }, 100);
      },
      close: vi.fn(),
    }));
    return <div data-testid="modelling-popup" />;
  }),
}));

const mockEntityClasses = [
  { value: 'com.example.Entity1', label: 'Entity1' },
  { value: 'com.example.Entity2', label: 'Entity2' },
];

const mockMappers = [
  {
    name: 'Mapper1',
    desc: 'Description 1',
    params: [
      { name: 'param1', type: 'STRING', required: true },
    ],
  },
  {
    name: 'Mapper2',
    desc: 'Description 2',
    params: [],
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CatalogueAliasDialog', () => {
  const mockOnCreate = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (httpApiReact.getEntityClasses as any).mockResolvedValue({
      data: mockEntityClasses,
    });
    (httpApiReact.getCatalogMappers as any).mockResolvedValue({
      data: mockMappers,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render dialog when opened', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    // Open dialog
    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Create Alias')).toBeInTheDocument();
    });
  });

  it('should show step 1: Entity selection', async () => {
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
      expect(screen.getByText('Select entity class')).toBeInTheDocument();
    });
  });

  it('should navigate to step 2 after selecting entity', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Select entity
    const entitySelect = screen.getByRole('combobox');
    await user.click(entitySelect);

    await waitFor(() => {
      const entity1Option = screen.getByText('Entity1');
      expect(entity1Option).toBeInTheDocument();
    });

    // Click next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });
  });

  it('should show step 2: Paths selection', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Navigate to step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
      expect(screen.getByText('Select columns/paths for the alias')).toBeInTheDocument();
    });
  });

  it('should open ModellingPopUp when selecting paths', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Navigate to step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    // Click select paths button
    const selectPathsButton = screen.getByRole('button', { name: /select paths/i });
    await user.click(selectPathsButton);

    expect(screen.getByTestId('modelling-popup')).toBeInTheDocument();
  });

  it('should show step 3: Name and description', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Navigate to step 2
    let nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    // Select paths
    const selectPathsButton = screen.getByRole('button', { name: /select paths/i });
    await user.click(selectPathsButton);

    // Wait for columns to be selected
    await waitFor(() => {
      expect(screen.getByText('testColumn')).toBeInTheDocument();
    });

    // Navigate to step 3
    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Alias Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  it('should auto-generate alias name from paths', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Navigate through steps
    let nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    const selectPathsButton = screen.getByRole('button', { name: /select paths/i });
    await user.click(selectPathsButton);

    await waitFor(() => {
      expect(screen.getByText('testColumn')).toBeInTheDocument();
    });

    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Alias Name') as HTMLInputElement;
      expect(nameInput.value).toBe('testColumn');
    });
  });

  it('should show step 4: Mappers configuration', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    // Navigate through all steps
    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    let nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    const selectPathsButton = screen.getByRole('button', { name: /select paths/i });
    await user.click(selectPathsButton);

    await waitFor(() => {
      expect(screen.getByText('testColumn')).toBeInTheDocument();
    });

    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Alias Name')).toBeInTheDocument();
    });

    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Mappers')).toBeInTheDocument();
    });
  });

  it('should handle cancel button', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open();

    await waitFor(() => {
      expect(screen.getByText('Create Alias')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Create Alias')).not.toBeInTheDocument();
    });
  });

  it('should handle previous button navigation', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    // Go back to step 1
    const previousButton = screen.getByRole('button', { name: /previous/i });
    await user.click(previousButton);

    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });
  });

  it('should call onCreate when creating new alias', async () => {
    const user = userEvent.setup();
    const ref = React.createRef<any>();
    render(
      <CatalogueAliasDialog
        ref={ref}
        onCreate={mockOnCreate}
        onUpdate={mockOnUpdate}
      />,
      { wrapper: createWrapper() }
    );

    ref.current?.open('com.example.Entity1');

    // Navigate through all steps and submit
    await waitFor(() => {
      expect(screen.getByText('Entity')).toBeInTheDocument();
    });

    // Step 1 -> Step 2
    let nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Select paths
    await waitFor(() => {
      expect(screen.getByText('Paths')).toBeInTheDocument();
    });

    const selectPathsButton = screen.getByRole('button', { name: /select paths/i });
    await user.click(selectPathsButton);

    await waitFor(() => {
      expect(screen.getByText('testColumn')).toBeInTheDocument();
    });

    // Step 2 -> Step 3
    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Fill in name
    await waitFor(() => {
      expect(screen.getByLabelText('Alias Name')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Alias Name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Test Alias');

    // Step 3 -> Step 4
    nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Submit
    await waitFor(() => {
      expect(screen.getByText('Mappers')).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalled();
    });
  });
});

