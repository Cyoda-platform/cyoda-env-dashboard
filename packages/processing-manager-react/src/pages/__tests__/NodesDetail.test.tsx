/**
 * NodesDetail Page Tests
 * Tests for lazy loading and tab persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NodesDetail from '../NodesDetail';

// Mock the shards components
vi.mock('../../components/shards', () => ({
  ShardsDetailTabProcessingManager: () => <div>Processing Manager Tab</div>,
  ShardsDetailTabSummary: () => <div>Summary Tab</div>,
  ShardsDetailTabCassandra: () => <div>Cassandra Tab</div>,
  ShardsDetailTabProcessingEvents: () => <div>Processing Events Tab</div>,
  ShardsDetailTabTimeStatistics: () => <div>Time Statistics Tab</div>,
  ShardsDetailTabTransactions: () => <div>Transactions Tab</div>,
  ShardsDetailTabPmComponents: () => <div>PM Components Tab</div>,
  ShardsDetailTabCompositeIndexes: () => <div>Composite Indexes Tab</div>,
  ShardsDetailTabCachesList: () => <div>Caches List Tab</div>,
  ShardsDetailTabNetworkInfo: () => <div>Network Info Tab</div>,
  ShardsDetailTabZKInfo: () => <div>ZooKeeper Info Tab</div>,
  ShardsDetailTabCqlExecStats: () => <div>CQL Execution Statistics Tab</div>,
}));

// Mock the layout component
vi.mock('../../components/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Create test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });
}

// Wrapper component
function renderWithRouter(component: React.ReactElement, initialRoute = '/processing-ui/nodes/test-node') {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/processing-ui/nodes/:name" element={component} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>,
    { wrapper: ({ children }) => {
      window.history.pushState({}, '', initialRoute);
      return <>{children}</>;
    }}
  );
}

describe('NodesDetail Page', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    const getItemSpy = vi.fn((key: string) => localStorageMock[key] || null);
    const setItemSpy = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    const removeItemSpy = vi.fn((key: string) => {
      delete localStorageMock[key];
    });
    const clearSpy = vi.fn(() => {
      localStorageMock = {};
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
        clear: clearSpy,
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock = {};
  });

  describe('Lazy Loading', () => {
    it('should only render the active tab content', () => {
      renderWithRouter(<NodesDetail />);

      // First tab should be visible
      expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();

      // Other tabs should not be rendered
      expect(screen.queryByText('Summary Tab')).not.toBeInTheDocument();
      expect(screen.queryByText('Cassandra Tab')).not.toBeInTheDocument();
      expect(screen.queryByText('Processing Events Tab')).not.toBeInTheDocument();
    });

    it('should render new tab content when switching tabs', async () => {
      renderWithRouter(<NodesDetail />);

      // Initially, first tab is visible
      expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();

      // Click on the second tab
      const summaryTab = screen.getByText('Server Summary');
      fireEvent.click(summaryTab);

      // Wait for the new tab content to appear
      await waitFor(() => {
        expect(screen.getByText('Summary Tab')).toBeInTheDocument();
      });

      // First tab should no longer be rendered
      expect(screen.queryByText('Processing Manager Tab')).not.toBeInTheDocument();
    });

    it('should switch between multiple tabs correctly', async () => {
      renderWithRouter(<NodesDetail />);

      // Switch to Cassandra tab
      fireEvent.click(screen.getByText('Cassandra'));
      await waitFor(() => {
        expect(screen.getByText('Cassandra Tab')).toBeInTheDocument();
      });

      // Switch to Transactions tab
      fireEvent.click(screen.getByText('Transactions'));
      await waitFor(() => {
        expect(screen.getByText('Transactions Tab')).toBeInTheDocument();
      });
      expect(screen.queryByText('Cassandra Tab')).not.toBeInTheDocument();

      // Switch back to Processing Manager
      fireEvent.click(screen.getByText('Processing Manager'));
      await waitFor(() => {
        expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();
      });
      expect(screen.queryByText('Transactions Tab')).not.toBeInTheDocument();
    });
  });

  describe('Tab Persistence', () => {
    it('should load default tab when no saved state exists', () => {
      renderWithRouter(<NodesDetail />);

      expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();
      expect(localStorage.getItem).toHaveBeenCalledWith('nodesDetailTab');
    });

    it('should save tab state to localStorage when switching tabs', async () => {
      renderWithRouter(<NodesDetail />);

      // Switch to Summary tab
      fireEvent.click(screen.getByText('Server Summary'));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('nodesDetailTab', '2');
      });

      // Switch to Cassandra tab
      fireEvent.click(screen.getByText('Cassandra'));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('nodesDetailTab', '3');
      });
    });

    it('should restore tab state from localStorage on mount', () => {
      // Set saved tab state
      localStorageMock['nodesDetailTab'] = '5';

      renderWithRouter(<NodesDetail />);

      // Should load the saved tab (Time Statistics)
      expect(screen.getByText('Time Statistics Tab')).toBeInTheDocument();
      expect(screen.queryByText('Processing Manager Tab')).not.toBeInTheDocument();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage to throw error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => {
            throw new Error('localStorage error');
          }),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
        writable: true,
      });

      renderWithRouter(<NodesDetail />);

      // Should fall back to default tab
      expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage setItem errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage with setItem that throws
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(() => {
            throw new Error('localStorage error');
          }),
          removeItem: vi.fn(),
          clear: vi.fn(),
          length: 0,
          key: vi.fn(),
        },
        writable: true,
      });

      renderWithRouter(<NodesDetail />);

      // Switch tabs
      fireEvent.click(screen.getByText('Server Summary'));

      await waitFor(() => {
        expect(screen.getByText('Summary Tab')).toBeInTheDocument();
      });

      // Should still work despite localStorage error
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Tab Labels', () => {
    it('should display all 11 tab labels', () => {
      renderWithRouter(<NodesDetail />);

      expect(screen.getByText('Processing Manager')).toBeInTheDocument();
      expect(screen.getByText('Server Summary')).toBeInTheDocument();
      expect(screen.getByText('Cassandra')).toBeInTheDocument();
      expect(screen.getByText('Processing Events')).toBeInTheDocument();
      expect(screen.getByText('Time Statistics')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('PM components')).toBeInTheDocument();
      expect(screen.getByText('Composite indexes')).toBeInTheDocument();
      expect(screen.getByText('Caches List')).toBeInTheDocument();
      expect(screen.getByText('Network info')).toBeInTheDocument();
      expect(screen.getByText('ZooKeeper info')).toBeInTheDocument();
    });
  });

  describe('Node Name Display', () => {
    it('should set the node name from route params', () => {
      const { container } = renderWithRouter(<NodesDetail />, '/processing-ui/nodes/my-test-node');

      // Check that the component renders with tabs
      expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation Arrows', () => {
    it('should render left and right navigation arrows', () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // Check for arrow buttons
      const leftArrow = container.querySelector('.anticon-left');
      const rightArrow = container.querySelector('.anticon-right');

      expect(leftArrow).toBeInTheDocument();
      expect(rightArrow).toBeInTheDocument();
    });

    it('should disable left arrow on first tab', () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // First tab is active by default
      const leftArrowButton = container.querySelector('.anticon-left')?.closest('button');
      const rightArrowButton = container.querySelector('.anticon-right')?.closest('button');

      expect(leftArrowButton).toBeDisabled();
      expect(rightArrowButton).not.toBeDisabled();
    });

    it('should navigate to next tab when right arrow is clicked', async () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // Initially on first tab
      expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();

      // Click right arrow
      const rightArrowButton = container.querySelector('.anticon-right')?.closest('button');
      fireEvent.click(rightArrowButton!);

      // Should navigate to second tab
      await waitFor(() => {
        expect(screen.getByText('Summary Tab')).toBeInTheDocument();
      });
      expect(screen.queryByText('Processing Manager Tab')).not.toBeInTheDocument();
    });

    it('should navigate to previous tab when left arrow is clicked', async () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // Navigate to second tab first
      fireEvent.click(screen.getByText('Server Summary'));
      await waitFor(() => {
        expect(screen.getByText('Summary Tab')).toBeInTheDocument();
      });

      // Click left arrow
      const leftArrowButton = container.querySelector('.anticon-left')?.closest('button');
      fireEvent.click(leftArrowButton!);

      // Should navigate back to first tab
      await waitFor(() => {
        expect(screen.getByText('Processing Manager Tab')).toBeInTheDocument();
      });
      expect(screen.queryByText('Summary Tab')).not.toBeInTheDocument();
    });

    it('should disable right arrow on last tab', async () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // Navigate to last tab (CQL Execution Statistics)
      fireEvent.click(screen.getByText('CQL Execution Statistics'));

      await waitFor(() => {
        expect(screen.getByText('CQL Execution Statistics Tab')).toBeInTheDocument();
      });

      const leftArrowButton = container.querySelector('.anticon-left')?.closest('button');
      const rightArrowButton = container.querySelector('.anticon-right')?.closest('button');

      expect(leftArrowButton).not.toBeDisabled();
      expect(rightArrowButton).toBeDisabled();
    });

    it('should save tab state when navigating with arrows', async () => {
      const { container } = renderWithRouter(<NodesDetail />);

      // Click right arrow
      const rightArrowButton = container.querySelector('.anticon-right')?.closest('button');
      fireEvent.click(rightArrowButton!);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('nodesDetailTab', '2');
      });
    });
  });
});

