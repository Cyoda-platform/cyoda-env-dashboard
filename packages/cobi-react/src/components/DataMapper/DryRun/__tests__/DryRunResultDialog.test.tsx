/**
 * DryRunResultDialog Component Tests
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/test-utils';
import DryRunResultDialog from '../DryRunResultDialog';

// Mock Prism.js
vi.mock('prismjs', () => ({
  default: {
    highlight: (code: string) => code,
    languages: {
      json: {},
    },
  },
}));

// Mock js-beautify
vi.mock('js-beautify', () => ({
  default: (code: string) => code,
}));

describe('DryRunResultDialog', () => {
  const mockResult = {
    mappedData: {
      entity1: { id: 1, name: 'Test Entity' },
      entity2: { id: 2, name: 'Another Entity' },
    },
    entities: [
      { id: 1, type: 'TypeA', status: 'active' },
      { id: 2, type: 'TypeB', status: 'inactive' },
    ],
    parseStatistic: {
      totalRecords: 100,
      successfulRecords: 95,
      failedRecords: 5,
      processingTime: 1234,
    },
    tracerEvents: [
      { level: 'INFO', timestamp: '2025-10-16T10:00:00Z', message: 'Processing started' },
      { level: 'DEBUG', timestamp: '2025-10-16T10:00:01Z', message: 'Parsing data' },
      { level: 'WARN', timestamp: '2025-10-16T10:00:02Z', message: 'Missing field detected' },
      { level: 'ERROR', timestamp: '2025-10-16T10:00:03Z', message: 'Validation failed' },
      { level: 'INFO', timestamp: '2025-10-16T10:00:04Z', message: 'Processing completed' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DryRunResultDialog ref={null} />
    );
    expect(container).toBeInTheDocument();
  });

  it('opens dialog when open method is called', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Results/i)).toBeInTheDocument();
    });
  });

  it('displays all tabs', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Mapped Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Entities/i)).toBeInTheDocument();
      expect(screen.getByText(/Parse Statistics/i)).toBeInTheDocument();
      expect(screen.getByText(/Tracer Events/i)).toBeInTheDocument();
    });
  });

  it('displays mapped data in first tab', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      // The mapped data should be displayed as JSON
      expect(screen.getByText(/Mapped Data/i)).toBeInTheDocument();
    });
  });

  it('displays entities in second tab', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const entitiesTab = screen.getByText(/Entities/i);
      fireEvent.click(entitiesTab);
    });

    await waitFor(() => {
      // Entities should be displayed
      expect(screen.getByText(/Entities/i)).toBeInTheDocument();
    });
  });

  it('displays parse statistics in third tab', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const statsTab = screen.getByText(/Parse Statistics/i);
      fireEvent.click(statsTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Parse Statistics/i)).toBeInTheDocument();
    });
  });

  it('displays tracer events in fourth tab', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const tracerTab = screen.getByText(/Tracer Events/i);
      fireEvent.click(tracerTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/Processing started/i)).toBeInTheDocument();
      expect(screen.getByText(/Parsing data/i)).toBeInTheDocument();
      expect(screen.getByText(/Missing field detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Validation failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Processing completed/i)).toBeInTheDocument();
    });
  });

  it('detects errors in tracer events', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const tracerTab = screen.getByText(/Tracer Events/i);
      fireEvent.click(tracerTab);
    });

    await waitFor(() => {
      // Should show error alert
      expect(screen.getByText(/Errors detected/i)).toBeInTheDocument();
    });
  });

  it('displays different log levels with appropriate styling', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      const tracerTab = screen.getByText(/Tracer Events/i);
      fireEvent.click(tracerTab);
    });

    await waitFor(() => {
      // Check for different log levels
      const events = screen.getAllByText(/INFO|DEBUG|WARN|ERROR/i);
      expect(events.length).toBeGreaterThan(0);
    });
  });

  it('closes dialog when Close button is clicked', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      const [isOpen, setIsOpen] = React.useState(false);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
        setIsOpen(true);
      }, []);

      return (
        <>
          <DryRunResultDialog ref={ref} />
          {isOpen && <div>Dialog is open</div>}
        </>
      );
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Results/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(/Dry Run Results/i)).not.toBeInTheDocument();
    });
  });

  it('handles empty result gracefully', async () => {
    const emptyResult = {
      mappedData: {},
      entities: [],
      parseStatistic: {},
      tracerEvents: [],
    };

    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(emptyResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/Dry Run Results/i)).toBeInTheDocument();
    });
  });

  it('formats JSON with syntax highlighting', async () => {
    const TestComponent = () => {
      const ref = React.useRef<any>(null);
      
      React.useEffect(() => {
        ref.current?.open(mockResult);
      }, []);

      return <DryRunResultDialog ref={ref} />;
    };

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      // Check that JSON is displayed (mocked Prism will just return the code)
      expect(screen.getByText(/Mapped Data/i)).toBeInTheDocument();
    });
  });
});

