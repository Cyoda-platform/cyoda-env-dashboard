/**
 * Tests for ReportUISettings Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import ReportUISettings from './ReportUISettings';
import { useReportsStore } from '../stores/reportsStore';
import type { ConfigDefinition } from '../types';

// Mock the dialog component
vi.mock('./ReportUISettingsDialog', () => ({
  default: ({ visible, onClose }: any) => (
    visible ? (
      <div data-testid="settings-dialog">
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null
  ),
}));

describe('ReportUISettings', () => {
  const mockConfigDefinition: ConfigDefinition = {
    id: 'config-123',
    description: 'Test Config',
    columns: [
      { name: 'name' },
      { name: 'value' },
      { name: 'status' },
    ],
  };

  beforeEach(() => {
    // Clear the store before each test
    useReportsStore.getState().clearReportsSettings();
  });

  describe('Rendering', () => {
    it('should render settings button when no id column exists', () => {
      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should not render when id column exists', () => {
      const configWithId: ConfigDefinition = {
        ...mockConfigDefinition,
        columns: [
          { name: 'id' },
          { name: 'name' },
          { name: 'value' },
        ],
      };

      const { container } = renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={configWithId}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when reportDefinitionId is empty', () => {
      const { container } = renderWithProviders(
        <ReportUISettings
          reportDefinitionId=""
          configDefinition={mockConfigDefinition}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when columns are undefined', () => {
      const configWithoutColumns: ConfigDefinition = {
        id: 'config-123',
        description: 'Test Config',
      };

      const { container } = renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={configWithoutColumns}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Button Label', () => {
    it('should show "Settings" when no ID field is configured', () => {
      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should show "Settings *" when ID field is configured', () => {
      // Set a stored setting
      useReportsStore.getState().setReportsSettings({
        id: 'report-123',
        settings: {
          idField: 'name',
        },
      });

      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings *')).toBeInTheDocument();
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', async () => {
      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      const button = screen.getByText('Settings');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('settings-dialog')).toBeInTheDocument();
      });
    });

    it('should close dialog when close button is clicked', async () => {
      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      // Open dialog
      const button = screen.getByText('Settings');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('settings-dialog')).toBeInTheDocument();
      });

      // Close dialog
      const closeButton = screen.getByText('Close Dialog');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('settings-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Store Integration', () => {
    it('should read settings from store', () => {
      // Set a stored setting
      useReportsStore.getState().setReportsSettings({
        id: 'report-123',
        settings: {
          idField: 'value',
        },
      });

      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
        />
      );

      // Button should show asterisk
      expect(screen.getByText('Settings *')).toBeInTheDocument();
    });

    it('should handle multiple reports with different settings', () => {
      // Set settings for report 1
      useReportsStore.getState().setReportsSettings({
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      });

      // Set settings for report 2
      useReportsStore.getState().setReportsSettings({
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      });

      // Render for report 1
      const { rerender } = renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-1"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings *')).toBeInTheDocument();

      // Render for report 2
      rerender(
        <ReportUISettings
          reportDefinitionId="report-2"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings *')).toBeInTheDocument();

      // Render for report 3 (no settings)
      rerender(
        <ReportUISettings
          reportDefinitionId="report-3"
          configDefinition={mockConfigDefinition}
        />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty columns array', () => {
      const configWithEmptyColumns: ConfigDefinition = {
        id: 'config-123',
        description: 'Test Config',
        columns: [],
      };

      const { container } = renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={configWithEmptyColumns}
        />
      );

      // Should NOT render because idFieldList is empty
      expect(container.firstChild).toBeNull();
    });

    it('should handle columns with missing name property', () => {
      const configWithInvalidColumns: ConfigDefinition = {
        id: 'config-123',
        description: 'Test Config',
        columns: [
          { name: 'name' },
          {} as any, // Invalid column
          { name: 'value' },
        ],
      };

      renderWithProviders(
        <ReportUISettings
          reportDefinitionId="report-123"
          configDefinition={configWithInvalidColumns}
        />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});

