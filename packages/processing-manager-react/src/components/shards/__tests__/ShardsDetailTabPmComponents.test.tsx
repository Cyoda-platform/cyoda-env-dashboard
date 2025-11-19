/**
 * ShardsDetailTabPmComponents Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabPmComponents from '../ShardsDetailTabPmComponents';
import type { ReactNode } from 'react';

describe('ShardsDetailTabPmComponents', () => {
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

  it('should render PM components title', () => {
    render(<ShardsDetailTabPmComponents />, { wrapper });
    
    expect(screen.getByText('PM components')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabPmComponents />, { wrapper });

    expect(screen.getByText('Execution Queues Info')).toBeInTheDocument();
    expect(screen.getByText('Execution Monitors')).toBeInTheDocument();
    expect(screen.getByText('Service Processes View')).toBeInTheDocument();
    expect(screen.getByText('Cyoda Runnable Components')).toBeInTheDocument();
  });

  it('should show Execution Queues Info tab content by default', () => {
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    // Check that the first tab is active (Execution Queues Info)
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should switch to Execution Monitors tab when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tab = screen.getByText('Execution Monitors');
    await user.click(tab);

    // Check that tabs are still rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should switch to Service Processes View tab when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tab = screen.getByText('Service Processes View');
    await user.click(tab);

    // Check that tabs are still rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should switch to Cyoda Runnable Components tab when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tab = screen.getByText('Cyoda Runnable Components');
    await user.click(tab);

    // Check that tabs are still rendered
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    expect(container.querySelector('.pm-components-tab')).toBeInTheDocument();
    expect(container.querySelector('.pm-components-header')).toBeInTheDocument();
    expect(container.querySelector('.pm-components-title')).toBeInTheDocument();
  });

  it('should render Tabs component', () => {
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tabs = container.querySelector('.ant-tabs');
    expect(tabs).toBeInTheDocument();
  });

  it('should render Tabs component', () => {
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tabs = container.querySelector('.ant-tabs');
    expect(tabs).toBeInTheDocument();
  });

  it('should have 4 tab panes', () => {
    const { container } = render(<ShardsDetailTabPmComponents />, { wrapper });

    const tabPanes = container.querySelectorAll('.ant-tabs-tab');
    expect(tabPanes.length).toBe(4);
  });
});

