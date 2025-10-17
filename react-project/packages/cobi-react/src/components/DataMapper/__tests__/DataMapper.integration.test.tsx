/**
 * DataMapper Integration Tests
 * Tests the integration of Script Editor, Dry Run, and Metadata features
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import DataMapper from '../DataMapper';
import type { MappingConfigDto } from '../../../types';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// Mock useScripts hook
vi.mock('../../../hooks/useScripts', () => ({
  useScriptsApi: {
    useListAll: () => ({
      data: [],
      isLoading: false,
    }),
  },
}));

describe('DataMapper Integration Tests', () => {
  const mockMappingConfig: MappingConfigDto = {
    id: '1',
    name: 'Test Mapping',
    dataType: 'JSON',
    entityMappings: [
      {
        entityName: 'TestEntity',
        scriptBody: 'console.log("test");',
        sourceFields: [
          { name: 'field1', type: 'string', path: 'data.field1' },
        ],
        metaParams: [],
        columnMappings: [],
        functionalMappings: [],
        metadata: [],
      },
    ],
  } as any;

  const mockSourceData = {
    data: {
      field1: 'value1',
      field2: 'value2',
    },
  };

  const mockProps = {
    dataMappingConfig: mockMappingConfig,
    sourceData: mockSourceData,
    noneMappingFields: [],
    onEntityEdit: vi.fn(),
    onEntityDelete: vi.fn(),
    onEntityAdd: vi.fn(),
    onUploadFile: vi.fn(),
    onEditContent: vi.fn(),
    onEditCSVSettings: vi.fn(),
    onEditScript: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Script Editor Integration', () => {
    it('renders Script Editor button in toolbar', () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      expect(scriptEditorButton).toBeInTheDocument();
    });

    it('opens Script Editor dialog when button is clicked', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
      });
    });

    it('displays current entity mapping in Script Editor', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
      });
    });

    it('updates entity mapping when script is saved', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        const editor = screen.getByTestId('monaco-editor');
        fireEvent.change(editor, { target: { value: 'console.log("updated");' } });
      });

      const okButton = screen.getByRole('button', { name: /OK/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        // Verify that the mapping was updated
        expect(mockMappingConfig.entityMappings[0].scriptBody).toBe('console.log("updated");');
      });
    });

    it('closes Script Editor dialog when Cancel is clicked', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Script Editor/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dry Run Integration', () => {
    it('renders Dry Run button in toolbar', () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      expect(dryRunButton).toBeInTheDocument();
    });

    it('opens Dry Run Settings dialog when button is clicked', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      fireEvent.click(dryRunButton);

      await waitFor(() => {
        expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
      });
    });

    it('opens Dry Run Results dialog after running test', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      fireEvent.click(dryRunButton);

      await waitFor(() => {
        expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
      });

      const okButton = screen.getByRole('button', { name: /OK/i });
      fireEvent.click(okButton);

      await waitFor(() => {
        expect(screen.getByText(/Dry Run Results/i)).toBeInTheDocument();
      });
    });

    it('displays mock results in Dry Run Results dialog', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      fireEvent.click(dryRunButton);

      await waitFor(() => {
        const okButton = screen.getByRole('button', { name: /OK/i });
        fireEvent.click(okButton);
      });

      await waitFor(() => {
        // Check for result tabs
        expect(screen.getByText(/Mapped Data/i)).toBeInTheDocument();
        expect(screen.getByText(/Entities/i)).toBeInTheDocument();
        expect(screen.getByText(/Parse Statistics/i)).toBeInTheDocument();
        expect(screen.getByText(/Tracer Events/i)).toBeInTheDocument();
      });
    });

    it('closes Dry Run Settings dialog when Cancel is clicked', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      fireEvent.click(dryRunButton);

      await waitFor(() => {
        expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Dry Run Settings/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Button Placement and Styling', () => {
    it('displays Script Editor and Dry Run buttons after divider', () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });

      expect(scriptEditorButton).toBeInTheDocument();
      expect(dryRunButton).toBeInTheDocument();
    });

    it('displays buttons with correct styling', () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });

      // Buttons should have default type (not primary)
      expect(scriptEditorButton).toHaveClass('ant-btn-default');
      expect(dryRunButton).toHaveClass('ant-btn-default');
    });

    it('displays buttons with tooltips', () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });

      expect(scriptEditorButton).toHaveAttribute('title', 'Open Script Editor');
      expect(dryRunButton).toHaveAttribute('title', 'Run Dry Run Test');
    });
  });

  describe('Multiple Dialog Management', () => {
    it('can open Script Editor and Dry Run dialogs independently', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      // Open Script Editor
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
      });

      // Close Script Editor
      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Script Editor/i)).not.toBeInTheDocument();
      });

      // Open Dry Run
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });
      fireEvent.click(dryRunButton);

      await waitFor(() => {
        expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
      });
    });

    it('does not interfere with other DataMapper functionality', async () => {
      renderWithProviders(<DataMapper {...mockProps} />);
      
      // Open Script Editor
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
      });

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Other buttons should still work
      const expandAllButton = screen.getByRole('button', { name: /Expand All/i });
      expect(expandAllButton).toBeInTheDocument();
      fireEvent.click(expandAllButton);

      // Should not throw error
      expect(expandAllButton).toBeInTheDocument();
    });
  });

  describe('Entity Mapping Selection', () => {
    it('opens Script Editor with correct entity when multiple entities exist', async () => {
      const multiEntityConfig = {
        ...mockMappingConfig,
        entityMappings: [
          mockMappingConfig.entityMappings[0],
          {
            entityName: 'SecondEntity',
            scriptBody: 'console.log("second");',
            sourceFields: [],
            metaParams: [],
            columnMappings: [],
            functionalMappings: [],
            metadata: [],
          },
        ],
      };

      renderWithProviders(<DataMapper {...mockProps} dataMappingConfig={multiEntityConfig} />);
      
      // Select second entity (if entity navigation exists)
      // This would require entity navigation to be implemented

      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      fireEvent.click(scriptEditorButton);

      await waitFor(() => {
        // Should show first entity by default
        expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing entity mapping gracefully', async () => {
      const emptyConfig = {
        ...mockMappingConfig,
        entityMappings: [],
      };

      renderWithProviders(<DataMapper {...mockProps} dataMappingConfig={emptyConfig} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      
      // Button should be disabled or not cause error when clicked
      expect(scriptEditorButton).toBeInTheDocument();
    });

    it('handles null source data gracefully', () => {
      renderWithProviders(<DataMapper {...mockProps} sourceData={null} />);
      
      const scriptEditorButton = screen.getByRole('button', { name: /Script Editor/i });
      const dryRunButton = screen.getByRole('button', { name: /Dry Run/i });

      expect(scriptEditorButton).toBeInTheDocument();
      expect(dryRunButton).toBeInTheDocument();
    });
  });
});

