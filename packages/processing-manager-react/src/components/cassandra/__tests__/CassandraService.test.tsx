import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CassandraService from '../CassandraService';
import * as stores from '../../../stores';

// Mock the stores
vi.mock('../../../stores', () => ({
  useProcessingStore: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockUseParams = vi.mocked(
  (await import('react-router-dom')).useParams
);

describe('CassandraService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ name: 'test-node' });
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: [] })
    );
  });

  it('should render the component', () => {
    const { container } = render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });

  it('should render Card with title "Service"', () => {
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('should render service status text', () => {
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Cassandra service status and controls')).toBeInTheDocument();
  });

  it('should display Unknown status tag by default', () => {
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should have cassandra-service class', () => {
    const { container } = render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    const card = container.querySelector('.cassandra-service');
    expect(card).toBeInTheDocument();
  });

  it('should use name from useParams', () => {
    mockUseParams.mockReturnValue({ name: 'my-node' });
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(mockUseParams).toHaveBeenCalled();
  });

  it('should access nodes from processing store', () => {
    const mockNodes = [
      { hostname: 'test-node', grafana: true },
      { hostname: 'other-node', grafana: false },
    ];
    
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: mockNodes })
    );
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(stores.useProcessingStore).toHaveBeenCalled();
  });

  it('should find node by hostname matching name param', async () => {
    const mockNodes = [
      { hostname: 'test-node', grafana: true },
      { hostname: 'other-node', grafana: false },
    ];
    
    mockUseParams.mockReturnValue({ name: 'test-node' });
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: mockNodes })
    );
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    // Component should render without errors
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('should handle empty nodes array', () => {
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: [] })
    );
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should render Card component', () => {
    const { container } = render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render Tag component for status', () => {
    const { container } = render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    const tag = container.querySelector('.ant-tag');
    expect(tag).toBeInTheDocument();
  });

  it('should display status tag in card title', () => {
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    const cardTitle = screen.getByText('Service').closest('.ant-card-head-title');
    expect(cardTitle).toBeInTheDocument();
  });

  it('should handle node without grafana property', async () => {
    const mockNodes = [
      { hostname: 'test-node' },
    ];
    
    mockUseParams.mockReturnValue({ name: 'test-node' });
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: mockNodes })
    );
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle node not found in nodes array', async () => {
    const mockNodes = [
      { hostname: 'other-node', grafana: true },
    ];
    
    mockUseParams.mockReturnValue({ name: 'test-node' });
    (stores.useProcessingStore as any).mockImplementation((selector: any) =>
      selector({ nodes: mockNodes })
    );
    
    render(
      <BrowserRouter>
        <CassandraService />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});

