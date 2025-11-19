/**
 * Tests for ShardsDetailTabCachesList Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabCachesList from '../ShardsDetailTabCachesList';
import type { ReactNode } from 'react';

describe('ShardsDetailTabCachesList', () => {
  // Create test query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  // Wrapper component
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabCachesList />, { wrapper });

    expect(screen.getByText('Caches List')).toBeInTheDocument();
  });

  it('should render table', () => {
    const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

    expect(container.querySelector('.ant-table')).toBeInTheDocument();
  });

  it('should render card component', () => {
    const { container } = render(<ShardsDetailTabCachesList />, { wrapper });

    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabCachesList />, { wrapper })).not.toThrow();
  });
});

