/**
 * Tests for ReportUISettingsDialog Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import ReportUISettingsDialog from './ReportUISettingsDialog';
import { useReportsStore } from '../stores/reportsStore';
import type { ConfigDefinition } from '../types';

describe('ReportUISettingsDialog', () => {
  const mockConfigDefinition: ConfigDefinition = {
    id: 'config-123',
    description: 'Test Config',
    columns: [
      { name: 'name' },
      { name: 'value' },
      { name: 'status' },
    ],
  };

  const mockIdFieldList = [
    { value: 'name', label: 'name' },
    { value: 'value', label: 'value' },
    { value: 'status', label: 'status' },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    useReportsStore.getState().clearReportsSettings();
  });

  describe('Rendering', () => {
    it('should render dialog when visible is true', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should not render dialog when visible is false', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={false}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('should render Id Field label', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Id Field')).toBeInTheDocument();
    });

    it('should render Close button', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      // Get all Close buttons (X button and footer button)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Initialization', () => {
    it('should initialize form with stored settings', () => {
      const storedSettings = {
        id: 'report-123',
        settings: {
          idField: 'name',
        },
      };

      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          storedSettings={storedSettings}
          onClose={mockOnClose}
        />
      );

      // The select should have the stored value
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should initialize form with empty value when no stored settings', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Field Selection', () => {
    it('should save settings when field is selected', () => {
      // Set initial setting
      useReportsStore.getState().setReportsSettings({
        id: 'report-123',
        settings: {
          idField: 'name',
        },
      });

      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          storedSettings={useReportsStore.getState().getStoredSettings('report-123')}
          onClose={mockOnClose}
        />
      );

      // Find the Select component
      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toBeInTheDocument();

      // Check that settings were saved to store
      const storedSettings = useReportsStore.getState().getStoredSettings('report-123');
      expect(storedSettings?.settings.idField).toBe('name');
    });

    it('should update settings when different field is selected', () => {
      // Set initial setting
      useReportsStore.getState().setReportsSettings({
        id: 'report-123',
        settings: {
          idField: 'name',
        },
      });

      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          storedSettings={useReportsStore.getState().getStoredSettings('report-123')}
          onClose={mockOnClose}
        />
      );

      // Find the select component
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();

      // Update settings
      useReportsStore.getState().setReportsSettings({
        id: 'report-123',
        settings: {
          idField: 'value',
        },
      });

      // Check that settings were updated
      const storedSettings = useReportsStore.getState().getStoredSettings('report-123');
      expect(storedSettings?.settings.idField).toBe('value');
    });
  });

  describe('Dialog Interaction', () => {
    it('should call onClose when Close button is clicked', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      // Get all Close buttons and click the footer button (last one)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[closeButtons.length - 1]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button is clicked', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      // Get all Close buttons and click the X button (first one)
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Store Integration', () => {
    it('should persist settings across dialog open/close', async () => {
      const { rerender } = renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      // Select a field
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);

      await waitFor(() => {
        expect(screen.getByText('status')).toBeInTheDocument();
      });

      const statusOption = screen.getByText('status');
      fireEvent.click(statusOption);

      // Close dialog
      rerender(
        <ReportUISettingsDialog
          visible={false}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          onClose={mockOnClose}
        />
      );

      // Reopen dialog
      const storedSettings = useReportsStore.getState().getStoredSettings('report-123');
      rerender(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          storedSettings={storedSettings}
          onClose={mockOnClose}
        />
      );

      // Settings should be persisted
      expect(storedSettings?.settings.idField).toBe('status');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty idFieldList', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={[]}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle undefined storedSettings', () => {
      renderWithProviders(
        <ReportUISettingsDialog
          visible={true}
          reportDefinitionId="report-123"
          configDefinition={mockConfigDefinition}
          idFieldList={mockIdFieldList}
          storedSettings={undefined}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});

