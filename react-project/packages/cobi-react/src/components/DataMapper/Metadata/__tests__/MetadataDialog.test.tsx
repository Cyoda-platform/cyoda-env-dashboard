/**
 * MetadataDialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/test-utils';
import MetadataDialog from '../MetadataDialog';
import type { EntityMappingConfigDto } from '../../../../types';

describe('MetadataDialog', () => {
  const mockOnUpdate = vi.fn();
  const mockEntityMapping: EntityMappingConfigDto = {
    entityName: 'TestEntity',
    metadata: [
      {
        name: 'existingMetadata',
        defaultValue: 'defaultVal',
        dstCyodaColumnPath: 'path.to.field',
        transformer: null,
      },
    ],
    columnMappings: [],
    functionalMappings: [],
  } as any;

  const dstCyodaColumnPath = 'path.to.field';
  const dstCyodaColumnPathType = 'string';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <MetadataDialog
        ref={null}
        entityMapping={mockEntityMapping}
        dstCyodaColumnPath={dstCyodaColumnPath}
        dstCyodaColumnPathType={dstCyodaColumnPathType}
        onUpdate={mockOnUpdate}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('opens dialog when open method is called', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Configuration/i)).toBeInTheDocument();
    });
  });

  it('displays destination path in dialog header', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/path\.to\.field/i)).toBeInTheDocument();
    });
  });

  it('displays destination type in dialog header', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/string/i)).toBeInTheDocument();
    });
  });

  it('loads existing metadata when available', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('existingMetadata')).toBeInTheDocument();
      expect(screen.getByDisplayValue('defaultVal')).toBeInTheDocument();
    });
  });

  it('allows editing metadata name', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('existingMetadata');
      fireEvent.change(nameInput, { target: { value: 'updatedMetadata' } });
      expect(screen.getByDisplayValue('updatedMetadata')).toBeInTheDocument();
    });
  });

  it('allows editing default value', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const valueInput = screen.getByDisplayValue('defaultVal');
      fireEvent.change(valueInput, { target: { value: 'newDefaultValue' } });
      expect(screen.getByDisplayValue('newDefaultValue')).toBeInTheDocument();
    });
  });

  it('calls onUpdate when Apply is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('existingMetadata');
      fireEvent.change(nameInput, { target: { value: 'updatedMetadata' } });
    });

    const applyButton = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedMapping = mockOnUpdate.mock.calls[0][0];
      expect(updatedMapping.metadata[0].name).toBe('updatedMetadata');
    });
  });

  it('deletes metadata when Delete button is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Configuration/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedMapping = mockOnUpdate.mock.calls[0][0];
      expect(updatedMapping.metadata.length).toBe(0);
    });
  });

  it('closes dialog when Cancel is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={mockEntityMapping}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Configuration/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('creates new metadata when none exists', async () => {
    const entityWithoutMetadata: EntityMappingConfigDto = {
      entityName: 'TestEntity',
      metadata: [],
      columnMappings: [],
      functionalMappings: [],
    } as any;

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={entityWithoutMetadata}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Configuration/i)).toBeInTheDocument();
    });

    // Fill in new metadata
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'newMetadata' } });

    const valueInput = screen.getByLabelText(/Default Value/i);
    fireEvent.change(valueInput, { target: { value: 'newValue' } });

    const applyButton = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
      const updatedMapping = mockOnUpdate.mock.calls[0][0];
      expect(updatedMapping.metadata.length).toBe(1);
      expect(updatedMapping.metadata[0].name).toBe('newMetadata');
      expect(updatedMapping.metadata[0].defaultValue).toBe('newValue');
    });
  });

  it('validates required fields', async () => {
    const entityWithoutMetadata: EntityMappingConfigDto = {
      entityName: 'TestEntity',
      metadata: [],
      columnMappings: [],
      functionalMappings: [],
    } as any;

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return (
        <MetadataDialog
          ref={ref}
          entityMapping={entityWithoutMetadata}
          dstCyodaColumnPath={dstCyodaColumnPath}
          dstCyodaColumnPathType={dstCyodaColumnPathType}
          onUpdate={mockOnUpdate}
        />
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Metadata Configuration/i)).toBeInTheDocument();
    });

    // Try to apply without filling required fields
    const applyButton = screen.getByRole('button', { name: /Apply/i });
    fireEvent.click(applyButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });
});

