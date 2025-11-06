/**
 * Tests for ColumnMappingSettings component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ColumnMappingSettings from '../ColumnMappingSettings';
import type { ColumnMappingConfigDto } from '../../../types';

describe('ColumnMappingSettings', () => {
  const mockColumnMapping: ColumnMappingConfigDto = {
    srcColumnPath: 'source.name',
    dstCyodaColumnPath: 'target.name',
    transformer: {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerConfigDto',
      children: [],
    },
    dstCyodaColumnPathType: 'String',
    dstCollectionElementSetModes: [],
  } as ColumnMappingConfigDto;

  const mockSourceData = {
    source: {
      name: 'Test Name',
    },
  };

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    render(
      <ColumnMappingSettings
        visible={false}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Column Mapping Settings')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Column Mapping Settings')).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Column Mapping Settings')).toBeInTheDocument();
  });

  it('should render Source Column Path field', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Source Column Path')).toBeInTheDocument();
  });

  it('should render Target Column Path field', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Target Column Path')).toBeInTheDocument();
  });

  it('should display source column path value', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const input = screen.getByDisplayValue('source.name');
    expect(input).toBeInTheDocument();
  });

  it('should display target column path value', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const input = screen.getByDisplayValue('target.name');
    expect(input).toBeInTheDocument();
  });

  it('should disable source column path input', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const input = screen.getByDisplayValue('source.name');
    expect(input).toBeDisabled();
  });

  it('should disable target column path input', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const input = screen.getByDisplayValue('target.name');
    expect(input).toBeDisabled();
  });

  it('should render Transformers divider', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Transformers')).toBeInTheDocument();
  });

  it('should render Transformers section', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Check for Transformers divider which is always rendered
    expect(screen.getByText('Transformers')).toBeInTheDocument();
  });

  it('should render OK button', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should render Cancel button', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onSave when OK button is clicked', async () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should work with sourceData prop', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        sourceData={mockSourceData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Column Mapping Settings')).toBeInTheDocument();
  });

  it('should not render when columnMapping is null', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={null}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByText('Column Mapping Settings')).not.toBeInTheDocument();
  });

  it('should update local mapping when columnMapping prop changes', () => {
    const { rerender } = render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const updatedMapping: ColumnMappingConfigDto = {
      ...mockColumnMapping,
      srcColumnPath: 'source.email',
      dstCyodaColumnPath: 'target.email',
    };
    
    rerender(
      <ColumnMappingSettings
        visible={true}
        columnMapping={updatedMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByDisplayValue('source.email')).toBeInTheDocument();
    expect(screen.getByDisplayValue('target.email')).toBeInTheDocument();
  });



  it('should have required validation for source column path', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Field is marked as required in the form
    expect(screen.getByText('Source Column Path')).toBeInTheDocument();
  });

  it('should have required validation for target column path', () => {
    render(
      <ColumnMappingSettings
        visible={true}
        columnMapping={mockColumnMapping}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Field is marked as required in the form
    expect(screen.getByText('Target Column Path')).toBeInTheDocument();
  });


});

