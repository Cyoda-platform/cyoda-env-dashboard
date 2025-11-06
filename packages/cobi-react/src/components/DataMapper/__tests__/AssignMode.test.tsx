import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import AssignMode from '../AssignMode';

describe('AssignMode', () => {
  const mockOnChange = vi.fn();
  const mockEntityMapping = {
    entityClass: 'TestEntity',
    columns: [
      { srcColumnPath: 'data/0/name', dstColumnPath: 'name', dstCyodaColumnPathType: 'String' },
    ],
    functionalMappings: [],
    cobiCoreMetadata: [],
    script: { inputMetaPaths: [] },
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render single mode when value is single', () => {
    render(
      <AssignMode
        value="single"
        onChange={mockOnChange}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('should render multiple mode when value is multiple', () => {
    render(
      <AssignMode
        value="multiple"
        onChange={mockOnChange}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should call onChange with multiple when clicking single mode', () => {
    render(
      <AssignMode
        value="single"
        onChange={mockOnChange}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    
    const singleModeButton = screen.getByText('S');
    fireEvent.click(singleModeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('multiple');
  });

  it('should call onChange with single when clicking multiple mode', () => {
    render(
      <AssignMode
        value="multiple"
        onChange={mockOnChange}
        selectedEntityMapping={mockEntityMapping}
      />
    );
    
    const multipleModeButton = screen.getByText('M');
    fireEvent.click(multipleModeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith('single');
  });
});

