/**
 * Node Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Node from '../Node';
import type { PmNode } from '../../../types';

const mockNavigate = vi.fn();

// Mock Ant Design components
vi.mock('antd', () => ({
  Spin: ({ children, spinning }: any) => (
    <div data-testid="spin" data-spinning={spinning}>
      {children}
    </div>
  ),
}));

// Mock Ant Design icons
vi.mock('@ant-design/icons', () => ({
  ServerOutlined: () => <span data-testid="server-icon">ServerIcon</span>,
}));

// Mock useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Node', () => {
  const mockNode: PmNode = {
    hostname: 'test-node-01',
    grafana: {
      instance: 'test-instance',
      port: '9090',
      job: 'test-job',
    },
  };

  const mockNodeWithoutGrafana: PmNode = {
    hostname: 'test-node-02',
    grafana: null,
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render node with hostname', () => {
    renderWithRouter(<Node node={mockNode} />);

    expect(screen.getByText('test-node-01')).toBeInTheDocument();
  });

  it('should display server icon', () => {
    renderWithRouter(<Node node={mockNode} />);

    // Our mock renders the icon with data-testid="server-icon"
    const icon = screen.getByTestId('server-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should show status indicator', () => {
    const { container } = renderWithRouter(<Node node={mockNode} />);

    const statusIndicator = container.querySelector('.statusIndicator');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('should show Grafana message when no Grafana connection', () => {
    renderWithRouter(<Node node={mockNodeWithoutGrafana} />);

    expect(screen.getByText('This IP is not connected to Grafana')).toBeInTheDocument();
  });

  it('should show description when Grafana is connected', () => {
    renderWithRouter(<Node node={mockNode} />);

    // Should show description with CPU, Storage, RAM
    const description = screen.getByText(/CPU/);
    expect(description).toBeInTheDocument();
  });

  it('should navigate to node detail on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Node node={mockNode} />);

    const nodeCard = screen.getByText('test-node-01').closest('.row-item');
    expect(nodeCard).toBeInTheDocument();

    await user.click(nodeCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/processing-ui/nodes/test-node-01');
  });

  it('should have clickable row-item', () => {
    const { container } = renderWithRouter(<Node node={mockNode} />);

    const rowItem = container.querySelector('.row-item');
    expect(rowItem).toBeInTheDocument();
  });

  it('should render with loading spinner', () => {
    renderWithRouter(<Node node={mockNode} />);

    // Our mock renders the Spin component with data-testid="spin"
    const spin = screen.getByTestId('spin');
    expect(spin).toBeInTheDocument();
    expect(spin).toHaveAttribute('data-spinning', 'false');
  });

  it('should show deactive status by default', () => {
    const { container } = renderWithRouter(<Node node={mockNode} />);

    const statusIndicator = container.querySelector('.statusIndicator.deactive');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('should display default values in description', () => {
    renderWithRouter(<Node node={mockNode} />);

    // Should show dashes for missing values
    const description = screen.getByText(/- CPU, - Storage, - RAM/);
    expect(description).toBeInTheDocument();
  });
});

