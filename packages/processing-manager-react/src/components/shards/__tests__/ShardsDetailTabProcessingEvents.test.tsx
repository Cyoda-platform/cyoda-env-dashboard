/**
 * Tests for ShardsDetailTabProcessingEvents Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabProcessingEvents from '../ShardsDetailTabProcessingEvents';
import type { ReactNode } from 'react';

// Mock the child components
vi.mock('../../processing-events', () => ({
  PollingInfo: () => <div data-testid="polling-info">Polling Info</div>,
  ProcessEventsStatistics: () => <div data-testid="process-events-stats">Process Events Statistics</div>,
  ProcessingEventsView: () => <div data-testid="processing-events-view">Processing Events View</div>,
  ProcessingEventsErrorView: () => <div data-testid="processing-events-error-view">Processing Events Error View</div>,
  ProcessingEventsEntitiesErrorListView: () => <div data-testid="entities-error-list-view">Entities Error List View</div>,
  SiftLoggerConfView: () => <div data-testid="sift-logger-conf-view">SIFT Logger Conf View</div>,
}));

describe('ShardsDetailTabProcessingEvents', () => {
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
    const { container } = render(<ShardsDetailTabProcessingEvents />, { wrapper });

    expect(container.querySelector('.processing-events-tab')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabProcessingEvents />, { wrapper });
    
    expect(screen.getByText('Processing Events')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    const { container } = render(<ShardsDetailTabProcessingEvents />, { wrapper });

    // Check that all tabs exist by counting them
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(6);

    // Check specific tab labels that don't have duplicates
    expect(screen.getByText('Polling info')).toBeInTheDocument();
    expect(screen.getByText('Processing events view')).toBeInTheDocument();
    expect(screen.getByText('Processing events error view')).toBeInTheDocument();
    expect(screen.getByText('Entities error list view')).toBeInTheDocument();
    expect(screen.getByText('SIFT logger conf view')).toBeInTheDocument();
  });

  it('should show Process Events Statistics tab content by default', () => {
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    expect(screen.getByTestId('process-events-stats')).toBeInTheDocument();
  });

  it('should switch to Polling info tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    const tab = screen.getByText('Polling info');
    await user.click(tab);

    expect(screen.getByTestId('polling-info')).toBeInTheDocument();
  });

  it('should switch to Processing events view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    const tab = screen.getByText('Processing events view');
    await user.click(tab);

    expect(screen.getByTestId('processing-events-view')).toBeInTheDocument();
  });

  it('should switch to Processing events error view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    const tab = screen.getByText('Processing events error view');
    await user.click(tab);

    expect(screen.getByTestId('processing-events-error-view')).toBeInTheDocument();
  });

  it('should switch to Entities error list view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    const tab = screen.getByText('Entities error list view');
    await user.click(tab);

    expect(screen.getByTestId('entities-error-list-view')).toBeInTheDocument();
  });

  it('should switch to SIFT logger conf view tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    const tab = screen.getByText('SIFT logger conf view');
    await user.click(tab);

    expect(screen.getByTestId('sift-logger-conf-view')).toBeInTheDocument();
  });

  it('should render tabs component', () => {
    const { container } = render(<ShardsDetailTabProcessingEvents />, { wrapper });
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have six tabs', () => {
    const { container } = render(<ShardsDetailTabProcessingEvents />, { wrapper });
    
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(6);
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabProcessingEvents />, { wrapper })).not.toThrow();
  });

  it('should maintain active tab state', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    // Click second tab
    await user.click(screen.getByText('Polling info'));
    expect(screen.getByTestId('polling-info')).toBeInTheDocument();

    // Click third tab
    await user.click(screen.getByText('Processing events view'));
    expect(screen.getByTestId('processing-events-view')).toBeInTheDocument();

    // Click fourth tab
    await user.click(screen.getByText('Processing events error view'));
    expect(screen.getByTestId('processing-events-error-view')).toBeInTheDocument();

    // Click first tab - use getAllByText to handle duplicate tab labels
    const tabs = screen.getAllByText('Process Events Statistics');
    await user.click(tabs[tabs.length - 1]);
    expect(screen.getByTestId('process-events-stats')).toBeInTheDocument();
  });

  it('should render implemented tabs with components', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });
    
    // First tab (default)
    expect(screen.getByTestId('process-events-stats')).toBeInTheDocument();
    
    // Second tab
    await user.click(screen.getByText('Polling info'));
    expect(screen.getByTestId('polling-info')).toBeInTheDocument();
    
    // Third tab
    await user.click(screen.getByText('Processing events view'));
    expect(screen.getByTestId('processing-events-view')).toBeInTheDocument();
  });

  it('should render all implemented tabs with components', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabProcessingEvents />, { wrapper });

    // Fourth tab
    await user.click(screen.getByText('Processing events error view'));
    expect(screen.getByTestId('processing-events-error-view')).toBeInTheDocument();

    // Fifth tab
    await user.click(screen.getByText('Entities error list view'));
    expect(screen.getByTestId('entities-error-list-view')).toBeInTheDocument();

    // Sixth tab
    await user.click(screen.getByText('SIFT logger conf view'));
    expect(screen.getByTestId('sift-logger-conf-view')).toBeInTheDocument();
  });
});

