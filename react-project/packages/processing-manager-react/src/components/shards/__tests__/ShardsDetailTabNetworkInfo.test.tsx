/**
 * Tests for ShardsDetailTabNetworkInfo Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShardsDetailTabNetworkInfo from '../ShardsDetailTabNetworkInfo';

describe('ShardsDetailTabNetworkInfo', () => {
  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabNetworkInfo />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabNetworkInfo />);
    
    expect(screen.getByText('Network Info')).toBeInTheDocument();
  });

  it('should render placeholder text', () => {
    render(<ShardsDetailTabNetworkInfo />);
    
    expect(screen.getByText('Network info - To be implemented')).toBeInTheDocument();
  });

  it('should render card component', () => {
    const { container } = render(<ShardsDetailTabNetworkInfo />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabNetworkInfo />)).not.toThrow();
  });
});

