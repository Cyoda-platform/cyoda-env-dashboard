/**
 * Tests for ShardsDetailTabCompositeIndexes Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShardsDetailTabCompositeIndexes from '../ShardsDetailTabCompositeIndexes';
import type { ReactNode } from 'react';

describe('ShardsDetailTabCompositeIndexes', () => {
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
    const { container } = render(<ShardsDetailTabCompositeIndexes />, { wrapper });

    expect(container.querySelector('.composite-indexes-wrapper')).toBeInTheDocument();
  });

  it('should render title from CompositeIndexesWrapper', () => {
    render(<ShardsDetailTabCompositeIndexes />, { wrapper });

    expect(screen.getByText('Composite indexes')).toBeInTheDocument();
  });

  it('should render CompositeIndexesWrapper component', () => {
    const { container } = render(<ShardsDetailTabCompositeIndexes />, { wrapper });

    expect(container.querySelector('.composite-indexes-wrapper')).toBeInTheDocument();
  });

  it('should not render card component', () => {
    const { container } = render(<ShardsDetailTabCompositeIndexes />, { wrapper });

    const card = container.querySelector('.ant-card');
    expect(card).not.toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabCompositeIndexes />, { wrapper })).not.toThrow();
  });
});

