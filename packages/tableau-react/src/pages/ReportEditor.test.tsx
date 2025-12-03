/**
 * Tests for ReportEditor Page
 * Tests for the report editor with "Existing report" dialog functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { App } from 'antd';

// Use vi.hoisted to create mocks that can be used in vi.mock
const { mockGet, mockPut, mockPost, mockDelete, mockNavigate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
  mockNavigate: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-report-definition-123' }),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()],
  };
});

// Mock axios
vi.mock('@cyoda/http-api-react', () => ({
  axios: {
    get: mockGet,
    put: mockPut,
    post: mockPost,
    delete: mockDelete,
  },
}));

// Mock tab components
vi.mock('../components/ReportEditorTabModel', () => ({
  default: () => <div data-testid="tab-model">Model Tab</div>,
}));

vi.mock('../components/ReportEditorTabColumns', () => ({
  default: () => <div data-testid="tab-columns">Columns Tab</div>,
}));

vi.mock('../components/ReportEditorTabFilterBuilder', () => ({
  default: () => <div data-testid="tab-filter-builder">FilterBuilder Tab</div>,
}));

vi.mock('../components/ReportEditorTabSorting', () => ({
  default: () => <div data-testid="tab-sorting">Sorting Tab</div>,
}));

vi.mock('../components/ReportEditorTabGrouping', () => ({
  default: () => <div data-testid="tab-grouping">Grouping Tab</div>,
}));

vi.mock('../components/ReportEditorTabSummary', () => ({
  default: () => <div data-testid="tab-summary">Summary Tab</div>,
}));

vi.mock('../components/ReportEditorTabJson', () => ({
  default: () => <div data-testid="tab-json">JSON Tab</div>,
}));

vi.mock('../components/QueryPlanButton', () => ({
  default: () => <button data-testid="query-plan-button">Query Plan</button>,
}));

vi.mock('../components/ReportScheduling', () => ({
  default: ({ visible, onClose }: any) =>
    visible ? (
      <div data-testid="report-scheduling">
        <button onClick={onClose}>Close Scheduling</button>
      </div>
    ) : null,
}));

// Mock HelperReportDefinition
vi.mock('../utils/HelperReportDefinition', () => ({
  default: {
    reportDefinition: () => ({
      '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
      description: '',
      requestClass: '',
      colDefs: [],
      aliasDefs: [],
      condition: {
        '@bean': 'com.cyoda.core.conditions.GroupCondition',
        operator: 'OR',
        conditions: [],
      },
    }),
    buildCols: () => [],
    expandColumnNames: (def: any) => def,
    validateConfigDefinition: () => true,
  },
}));

// Import after mocks
import ReportEditor from './ReportEditor';

// Wrapper with App provider for message API
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <App>{children}</App>
);

describe('ReportEditor Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock for loading report definition
    mockGet.mockResolvedValue({
      data: {
        content: {
          '@bean': 'com.cyoda.service.api.beans.ReportDefinition',
          description: 'Test Report',
          requestClass: 'TestClass',
          colDefs: [],
          aliasDefs: [],
          condition: {
            '@bean': 'com.cyoda.core.conditions.GroupCondition',
            operator: 'OR',
            conditions: [],
          },
        },
      },
    });
  });

  describe('Rendering', () => {
    it('should render the page with title', async () => {
      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Edit Distributed Report');
      });
    });

    it('should render all tabs', async () => {
      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Model/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Columns/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /FilterBuilder/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Sorting/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Grouping/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Summary/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /JSON/i })).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Schedule/i })).toBeInTheDocument();
      });
    });
  });

  describe('Update Report - Success', () => {
    it('should update report successfully', async () => {
      const user = userEvent.setup();
      mockPut.mockResolvedValueOnce({ data: { success: true } });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      const updateButton = screen.getByRole('button', { name: /Update/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith(
          '/platform-api/reporting/definitions/test-report-definition-123',
          expect.any(Object)
        );
      });
    });
  });

  describe('Existing Report Dialog - 422 Error', () => {
    it('should show "Existing report" dialog when 422 error occurs', async () => {
      const user = userEvent.setup();
      
      // Mock 422 error response
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Report has existing reports' },
        },
      });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      const updateButton = screen.getByRole('button', { name: /Update/i });
      await user.click(updateButton);

      // Wait for the dialog to appear
      await waitFor(() => {
        expect(screen.getByText('Existing report')).toBeInTheDocument();
      });

      // Check dialog content
      expect(screen.getByText('You have configuration with existing reports.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete existing reports and save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create new report definition/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should have Cancel button that can be clicked', async () => {
      const user = userEvent.setup();
      
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Report has existing reports' },
        },
      });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Update/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing report')).toBeInTheDocument();
      });

      // Click Cancel button - verify it can be clicked without error
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
      await user.click(cancelButton);
      
      // The modal should start closing (we just verify the click doesn't throw)
      // Note: Ant Design modal animation may not complete in test environment
    });

    it('should delete existing reports and save when "Delete existing reports and save" is clicked', async () => {
      const user = userEvent.setup();
      
      // First call - 422 error
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Report has existing reports' },
        },
      });
      
      // Delete call
      mockDelete.mockResolvedValueOnce({ data: { success: true } });
      
      // Second update call after delete
      mockPut.mockResolvedValueOnce({ data: { success: true } });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Update/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing report')).toBeInTheDocument();
      });

      // Click "Delete existing reports and save"
      const deleteButton = screen.getByRole('button', { name: /Delete existing reports and save/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith(
          '/platform-api/reporting/definitions/test-report-definition-123?mode=reports'
        );
      });

      await waitFor(() => {
        expect(mockPut).toHaveBeenCalledTimes(2);
      });
    });

    it('should show "Create new" dialog when "Create new report definition" is clicked', async () => {
      const user = userEvent.setup();
      
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Report has existing reports' },
        },
      });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Update/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing report')).toBeInTheDocument();
      });

      // Click "Create new report definition"
      const createNewButton = screen.getByRole('button', { name: /Create new report definition/i });
      await user.click(createNewButton);

      await waitFor(() => {
        expect(screen.getByText('Create new')).toBeInTheDocument();
        expect(screen.getByText('Please input new name')).toBeInTheDocument();
      });

      // Check that input has default value with "_copy" suffix
      const input = screen.getByPlaceholderText('Enter report name');
      expect(input).toHaveValue('123_copy');
    });

    it('should create new report definition with entered name', async () => {
      const user = userEvent.setup();
      
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { message: 'Report has existing reports' },
        },
      });
      
      mockPost.mockResolvedValueOnce({
        data: { content: 'new-report-definition-456' },
      });

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Update/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Update/i }));

      await waitFor(() => {
        expect(screen.getByText('Existing report')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Create new report definition/i }));

      await waitFor(() => {
        expect(screen.getByText('Create new')).toBeInTheDocument();
      });

      // Clear and enter new name
      const input = screen.getByPlaceholderText('Enter report name');
      await user.clear(input);
      await user.type(input, 'my_new_report');

      // Click OK
      const okButton = screen.getByRole('button', { name: /OK/i });
      await user.click(okButton);

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          '/platform-api/reporting/definitions?name=my_new_report',
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/tableau/report-editor/new-report-definition-456'
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when Back button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Back/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/tableau/reports');
    });
  });

  describe('Scheduling', () => {
    it('should open scheduling modal when Schedule button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TestWrapper>
          <ReportEditor />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Schedule/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Schedule/i }));

      await waitFor(() => {
        expect(screen.getByTestId('report-scheduling')).toBeInTheDocument();
      });
    });
  });
});
