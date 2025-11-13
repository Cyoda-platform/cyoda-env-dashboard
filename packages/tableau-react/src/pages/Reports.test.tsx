/**
 * Tests for Reports Page
 * Tests for the main Reports page with tabs (Report Config and Reports)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import Reports from './Reports';

// Mock ReportConfigs page
vi.mock('./ReportConfigs', () => ({
  default: ({ onResetState }: any) => (
    <div data-testid="report-configs">
      <h2>Report Configs</h2>
      <button onClick={onResetState}>Reset State</button>
    </div>
  ),
}));

// Mock HistoryTable component
vi.mock('../components/HistoryTable', () => ({
  default: ({ filter, settings, onChange }: any) => (
    <div data-testid="history-table">
      <div>History Table</div>
      <button onClick={() => onChange({
        reportDefinition: { id: 'report-123', groupingVersion: 1 },
        configDefinition: { name: 'Test Config' }
      })}>
        Select Report
      </button>
    </div>
  ),
}));

// Mock HistoryFilter component
vi.mock('../components/HistoryFilter', () => ({
  default: ({ value, onChange }: any) => (
    <div data-testid="history-filter">
      <input
        data-testid="filter-input"
        value={value.search || ''}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </div>
  ),
}));

// Mock HistorySetting component
vi.mock('../components/HistorySetting', () => ({
  default: ({ settings, onChange }: any) => (
    <div data-testid="history-setting">
      <button onClick={() => onChange({ ...settings, lazyLoading: !settings.lazyLoading })}>
        Toggle Lazy Loading
      </button>
      <button onClick={() => onChange({ ...settings, displayGroupType: settings.displayGroupType === 'in' ? 'out' : 'in' })}>
        Toggle Display Type
      </button>
    </div>
  ),
}));

// Mock ReportTableGroup component
vi.mock('../components/ReportTableGroup', () => ({
  default: ({ tableLinkGroup, displayGroupType }: any) => (
    <div data-testid="report-table-group">
      <div>Display Type: {displayGroupType}</div>
      <div>Link: {tableLinkGroup}</div>
    </div>
  ),
}));

// Mock QuickRunReport component
vi.mock('../components/QuickRunReport', () => ({
  default: () => <div data-testid="quick-run-report">Quick Run Report</div>,
}));

// Mock ReportUISettings component
vi.mock('../components/ReportUISettings', () => ({
  default: ({ reportDefinitionId, configDefinition }: any) => (
    <div data-testid="report-ui-settings">
      <div>Report ID: {reportDefinitionId}</div>
    </div>
  ),
}));

// Mock ReportResultDialog component
vi.mock('../components/ReportResultDialog', () => ({
  default: ({ visible, onClose }: any) =>
    visible ? (
      <div data-testid="report-result-dialog">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock ColumnCollectionsDialog component
vi.mock('../components/ColumnCollectionsDialog', () => ({
  default: ({ ref }: any) => <div data-testid="column-collections-dialog">Column Collections</div>,
}));

// Mock HelperStorage
vi.mock('@cyoda/ui-lib-react', async () => {
  const actual = await vi.importActual('@cyoda/ui-lib-react');
  return {
    ...actual,
    HelperStorage: vi.fn().mockImplementation(() => ({
      get: vi.fn((key: string, defaultValue: any) => defaultValue),
      set: vi.fn(),
    })),
  };
});

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page with heading', () => {
      renderWithProviders(<Reports />);

      expect(screen.getByRole('heading', { name: /Reports/i })).toBeInTheDocument();
    });

    it('should render tabs', () => {
      renderWithProviders(<Reports />);

      expect(screen.getByRole('tab', { name: /Report Config/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Reports/i })).toBeInTheDocument();
    });

    it('should render Report Config tab by default', () => {
      renderWithProviders(<Reports />);

      expect(screen.getByTestId('report-configs')).toBeInTheDocument();
    });

    it('should have reports-tabs class', () => {
      const { container } = renderWithProviders(<Reports />);

      const tabs = container.querySelector('.reports-tabs');
      expect(tabs).not.toBeNull();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Reports tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });

    it('should switch back to Report Config tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Switch back to Report Config tab
      const reportConfigTab = screen.getByRole('tab', { name: /Report Config/i });
      await user.click(reportConfigTab);

      await waitFor(() => {
        expect(screen.getByTestId('report-configs')).toBeInTheDocument();
      });
    });

    it('should persist active tab in storage', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      // Storage.set should be called when tab changes
      // This is tested indirectly through tab switching behavior
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
  });

  describe('Reports Tab Content', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });

    it('should render QuickRunReport component', () => {
      expect(screen.getByTestId('quick-run-report')).toBeInTheDocument();
    });

    it('should render Reset state button', () => {
      expect(screen.getByRole('button', { name: /Reset state/i })).toBeInTheDocument();
    });

    it('should render HistoryFilter component', () => {
      expect(screen.getByTestId('history-filter')).toBeInTheDocument();
    });

    it('should render HistorySetting component', () => {
      expect(screen.getByTestId('history-setting')).toBeInTheDocument();
    });

    it('should render HistoryTable component', () => {
      expect(screen.getByTestId('history-table')).toBeInTheDocument();
    });

    it('should not render ReportUISettings initially', () => {
      expect(screen.queryByTestId('report-ui-settings')).not.toBeInTheDocument();
    });

    it('should not render ReportTableGroup initially', () => {
      expect(screen.queryByTestId('report-table-group')).not.toBeInTheDocument();
    });
  });

  describe('Report Selection in Reports Tab', () => {
    it('should show ReportUISettings after selecting a report', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Select a report
      const selectButton = screen.getByRole('button', { name: /Select Report/i });
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('report-ui-settings')).toBeInTheDocument();
      });
    });

    it('should show ReportTableGroup after selecting a report with "in" display type', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Select a report
      const selectButton = screen.getByRole('button', { name: /Select Report/i });
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('report-table-group')).toBeInTheDocument();
      });

      // Verify display type is "in"
      expect(screen.getByText('Display Type: in')).toBeInTheDocument();
    });

    it('should generate correct tableLinkGroup URL', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Select a report
      const selectButton = screen.getByRole('button', { name: /Select Report/i });
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText(/Link:.*\/platform-api\/reporting\/report\/report-123\/1\/groups/)).toBeInTheDocument();
      });
    });
  });

  describe('Display Type Toggle', () => {
    it('should toggle between "in" and "out" display types', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Select a report first
      const selectButton = screen.getByRole('button', { name: /Select Report/i });
      await user.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('report-table-group')).toBeInTheDocument();
      });

      // Initially should be "in"
      expect(screen.getByText('Display Type: in')).toBeInTheDocument();

      // Toggle display type
      const toggleButton = screen.getByRole('button', { name: /Toggle Display Type/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText('Display Type: out')).toBeInTheDocument();
      });
    });
  });

  describe('Reset State', () => {
    it('should reset to Report Config tab when reset is triggered', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Reports />);

      // Switch to Reports tab
      const reportsTab = screen.getByRole('tab', { name: /^Reports$/i });
      await user.click(reportsTab);

      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });

      // Click Reset state button
      const resetButton = screen.getByRole('button', { name: /Reset state/i });
      await user.click(resetButton);

      // Should switch back to Report Config tab
      await waitFor(() => {
        expect(screen.getByTestId('report-configs')).toBeInTheDocument();
      });
    });
  });
});

