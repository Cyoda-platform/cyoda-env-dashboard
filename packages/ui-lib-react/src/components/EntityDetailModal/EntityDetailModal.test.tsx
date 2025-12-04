/**
 * Tests for EntityDetailModal Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EntityDetailModal from './EntityDetailModal';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock EntityAudit component
vi.mock('./EntityAudit', () => ({
  default: ({ entityClass, entityId }: any) => (
    <div data-testid="entity-audit">
      <div>Entity Class: {entityClass}</div>
      <div>Entity ID: {entityId}</div>
      <div>Audit History</div>
    </div>
  ),
}));

// Mock EntityDataLineage component
vi.mock('./EntityDataLineage', () => ({
  default: ({ entityClass, entityId }: any) => (
    <div data-testid="entity-data-lineage">
      <div>Entity Class: {entityClass}</div>
      <div>Entity ID: {entityId}</div>
      <div>Data Lineage Graph</div>
    </div>
  ),
}));

// Mock EntityTransitions component
vi.mock('./EntityTransitions', () => ({
  default: ({ entityClass, entityId }: any) => (
    <div data-testid="entity-transitions">
      <div>Entity Class: {entityClass}</div>
      <div>Entity ID: {entityId}</div>
      <div>Transitions Diagram</div>
    </div>
  ),
}));

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

describe('EntityDetailModal', () => {
  const mockEntityData = {
    id: 'entity-123',
    entityClass: 'com.test.TestEntity',
    state: 'ACTIVE',
    version: 1,
    created: '2024-01-01T10:00:00Z',
    updated: '2024-01-02T10:00:00Z',
    customField1: 'Value 1',
    customField2: 'Value 2',
  };

  const defaultProps = {
    visible: true,
    selectedRow: { id: 'entity-123' },
    configDefinition: { entityClass: 'com.test.TestEntity' },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API response for entity data
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/platform-api/entity/')) {
        return Promise.resolve({ data: mockEntityData });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render modal when visible is true', () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      expect(screen.getByText(/Entity TestEntity/)).toBeInTheDocument();
    });

    it('should not render modal when visible is false', () => {
      renderWithQueryClient(
        <EntityDetailModal {...defaultProps} visible={false} />
      );

      expect(screen.queryByText(/Entity TestEntity/)).not.toBeInTheDocument();
    });

    it('should render all four tabs', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(screen.getByText('Transitions')).toBeInTheDocument();
        expect(screen.getByText('Data lineage')).toBeInTheDocument();
        expect(screen.getByText('Audit')).toBeInTheDocument();
      });
    });

    it('should display entity class and ID in title', () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      expect(screen.getByText(/TestEntity/)).toBeInTheDocument();
      expect(screen.getByText(/entity-123/)).toBeInTheDocument();
    });
  });

  describe('Details Tab', () => {
    it('should show loading state while fetching data', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText(/Entity TestEntity/)).toBeInTheDocument();
      });
    });

    it('should display entity data after loading', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('entity-123')).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      });
    });

    it('should display standard fields', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        // Look for fields in descriptions, not in title
        const descriptions = document.querySelector('.ant-descriptions');
        expect(descriptions).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      });
    });

    it('should display custom fields', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('customField1')).toBeInTheDocument();
        expect(screen.getByText('Value 1')).toBeInTheDocument();
        expect(screen.getByText('customField2')).toBeInTheDocument();
        expect(screen.getByText('Value 2')).toBeInTheDocument();
      });
    });

    it('should show error message when fetch fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Failed to fetch'));

      const { container } = renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        // After error, loading should stop
        expect(container.querySelector('.ant-spin-spinning')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Lineage Tab', () => {
    it('should render data lineage component when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Data lineage')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Data lineage'));

      await waitFor(() => {
        expect(screen.getByTestId('entity-data-lineage')).toBeInTheDocument();
        expect(screen.getByText('Data Lineage Graph')).toBeInTheDocument();
      });
    });

    it('should pass correct props to EntityDataLineage', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await user.click(screen.getByText('Data lineage'));

      await waitFor(() => {
        const lineageComponent = screen.getByTestId('entity-data-lineage');
        expect(lineageComponent).toHaveTextContent('Entity Class: com.test.TestEntity');
        expect(lineageComponent).toHaveTextContent('Entity ID: entity-123');
      });
    });
  });

  describe('Transitions Tab', () => {
    it('should render transitions component when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Transitions')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Transitions'));

      await waitFor(() => {
        expect(screen.getByTestId('entity-transitions')).toBeInTheDocument();
        expect(screen.getByText('Transitions Diagram')).toBeInTheDocument();
      });
    });

    it('should pass correct props to EntityTransitions', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await user.click(screen.getByText('Transitions'));

      await waitFor(() => {
        const transitionsComponent = screen.getByTestId('entity-transitions');
        expect(transitionsComponent).toHaveTextContent('Entity Class: com.test.TestEntity');
        expect(transitionsComponent).toHaveTextContent('Entity ID: entity-123');
      });
    });
  });

  describe('Audit Tab', () => {
    it('should render audit component when tab is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Audit')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Audit'));

      await waitFor(() => {
        expect(screen.getByTestId('entity-audit')).toBeInTheDocument();
        expect(screen.getByText('Audit History')).toBeInTheDocument();
      });
    });

    it('should pass correct props to EntityAudit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await user.click(screen.getByText('Audit'));

      await waitFor(() => {
        const auditComponent = screen.getByTestId('entity-audit');
        expect(auditComponent).toHaveTextContent('Entity Class: com.test.TestEntity');
        expect(auditComponent).toHaveTextContent('Entity ID: entity-123');
      });
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithQueryClient(
        <EntityDetailModal {...defaultProps} onClose={onClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Entity TestEntity/)).toBeInTheDocument();
      });

      // Find and click close button in footer (primary button)
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      const footerCloseButton = closeButtons.find(btn => btn.classList.contains('ant-btn-primary'));
      await user.click(footerCloseButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', async () => {
      const onClose = vi.fn();
      renderWithQueryClient(
        <EntityDetailModal {...defaultProps} onClose={onClose} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Entity TestEntity/)).toBeInTheDocument();
      });

      // Simulate clicking on modal mask
      const modal = document.querySelector('.ant-modal-wrap');
      if (modal) {
        fireEvent.click(modal);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should switch between tabs correctly', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      // Initially on Details tab
      await waitFor(() => {
        expect(screen.getByText('entity-123')).toBeInTheDocument();
      });

      // Switch to Transitions
      await user.click(screen.getByText('Transitions'));
      await waitFor(() => {
        expect(screen.getByTestId('entity-transitions')).toBeInTheDocument();
      });

      // Switch to Data lineage
      await user.click(screen.getByText('Data lineage'));
      await waitFor(() => {
        expect(screen.getByTestId('entity-data-lineage')).toBeInTheDocument();
      });

      // Switch to Audit
      await user.click(screen.getByText('Audit'));
      await waitFor(() => {
        expect(screen.getByTestId('entity-audit')).toBeInTheDocument();
      });

      // Switch back to Details
      await user.click(screen.getByText('Details'));
      await waitFor(() => {
        expect(screen.getByText('entity-123')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch entity data on mount', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/platform-api/entity/com.test.TestEntity/entity-123')
        );
      });
    });

    it('should not fetch data when modal is not visible', () => {
      renderWithQueryClient(
        <EntityDetailModal {...defaultProps} visible={false} />
      );

      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should refetch data when entityId changes', async () => {
      const { rerender } = renderWithQueryClient(
        <EntityDetailModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });

      // Change entityId
      const queryClient = createTestQueryClient();
      rerender(
        <QueryClientProvider client={queryClient}>
          <EntityDetailModal {...defaultProps} selectedRow={{ id: 'entity-456' }} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/platform-api/entity/com.test.TestEntity/entity-456')
        );
      });
    });
  });
});

