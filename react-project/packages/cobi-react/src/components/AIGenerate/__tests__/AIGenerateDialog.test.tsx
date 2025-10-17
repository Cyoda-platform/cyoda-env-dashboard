/**
 * AIGenerateDialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import AIGenerateDialog from '../AIGenerateDialog';

// Mock the dataSourceConfigApi
vi.mock('../../../api/dataSourceConfigApi', () => ({
  dataSourceConfigApi: {
    importConfig: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe('AIGenerateDialog', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <AIGenerateDialog ref={null} type="dataMapper" onSuccess={mockOnSuccess} />
    );
    expect(container).toBeInTheDocument();
  });

  it('opens dialog when open method is called', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });
  });

  it('displays correct title for dataMapper type', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/data mapper/i)).toBeInTheDocument();
    });
  });

  it('displays correct title for dataSource type', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataSource" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/data source/i)).toBeInTheDocument();
    });
  });

  it('displays file upload component', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Upload JSON configuration file/i)).toBeInTheDocument();
    });
  });

  it('disables Generate button when no file is selected', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      expect(generateButton).toBeDisabled();
    });
  });

  it('enables Generate button when file is selected', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Simulate file selection
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['{"test": "data"}'], 'config.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('validates JSON file type', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Try to upload non-JSON file
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['test content'], 'config.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Only JSON files are allowed/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during generation', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Upload file
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['{"test": "data"}'], 'config.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      fireEvent.click(generateButton);
    });

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Generating.../i)).toBeInTheDocument();
    });
  });

  it('calls onSuccess after successful generation', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Upload file
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['{"test": "data"}'], 'config.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      fireEvent.click(generateButton);
    });

    // Wait for generation to complete (2 second simulation + API call)
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays success message after generation', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Upload file
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['{"test": "data"}'], 'config.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      fireEvent.click(generateButton);
    });

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Configuration generated successfully/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles generation errors gracefully', async () => {
    // Mock API to throw error
    const { dataSourceConfigApi } = await import('../../../api/dataSourceConfigApi');
    vi.mocked(dataSourceConfigApi.importConfig).mockRejectedValueOnce(new Error('API Error'));

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Upload file
    const fileInput = screen.getByLabelText(/Upload JSON configuration file/i);
    const file = new File(['{"test": "data"}'], 'config.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      fireEvent.click(generateButton);
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to generate configuration/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('closes dialog when Cancel is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open();
      }, []);

      return <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('resets state when dialog is reopened', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      const [count, setCount] = React.useState(0);
      
      React.useEffect(() => {
        if (count === 0) {
          ref.current?.open();
          setCount(1);
        }
      }, [count]);

      return (
        <>
          <AIGenerateDialog ref={ref} type="dataMapper" onSuccess={mockOnSuccess} />
          <button onClick={() => ref.current?.open()}>Reopen</button>
        </>
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/AI Generate Configuration/i)).toBeInTheDocument();
    });

    // Close dialog
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Reopen dialog
    const reopenButton = screen.getByRole('button', { name: /Reopen/i });
    fireEvent.click(reopenButton);

    await waitFor(() => {
      // Should be in initial state (no file selected)
      const generateButton = screen.getByRole('button', { name: /Generate Configuration/i });
      expect(generateButton).toBeDisabled();
    });
  });
});

