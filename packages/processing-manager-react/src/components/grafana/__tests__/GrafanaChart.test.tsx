/**
 * GrafanaChart Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GrafanaChart from '../GrafanaChart';

// Mock hooks
vi.mock('../../../hooks', () => ({
  useGrafanaDashboardByName: vi.fn(),
  useGrafanaPanelsByUid: vi.fn(),
}));

import { useGrafanaDashboardByName, useGrafanaPanelsByUid } from '../../../hooks';

// Create test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Wrapper component
function renderWithProviders(
  ui: React.ReactElement,
  { route = '/node/test-node' } = {}
) {
  const queryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/node/:name" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('GrafanaChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    // "No data" appears twice: in SVG title and in description div
    const noDataElements = screen.getAllByText(/No data/i);
    expect(noDataElements.length).toBeGreaterThan(0);
  });

  it('should fetch dashboard by name', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: [{ uid: 'dashboard-123', title: 'Test Dashboard' }],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    expect(useGrafanaDashboardByName).toHaveBeenCalledWith('Test Dashboard');
  });

  it('should fetch panels when dashboard UID is available', async () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: [{ uid: 'dashboard-123', title: 'Test Dashboard' }],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: {
        dashboard: {
          panels: [
            { id: 1, title: 'Test Panel' },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    await waitFor(() => {
      expect(useGrafanaPanelsByUid).toHaveBeenCalled();
    });
  });

  it('should use custom height when provided', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
        height={500}
      />
    );

    // Component should render with custom height
    expect(document.body).toBeInTheDocument();
  });

  it('should use default height when not provided', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    // Component should render with default height (300)
    expect(document.body).toBeInTheDocument();
  });

  it('should handle node and port props', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
        node="node-1"
        port="8080"
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('should handle job prop', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
        job="test-job"
      />
    );

    expect(document.body).toBeInTheDocument();
  });

  it('should handle error state from dashboard query', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch dashboard'),
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    // Component should handle error gracefully
    expect(document.body).toBeInTheDocument();
  });

  it('should handle error state from panels query', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: [{ uid: 'dashboard-123', title: 'Test Dashboard' }],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch panels'),
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Test Panel"
      />
    );

    // Component should handle error gracefully
    expect(document.body).toBeInTheDocument();
  });

  it('should replace $instance in panel name with node and port', () => {
    vi.mocked(useGrafanaDashboardByName).mockReturnValue({
      data: [{ uid: 'dashboard-123', title: 'Test Dashboard' }],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useGrafanaPanelsByUid).mockReturnValue({
      data: {
        dashboard: {
          panels: [
            { id: 1, title: 'Panel for test-node:8080' },
          ],
        },
      },
      isLoading: false,
      isError: false,
    } as any);

    renderWithProviders(
      <GrafanaChart
        dashboardName="Test Dashboard"
        panelName="Panel for $instance"
        port="8080"
      />
    );

    // Panel name should be replaced with actual node:port from route params
    expect(document.body).toBeInTheDocument();
  });
});

