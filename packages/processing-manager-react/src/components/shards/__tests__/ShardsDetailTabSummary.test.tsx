/**
 * ShardsDetailTabSummary Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShardsDetailTabSummary from '../ShardsDetailTabSummary';
import { useProcessingStore } from '../../../stores/processingStore';

// Mock the Grafana components
vi.mock('../../grafana', () => ({
  GrafanaChart: ({ dashboardName, panelName, node, port, job }: any) => (
    <div data-testid="grafana-chart">
      <div data-testid="dashboard-name">{dashboardName}</div>
      <div data-testid="panel-name">{panelName}</div>
      <div data-testid="node">{node}</div>
      <div data-testid="port">{port}</div>
      <div data-testid="job">{job}</div>
    </div>
  ),
  GrafanaChartResetButton: () => <button data-testid="reset-button">Reset</button>,
}));

const renderWithRouter = (
  component: React.ReactElement,
  initialRoute = '/processing-ui/nodes/test-node',
  routePath = '/processing-ui/nodes/:name'
) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path={routePath} element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ShardsDetailTabSummary', () => {
  beforeEach(() => {
    useProcessingStore.getState().reset();
  });

  it('should render GrafanaChartResetButton', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should render three GrafanaChart components', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(3);
  });

  it('should render CPU basic chart', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    expect(screen.getByText('CPU basic')).toBeInTheDocument();
  });

  it('should render Disk IOps Completed chart', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    expect(screen.getByText('Disk IOps Completed')).toBeInTheDocument();
  });

  it('should render Network Traffic by Packets chart', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    expect(screen.getByText('Network Traffic by Packets')).toBeInTheDocument();
  });

  it('should use Linux dashboard for all charts', () => {
    renderWithRouter(<ShardsDetailTabSummary />);
    
    const dashboardNames = screen.getAllByTestId('dashboard-name');
    dashboardNames.forEach((element) => {
      expect(element).toHaveTextContent('Linux');
    });
  });

  it('should set node, port, and job from processing store', () => {
    const mockNodes = [
      {
        hostname: 'test-node-01',
        baseUrl: 'http://test-node-01:8080',
        grafana: {
          instance: 'grafana-server:9090',
          port: '9090',
          job: 'test-job',
        },
      },
    ];

    useProcessingStore.setState({ nodesProcessing: mockNodes });

    renderWithRouter(
      <ShardsDetailTabSummary />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    // Check that the first chart has the correct node, port, and job
    const nodes = screen.getAllByTestId('node');
    const ports = screen.getAllByTestId('port');
    const jobs = screen.getAllByTestId('job');

    expect(nodes[0]).toHaveTextContent('grafana-server');
    expect(ports[0]).toHaveTextContent('9090');
    expect(jobs[0]).toHaveTextContent('test-job');
  });

  it('should handle node without grafana connection', () => {
    const mockNodes = [
      {
        hostname: 'test-node-01',
        baseUrl: 'http://test-node-01:8080',
        grafana: null,
      },
    ];

    useProcessingStore.setState({ nodesProcessing: mockNodes });

    renderWithRouter(
      <ShardsDetailTabSummary />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    // Charts should still render but with empty values
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(3);
  });

  it('should handle empty nodes array', () => {
    useProcessingStore.setState({ nodesProcessing: [] });

    renderWithRouter(<ShardsDetailTabSummary />);

    // Charts should still render but with empty values
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(3);
  });

  it('should have correct layout structure', () => {
    const { container } = renderWithRouter(<ShardsDetailTabSummary />);
    
    const row = container.querySelector('.ant-row');
    expect(row).toBeInTheDocument();

    const cols = container.querySelectorAll('.ant-col');
    expect(cols.length).toBeGreaterThanOrEqual(2);
  });

  it('should match node by partial hostname', () => {
    const mockNodes = [
      {
        hostname: 'production-test-node-01-server',
        baseUrl: 'http://test-node-01:8080',
        grafana: {
          instance: 'grafana:3000',
          port: '3000',
          job: 'prod-job',
        },
      },
    ];

    useProcessingStore.setState({ nodesProcessing: mockNodes });

    renderWithRouter(
      <ShardsDetailTabSummary />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    const nodes = screen.getAllByTestId('node');
    expect(nodes[0]).toHaveTextContent('grafana');
  });
});

