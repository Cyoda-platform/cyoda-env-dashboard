/**
 * Tests for ShardsDetailTabNetworkInfo Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabNetworkInfo from '../ShardsDetailTabNetworkInfo';
import type { ReactNode } from 'react';

describe('ShardsDetailTabNetworkInfo', () => {
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
    const { container } = render(<ShardsDetailTabNetworkInfo />, { wrapper });

    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabNetworkInfo />, { wrapper });

    expect(screen.getByText('Network Info')).toBeInTheDocument();
  });

  it('should render network components', () => {
    const { container } = render(<ShardsDetailTabNetworkInfo />, { wrapper });

    // Check that the component renders (it contains NetworkInfoServer and NetworkClients)
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render card component', () => {
    const { container } = render(<ShardsDetailTabNetworkInfo />, { wrapper });

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabNetworkInfo />, { wrapper })).not.toThrow();
  });
});

