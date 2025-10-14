/**
 * ShardsDetailTabCassandra Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ShardsDetailTabCassandra from '../ShardsDetailTabCassandra';
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

describe('ShardsDetailTabCassandra', () => {
  beforeEach(() => {
    useProcessingStore.getState().reset();
  });

  it('should render GrafanaChartResetButton', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
  });

  it('should render four GrafanaChart components', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(4);
  });

  it('should render Writes / sec chart', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Writes / sec $instance')).toBeInTheDocument();
  });

  it('should render Reads / sec chart', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Reads / sec $instance')).toBeInTheDocument();
  });

  it('should render Avg write latency chart', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Avg write latency $instance')).toBeInTheDocument();
  });

  it('should render Avg read latency chart', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Avg read latency $instance')).toBeInTheDocument();
  });

  it('should use Cassandra dashboard for all charts', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    const dashboardNames = screen.getAllByTestId('dashboard-name');
    dashboardNames.forEach((element) => {
      expect(element).toHaveTextContent('Cassandra');
    });
  });

  it('should use port 7070 for all charts', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    const ports = screen.getAllByTestId('port');
    ports.forEach((element) => {
      expect(element).toHaveTextContent('7070');
    });
  });

  it('should render CassandraService card', () => {
    const { container } = renderWithRouter(<ShardsDetailTabCassandra />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should show Service title in CassandraService card', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('should show Unknown status by default', () => {
    renderWithRouter(<ShardsDetailTabCassandra />);
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should set node and job from processing store', () => {
    const mockNodes = [
      {
        hostname: 'test-node-01',
        baseUrl: 'http://test-node-01:8080',
        grafana: {
          instance: 'cassandra-server:9100',
          port: '9100',
          job: 'cassandra-job',
        },
      },
    ];

    useProcessingStore.setState({ nodesProcessing: mockNodes });

    renderWithRouter(
      <ShardsDetailTabCassandra />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    const nodes = screen.getAllByTestId('node');
    const jobs = screen.getAllByTestId('job');

    expect(nodes[0]).toHaveTextContent('cassandra-server');
    expect(jobs[0]).toHaveTextContent('cassandra-job');
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
      <ShardsDetailTabCassandra />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    // Charts should still render but with empty values
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(4);
  });

  it('should handle empty nodes array', () => {
    useProcessingStore.setState({ nodesProcessing: [] });

    renderWithRouter(<ShardsDetailTabCassandra />);

    // Charts should still render but with empty values
    const charts = screen.getAllByTestId('grafana-chart');
    expect(charts).toHaveLength(4);
  });

  it('should have correct layout structure', () => {
    const { container } = renderWithRouter(<ShardsDetailTabCassandra />);
    
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
          instance: 'cassandra:7070',
          port: '7070',
          job: 'prod-cassandra',
        },
      },
    ];

    useProcessingStore.setState({ nodesProcessing: mockNodes });

    renderWithRouter(
      <ShardsDetailTabCassandra />,
      '/processing-ui/nodes/test-node-01',
      '/processing-ui/nodes/:name'
    );

    const nodes = screen.getAllByTestId('node');
    expect(nodes[0]).toHaveTextContent('cassandra');
  });
});

