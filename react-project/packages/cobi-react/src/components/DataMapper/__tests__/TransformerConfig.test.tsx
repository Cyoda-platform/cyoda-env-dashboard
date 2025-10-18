/**
 * Tests for TransformerConfig component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransformerConfig from '../TransformerConfig';
import type { ColumnMappingConfigDto } from '../../../types';

describe('TransformerConfig', () => {
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

  const mockTransformerWithChildren = {
    '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerConfigDto',
    children: [
      {
        '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerChildConfigDto',
        transformerKey: 'TRIM',
        parameters: {},
        restriction: null,
      },
      {
        '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerChildConfigDto',
        transformerKey: 'UPPER_CASE',
        parameters: {},
        restriction: null,
      },
    ],
  };

  const mockSourceData = {
    source: {
      name: 'Test Name',
    },
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });

  it('should display relation information', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Relation:/i)).toBeInTheDocument();
    expect(screen.getByText(/source.name/)).toBeInTheDocument();
    expect(screen.getByText(/target.name/)).toBeInTheDocument();
  });

  it('should display inbound data information', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        sourceData={mockSourceData}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Inbound data:/i)).toBeInTheDocument();
  });

  it('should show empty state when no transformers', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/No transformers yet/i)).toBeInTheDocument();
  });

  it('should show Add Transformer button in empty state', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText('Add Transformer')).toBeInTheDocument();
  });

  it('should call onChange when Add Transformer is clicked', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const addButton = screen.getByText('Add Transformer');
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should render transformer items when children exist', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const transformerItems = container.querySelectorAll('.transformer-item');
    expect(transformerItems.length).toBe(2);
  });

  it('should display transformer select dropdowns', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const selects = container.querySelectorAll('.ant-select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('should display delete buttons for transformers', () => {
    render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should call onChange when transformer is deleted', () => {
    render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should work without sourceData', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });

  it('should display transformer info section', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.dialog-title-info')).toBeInTheDocument();
  });



  it('should display transformer with parameters', () => {
    const transformerWithParams = {
      '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerConfigDto',
      children: [
        {
          '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerChildConfigDto',
          transformerKey: 'SUBSTRING',
          parameters: {
            start: 0,
            end: 10,
          },
          restriction: null,
        },
      ],
    };

    const { container } = render(
      <TransformerConfig
        transformer={transformerWithParams}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });

  it('should render empty description when no transformers', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const empty = container.querySelector('.ant-empty');
    expect(empty).toBeInTheDocument();
  });

  it('should add new transformer with correct structure', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const addButton = screen.getByText('Add Transformer');
    fireEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({
            '@bean': 'com.cyoda.plugins.mapping.core.dtos.TransformerChildConfigDto',
            transformerKey: '',
            parameters: {},
            restriction: null,
          }),
        ]),
      })
    );
  });

  it('should remove transformer at correct index', () => {
    render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        children: expect.arrayContaining([
          expect.objectContaining({
            transformerKey: 'UPPER_CASE',
          }),
        ]),
      })
    );
  });

  it('should display relation arrow', () => {
    render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it('should handle null transformer', () => {
    const { container } = render(
      <TransformerConfig
        transformer={null}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });

  it('should handle undefined transformer', () => {
    const { container } = render(
      <TransformerConfig
        transformer={undefined}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });

  it('should display multiple transformers in sequence', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockTransformerWithChildren}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    const transformerItems = container.querySelectorAll('.transformer-item');
    expect(transformerItems.length).toBe(2);
  });

  it('should render with transformer-config class', () => {
    const { container } = render(
      <TransformerConfig
        transformer={mockColumnMapping.transformer}
        columnMapping={mockColumnMapping}
        onChange={mockOnChange}
      />
    );
    
    expect(container.querySelector('.transformer-config')).toBeInTheDocument();
  });
});

