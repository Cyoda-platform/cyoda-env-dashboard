/**
 * Tests for ShardsDetailTabCompositeIndexes Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShardsDetailTabCompositeIndexes from '../ShardsDetailTabCompositeIndexes';

describe('ShardsDetailTabCompositeIndexes', () => {
  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabCompositeIndexes />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabCompositeIndexes />);
    
    expect(screen.getByText('Composite Indexes')).toBeInTheDocument();
  });

  it('should render placeholder text', () => {
    render(<ShardsDetailTabCompositeIndexes />);
    
    expect(screen.getByText('Composite indexes - To be implemented')).toBeInTheDocument();
  });

  it('should render card component', () => {
    const { container } = render(<ShardsDetailTabCompositeIndexes />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabCompositeIndexes />)).not.toThrow();
  });
});

