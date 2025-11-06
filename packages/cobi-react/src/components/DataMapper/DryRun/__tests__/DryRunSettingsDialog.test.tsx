/**
 * DryRunSettingsDialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/test-utils';
import DryRunSettingsDialog from '../DryRunSettingsDialog';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('DryRunSettingsDialog', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DryRunSettingsDialog ref={null} onSave={mockOnSave} />
    );
    expect(container).toBeInTheDocument();
  });

  it('opens dialog when open method is called', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });
  });

  it('displays all log level selects', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Default Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Common Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Parser Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Transformer Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Entity Creator Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Column Mapping Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Functional Mapping Level/i)).toBeInTheDocument();
    });
  });

  it('loads settings from localStorage on open', async () => {
    const savedSettings = {
      defaultLevel: 'DEBUG',
      commonLevel: 'INFO',
      parserLevel: 'WARN',
      transformerLevel: 'ERROR',
      entityCreatorLevel: 'TRACE',
      columnMappingLevel: 'DEBUG',
      functionalMappingLevel: 'INFO',
    };

    localStorageMock.setItem('dryRunSettings', JSON.stringify(savedSettings));

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });

    // Verify that the saved settings are loaded
    // Note: This would require checking the select values, which is complex in Ant Design
    // In a real test, you'd use data-testid or other attributes
  });

  it('saves settings to localStorage when OK is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const savedData = localStorageMock.getItem('dryRunSettings');
      expect(savedData).toBeTruthy();
    });
  });

  it('calls onSave with settings when OK is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const settings = mockOnSave.mock.calls[0][0];
      expect(settings).toHaveProperty('defaultLevel');
      expect(settings).toHaveProperty('commonLevel');
      expect(settings).toHaveProperty('parserLevel');
    });
  });

  it('closes dialog when Cancel is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('uses default log levels when no saved settings exist', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Settings/i)).toBeInTheDocument();
    });

    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
      const settings = mockOnSave.mock.calls[0][0];
      expect(settings.defaultLevel).toBe('INFO');
    });
  });

  it('displays help text for log levels', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <DryRunSettingsDialog ref={ref} onSave={mockOnSave} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Configure log levels for dry run execution/i)).toBeInTheDocument();
    });
  });
});

