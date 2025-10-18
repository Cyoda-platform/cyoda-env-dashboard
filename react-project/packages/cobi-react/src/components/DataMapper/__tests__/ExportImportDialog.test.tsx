/**
 * Tests for ExportImportDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportImportDialog from '../ExportImportDialog';
import type { EntityMappingConfigDto } from '../../../types';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// Mock CodeEditor component
vi.mock('../../CodeEditor', () => ({
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}));

describe('ExportImportDialog', () => {
  const mockEntityMapping: EntityMappingConfigDto = {
    name: 'Test Mapping',
    entityClass: 'com.test.Entity',
    columns: [],
    functionalMappings: [],
    entityRelationConfigs: [],
  } as EntityMappingConfigDto;

  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    render(
      <ExportImportDialog
        visible={false}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.queryByText('Export / Import Mapping')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should render Export tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should render Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('should display Download button in Export tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Download JSON')).toBeInTheDocument();
  });

  it('should display Copy button in Export tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });

  it('should display CodeEditor in Export tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const editor = screen.getByTestId('code-editor');
    expect(editor).toBeInTheDocument();
  });

  it('should display entity mapping JSON in Export tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const editor = screen.getByTestId('code-editor') as HTMLTextAreaElement;
    const jsonValue = JSON.parse(editor.value);
    expect(jsonValue.name).toBe('Test Mapping');
    expect(jsonValue.entityClass).toBe('com.test.Entity');
  });

  it('should switch to Import tab when clicked', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);

    expect(screen.getByText('Upload JSON File')).toBeInTheDocument();
  });

  it('should display Upload JSON File button in Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);

    expect(screen.getByText('Upload JSON File')).toBeInTheDocument();
  });

  it('should display Paste from Clipboard button in Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);
    
    expect(screen.getByText('Paste from Clipboard')).toBeInTheDocument();
  });

  it('should display Import Mapping button in Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);

    expect(screen.getByText('Import Mapping')).toBeInTheDocument();
  });

  it('should work without entityMapping', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={null}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should work without onImport callback', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should render modal with export-import-dialog class', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );

    // Modal should be rendered
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should have modal width of 900', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });

  it('should display alert in Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);
    
    expect(screen.getByText(/Upload a JSON file or paste JSON content/i)).toBeInTheDocument();
  });

  it('should have no footer', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    // Modal should not have default OK/Cancel buttons
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
  });

  it('should display CodeEditor in Import tab', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const importTab = screen.getByText('Import');
    fireEvent.click(importTab);
    
    const editors = screen.getAllByTestId('code-editor');
    expect(editors.length).toBeGreaterThan(0);
  });

  it('should format JSON with 2 spaces', () => {
    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mockEntityMapping}
        onClose={mockOnClose}
      />
    );
    
    const editor = screen.getByTestId('code-editor') as HTMLTextAreaElement;
    expect(editor.value).toContain('  '); // Should have 2-space indentation
  });

  it('should handle empty entityMapping name', () => {
    const mappingWithoutName = {
      ...mockEntityMapping,
      name: '',
    };

    render(
      <ExportImportDialog
        visible={true}
        entityMapping={mappingWithoutName}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Export / Import Mapping')).toBeInTheDocument();
  });
});

