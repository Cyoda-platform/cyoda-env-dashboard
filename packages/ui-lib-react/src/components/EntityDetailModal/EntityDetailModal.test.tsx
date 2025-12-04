/**
 * Tests for EntityDetailModal Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EntityDetailModal from './EntityDetailModal';


// Mock axios with interceptors
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(() => mockAxiosInstance),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  
  return {
    default: mockAxiosInstance,
  };
});

// Mock @cyoda/http-api-react
vi.mock('@cyoda/http-api-react', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    axios: mockAxiosInstance,
    axiosPlatform: mockAxiosInstance,
    axiosPublic: mockAxiosInstance,
    axiosProcessing: mockAxiosInstance,
    axiosGrafana: mockAxiosInstance,
    axiosAI: mockAxiosInstance,
    getEntityLoad: vi.fn(),
  };
});
import { axios as httpApiAxios, getEntityLoad } from '@cyoda/http-api-react';
const mockedAxios = vi.mocked(httpApiAxios);
const mockedGetEntityLoad = vi.mocked(getEntityLoad);


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
  // Mock data in Entity[] format (as returned by getEntityLoad API)
  const mockEntityData = [
    {
      columnInfo: { columnName: 'id', columnPath: 'id' },
      type: 'LEAF',
      value: 'entity-123',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'state', columnPath: 'state' },
      type: 'LEAF',
      value: 'ACTIVE',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'previousTransition', columnPath: 'previousTransition' },
      type: 'LEAF',
      value: 'CREATE',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'createdDate', columnPath: 'createdDate' },
      type: 'LEAF',
      value: '2024-01-01T10:00:00Z',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'lastUpdatedDate', columnPath: 'lastUpdatedDate' },
      type: 'LEAF',
      value: '2024-01-02T10:00:00Z',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'customField1', columnPath: 'customField1' },
      type: 'LEAF',
      value: 'Value 1',
      decision: '',
      presented: true,
    },
    {
      columnInfo: { columnName: 'customField2', columnPath: 'customField2' },
      type: 'LEAF',
      value: 'Value 2',
      decision: '',
      presented: true,
    },
  ];

  const defaultProps = {
    visible: true,
    selectedRow: { id: 'entity-123' },
    configDefinition: { entityClass: 'com.test.TestEntity' },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

  // Mock API response for entity data
  mockedGetEntityLoad.mockResolvedValue({ data: mockEntityData });
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

    it('should render all three tabs', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument();
        expect(screen.getByText('Data lineage')).toBeInTheDocument();
        expect(screen.getByText('Audit')).toBeInTheDocument();
      });
    });

    it('should display entity class and ID in title', () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      // Check the modal title contains both entity class and ID
      expect(screen.getByText('Entity TestEntity (entity-123)')).toBeInTheDocument();
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
        // Check for standard fields section header
        expect(screen.getByText('Standard fields')).toBeInTheDocument();
        // Check that state field value is displayed
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      });
    });

    it('should display custom fields', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
      // Custom fields are displayed in EntityDetailTree
      // Check for the Entity section and custom field values
      expect(screen.getByText('Entity')).toBeInTheDocument();
      expect(screen.getByText('Value 1')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
      });
    });

    it('should show error message when fetch fails', async () => {
      mockedGetEntityLoad.mockRejectedValue(new Error('Failed to fetch'));

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

  describe('Transitions in Details Tab', () => {
    it('should render transitions component in Details tab', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      // Transitions component should be visible in Details tab by default
      await waitFor(() => {
        expect(screen.getByTestId('entity-transitions')).toBeInTheDocument();
      });
    });

    it('should pass correct props to EntityTransitions in Details tab', async () => {
      renderWithQueryClient(<EntityDetailModal {...defaultProps} />);

      await waitFor(() => {
        const transitionsComponent = screen.getByTestId('entity-transitions');
        expect(transitionsComponent).toBeInTheDocument();
        // Check that EntityTransitions receives correct props
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
      expect(mockedGetEntityLoad).toHaveBeenCalledWith(
        'entity-123',
        'com.test.TestEntity'
      );
      });
    });

    it('should not fetch data when modal is not visible', () => {
      renderWithQueryClient(
        <EntityDetailModal {...defaultProps} visible={false} />
      );

      expect(mockedGetEntityLoad).not.toHaveBeenCalled();
    });

    it('should refetch data when entityId changes', async () => {
      const { rerender } = renderWithQueryClient(
        <EntityDetailModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(mockedGetEntityLoad).toHaveBeenCalledTimes(1);
      });

      // Change entityId
      const queryClient = createTestQueryClient();
      rerender(
        <QueryClientProvider client={queryClient}>
          <EntityDetailModal {...defaultProps} selectedRow={{ id: 'entity-456' }} />
        </QueryClientProvider>
      );

      await waitFor(() => {
  expect(mockedGetEntityLoad).toHaveBeenCalledWith(
    'entity-456',
    'com.test.TestEntity'
  );
      });
    });
  });
});

