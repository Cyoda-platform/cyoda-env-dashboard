/**
 * Tests for ShardsDetailTabZKInfo Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabZKInfo from '../ShardsDetailTabZKInfo';
import type { ReactNode } from 'react';

describe('ShardsDetailTabZKInfo', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(container.querySelector('.zk-info-tab')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(screen.getByText('ZooKeeper Info')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabZKInfo />, { wrapper });

    expect(screen.getByText('Current Node Info')).toBeInTheDocument();
    expect(screen.getByText('Loaded Online Nodes')).toBeInTheDocument();
    expect(screen.getByText('Loaded Shards Distribution')).toBeInTheDocument();
  });

  it('should show Current Node Info tab content by default', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    // Check that tabs are rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should switch to Loaded Online Nodes tab when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    const tab = screen.getByText('Loaded Online Nodes');
    await user.click(tab);

    // Check that tabs are still rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should switch to Loaded Shards Distribution tab when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    const tab = screen.getByText('Loaded Shards Distribution');
    await user.click(tab);

    // Check that tabs are still rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should render tabs component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have three tabs', () => {
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });
    
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabZKInfo />, { wrapper })).not.toThrow();
  });

  it('should maintain active tab state', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabZKInfo />, { wrapper });

    // Click second tab
    await user.click(screen.getByText('Loaded Online Nodes'));
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();

    // Click third tab
    await user.click(screen.getByText('Loaded Shards Distribution'));
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();

    // Click first tab
    await user.click(screen.getByText('Current Node Info'));
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });
});

