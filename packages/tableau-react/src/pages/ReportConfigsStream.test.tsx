/**
 * Tests for ReportConfigsStream Page
 * Tests for Stream Reports list page with Export/Import functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createTestQueryClient } from '../test/test-utils';
import ReportConfigsStream from './ReportConfigsStream';
import { axios as httpApiAxios } from '@cyoda/http-api-react';

// Mock axios
vi.mock('axios');

// Mock http-api-react with all necessary exports
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
    useGlobalUiSettingsStore: vi.fn(() => ({
      dateFormat: 'YYYY.MM.DD',
      timeFormat: 'HH:mm:ss',
      entityType: 'test.Entity',
    })),
    getReportConfig: vi.fn(),
    getReportingFetchTypes: vi.fn().mockResolvedValue({ data: ['Entity1', 'Entity2'] }),
    getHistory: vi.fn(),
  };
});

const mockedHttpApiAxios = vi.mocked(httpApiAxios);

// Mock the ConfigEditorStreamGrid component
vi.mock('@cyoda/ui-lib-react', async () => {
  const actual = await vi.importActual('@cyoda/ui-lib-react');
  const React = await import('react');
  return {
    ...actual,
    ConfigEditorStreamGrid: React.forwardRef(({ onFetchDefinition, onLoadData }: any, ref: any) => {
      // Expose methods via ref
      React.useImperativeHandle(ref, () => ({
        open: vi.fn((id: string) => {
          console.log('ConfigEditorStreamGrid.open called with:', id);
        }),
      }));
      return <div data-testid="config-editor-stream-grid">Stream Grid Mock</div>;
    }),
  };
});

// Mock CreateReportDialog
vi.mock('../components/CreateReportDialog', () => ({
  default: ({ visible, onCancel, onCreate }: any) =>
    visible ? (
      <div data-testid="create-report-dialog">
        <button onClick={() => onCreate({ name: 'Test Stream', entityClass: 'TestEntity' })}>
          Create
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Mock ReportScheduling
vi.mock('../components/ReportScheduling', () => ({
  default: ({ visible, onClose }: any) =>
    visible ? (
      <div data-testid="report-scheduling">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock HistoryFilter
vi.mock('../components/HistoryFilter', () => ({
  default: ({ value, onChange }: any) => (
    <div data-testid="history-filter">
      <input
        data-testid="filter-search"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ReportConfigsStream Page', () => {
  const mockStreamReports = [
    {
      id: 'stream-1',
      name: 'Test Stream Report 1',
      description: 'Description 1',
      streamDataDef: {
        requestClass: 'com.test.Entity1',
      },
      createDate: '2024-01-01T10:00:00Z',
      username: 'user1',
    },
    {
      id: 'stream-2',
      name: 'Test Stream Report 2',
      description: 'Description 2',
      streamDataDef: {
        requestClass: 'com.test.Entity2',
      },
      createDate: '2024-01-02T10:00:00Z',
      username: 'user2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock API responses
    mockedHttpApiAxios.get.mockImplementation((url: string) => {
      if (url.includes('/platform-api/reporting/stream-definitions')) {
        return Promise.resolve({ data: mockStreamReports });
      }
      if (url.includes('/platform-api/entity-info/fetch/types')) {
        return Promise.resolve({
          data: [
            { name: 'com.test.Entity1', type: 'BUSINESS' },
            { name: 'com.test.Entity2', type: 'BUSINESS' },
          ]
        });
      }
      if (url.includes('/platform-api/users')) {
        return Promise.resolve({ data: ['user1', 'user2'] });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockedHttpApiAxios.post.mockImplementation((url: string, data: any) => {
      if (url.includes('/platform-api/reporting/stream-definitions')) {
        return Promise.resolve({
          data: { id: 'new-stream-id', ...data },
        });
      }
      if (url.includes('/platform-api/users/list')) {
        return Promise.resolve({
          data: [
            { userId: 'user1', username: 'user1', firstName: 'User', lastName: '1' },
            { userId: 'user2', username: 'user2', firstName: 'User', lastName: '2' },
          ],
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockedHttpApiAxios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('should render the page', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
        expect(screen.getByText('Export')).toBeInTheDocument();
        expect(screen.getByText('Import')).toBeInTheDocument();
        expect(screen.getByText('Reset state')).toBeInTheDocument();
      });
    });

    it('should render history filter', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByTestId('history-filter')).toBeInTheDocument();
      });
    });

    it('should render table with stream reports', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Test Stream Report 1')).toBeInTheDocument();
        expect(screen.getByText('Test Stream Report 2')).toBeInTheDocument();
      });
    });
  });

  describe('Create New Stream Report', () => {
    it('should open create dialog when clicking Create New', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create New'));

      await waitFor(() => {
        expect(screen.getByTestId('create-report-dialog')).toBeInTheDocument();
      });
    });

    it('should create new stream report and navigate to editor', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Create New')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create New'));

      await waitFor(() => {
        expect(screen.getByTestId('create-report-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockedHttpApiAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/platform-api/streamdata/definitions'),
          expect.objectContaining({
            name: 'Test Stream',
            entityClass: 'TestEntity',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/tableau/reports/stream/new-stream-id');
      });
    });
  });

  describe('Export Functionality', () => {
    it('should disable export button when no rows selected', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        const exportButton = screen.getByText('Export').closest('button');
        expect(exportButton).toBeDisabled();
      });
    });

    it('should enable export button when rows are selected', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Test Stream Report 1')).toBeInTheDocument();
      });

      // Select a row by clicking checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First checkbox is "select all"

      await waitFor(() => {
        const exportButton = screen.getByText('Export').closest('button');
        expect(exportButton).not.toBeDisabled();
      });
    });
  });

  describe('Import Functionality', () => {
    it('should render import button', async () => {
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Import')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Stream Report', () => {
    it('should delete stream report when clicking delete button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByText('Test Stream Report 1')).toBeInTheDocument();
      });

      // Find and click delete button (trash icon)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockedHttpApiAxios.delete).toHaveBeenCalledWith(
            expect.stringContaining('/platform-api/streamdata/definitions/stream-1')
          );
        });
      }
    });
  });

  describe('Reset State', () => {
    it('should reset filters when clicking reset state', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ReportConfigsStream />);

      await waitFor(() => {
        expect(screen.getByTestId('filter-search')).toBeInTheDocument();
      });

      // Type in search filter
      const searchInput = screen.getByTestId('filter-search');
      await user.type(searchInput, 'test search');

      expect(searchInput).toHaveValue('test search');

      // Click reset state
      await user.click(screen.getByText('Reset state'));

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });
});

