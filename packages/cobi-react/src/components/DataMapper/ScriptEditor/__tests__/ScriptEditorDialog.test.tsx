/**
 * ScriptEditorDialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/test-utils';
import ScriptEditorDialog from '../ScriptEditorDialog';
import type { EntityMappingConfigDto, MappingConfigDto } from '../../../../types';

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
vi.mock('../../../../hooks/useScripts', () => ({
  useScriptsApi: {
    useListAll: () => ({
      data: [
        {
          name: 'test-script',
          versions: [
            { version: '1.0.0', scriptBody: 'console.log("test");', isDefault: true },
          ],
        },
      ],
      isLoading: false,
    }),
  },
}));

describe('ScriptEditorDialog', () => {
  const mockOnSave = vi.fn();
  const mockEntityMapping: EntityMappingConfigDto = {
    entityName: 'TestEntity',
    scriptBody: 'console.log("initial");',
    sourceFields: [
      { name: 'field1', type: 'string', path: 'data.field1' },
      { name: 'field2', type: 'number', path: 'data.field2' },
    ],
    metaParams: [
      { name: 'param1', value: 'value1' },
    ],
    columnMappings: [],
    functionalMappings: [],
  } as any;

  const mockMappingConfig: MappingConfigDto = {
    name: 'TestMapping',
    entityMappings: [mockEntityMapping],
  } as any;

  let dialogRef: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ScriptEditorDialog ref={dialogRef} onSave={mockOnSave} />
    );
    expect(container).toBeInTheDocument();
  });

  it('opens dialog when open method is called', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
    });
  });

  it('displays entity name in dialog title', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/TestEntity/i)).toBeInTheDocument();
    });
  });

  it('displays initial script body in Monaco editor', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveValue('console.log("initial");');
    });
  });

  it('updates script body when editor content changes', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("updated");' } });
      expect(editor).toHaveValue('console.log("updated");');
    });
  });

  it('calls onSave with updated entity mapping when OK is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const editor = screen.getByTestId('monaco-editor');
      fireEvent.change(editor, { target: { value: 'console.log("new script");' } });
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const savedMapping = mockOnSave.mock.calls[0][0];
      expect(savedMapping.scriptBody).toBe('console.log("new script");');
    });
  });

  it('closes dialog when Cancel is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Script Editor/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('displays source fields in table', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('field1')).toBeInTheDocument();
      expect(screen.getByText('field2')).toBeInTheDocument();
    });
  });

  it('displays meta params in table', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText('param1')).toBeInTheDocument();
      expect(screen.getByText('value1')).toBeInTheDocument();
    });
  });

  it('displays error message when script has errors', async () => {
    const entityWithError = {
      ...mockEntityMapping,
      scriptError: 'Syntax error on line 5',
    };

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(entityWithError, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Syntax error on line 5/i)).toBeInTheDocument();
    });
  });

  it('renders tabs for different sections', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockEntityMapping, mockMappingConfig, 0);
      }, []);

      return <ScriptEditorDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Script Body/i)).toBeInTheDocument();
      expect(screen.getByText(/Source Fields/i)).toBeInTheDocument();
      expect(screen.getByText(/Reusable Scripts/i)).toBeInTheDocument();
    });
  });
});

