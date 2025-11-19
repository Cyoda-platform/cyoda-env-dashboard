/**
 * Tests for ShardsDetailTabTimeStatistics Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabTimeStatistics from '../ShardsDetailTabTimeStatistics';
import type { ReactNode } from 'react';

// Mock the child components
vi.mock('../../time-statistics', () => ({
  TimeStatisticsTimeStat: () => <div data-testid="time-stat">Time Statistics</div>,
  TimeStatisticsCountStat: () => <div data-testid="count-stat">Count Statistics</div>,
  TimeStatisticsClear: () => <button>Clear</button>,
}));

describe('ShardsDetailTabTimeStatistics', () => {
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
    const { container } = render(<ShardsDetailTabTimeStatistics />, { wrapper });

    expect(container.querySelector('.time-statistics-tab')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    expect(screen.getByText('Time statistics')).toBeInTheDocument();
  });

  it('should render Clear button', () => {
    render(<ShardsDetailTabTimeStatistics />, { wrapper });

    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    expect(screen.getByText('Time stats')).toBeInTheDocument();
    expect(screen.getByText('Count stats')).toBeInTheDocument();
  });

  it('should show Time stats tab content by default', () => {
    render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    expect(screen.getByTestId('time-stat')).toBeInTheDocument();
    expect(screen.getByText('Time Statistics')).toBeInTheDocument();
  });

  it('should switch to Count stats tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    const tab = screen.getByText('Count stats');
    await user.click(tab);
    
    expect(screen.getByTestId('count-stat')).toBeInTheDocument();
    expect(screen.getByText('Count Statistics')).toBeInTheDocument();
  });



  it('should render tabs component', () => {
    const { container } = render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have two tabs', () => {
    const { container } = render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(2);
  });



  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabTimeStatistics />, { wrapper })).not.toThrow();
  });

  it('should maintain active tab state', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabTimeStatistics />, { wrapper });
    
    // Click second tab
    await user.click(screen.getByText('Count stats'));
    expect(screen.getByTestId('count-stat')).toBeInTheDocument();
    
    // Click first tab
    await user.click(screen.getByText('Time stats'));
    expect(screen.getByTestId('time-stat')).toBeInTheDocument();
  });

  it('should render title and Clear button in header', () => {
    render(<ShardsDetailTabTimeStatistics />, { wrapper });

    const title = screen.getByText('Time statistics');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    expect(title).toBeInTheDocument();
    expect(clearButton).toBeInTheDocument();
  });
});

