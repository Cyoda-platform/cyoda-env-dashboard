/**
 * Tests for ShardsDetailTabCachesList Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShardsDetailTabCachesList from '../ShardsDetailTabCachesList';

describe('ShardsDetailTabCachesList', () => {
  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabCachesList />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabCachesList />);
    
    expect(screen.getByText('Caches List')).toBeInTheDocument();
  });

  it('should render placeholder text', () => {
    render(<ShardsDetailTabCachesList />);
    
    expect(screen.getByText('Caches list - To be implemented')).toBeInTheDocument();
  });

  it('should render card component', () => {
    const { container } = render(<ShardsDetailTabCachesList />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabCachesList />)).not.toThrow();
  });
});

