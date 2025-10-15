/**
 * Tests for ShardsDetailTabZKInfo Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabZKInfo from '../ShardsDetailTabZKInfo';

describe('ShardsDetailTabZKInfo', () => {
  it('should render the component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />);
    
    expect(container.querySelector('.ant-card')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<ShardsDetailTabZKInfo />);
    
    expect(screen.getByText('ZooKeeper Info')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabZKInfo />);
    
    expect(screen.getByText('Current Node Info')).toBeInTheDocument();
    expect(screen.getByText('Loaded Online Nodes')).toBeInTheDocument();
    expect(screen.getByText('Loaded Shards Distribution')).toBeInTheDocument();
  });

  it('should show Current Node Info tab content by default', () => {
    render(<ShardsDetailTabZKInfo />);
    
    expect(screen.getByText('Current node info - To be implemented')).toBeInTheDocument();
  });

  it('should switch to Loaded Online Nodes tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabZKInfo />);
    
    const tab = screen.getByText('Loaded Online Nodes');
    await user.click(tab);
    
    expect(screen.getByText('Loaded online nodes - To be implemented')).toBeInTheDocument();
  });

  it('should switch to Loaded Shards Distribution tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabZKInfo />);
    
    const tab = screen.getByText('Loaded Shards Distribution');
    await user.click(tab);
    
    expect(screen.getByText('Loaded shards distribution - To be implemented')).toBeInTheDocument();
  });

  it('should render tabs component', () => {
    const { container } = render(<ShardsDetailTabZKInfo />);
    
    expect(container.querySelector('.ant-tabs')).toBeInTheDocument();
  });

  it('should have three tabs', () => {
    const { container } = render(<ShardsDetailTabZKInfo />);
    
    const tabs = container.querySelectorAll('.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
  });

  it('should render without errors', () => {
    expect(() => render(<ShardsDetailTabZKInfo />)).not.toThrow();
  });

  it('should maintain active tab state', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabZKInfo />);
    
    // Click second tab
    await user.click(screen.getByText('Loaded Online Nodes'));
    expect(screen.getByText('Loaded online nodes - To be implemented')).toBeInTheDocument();
    
    // Click third tab
    await user.click(screen.getByText('Loaded Shards Distribution'));
    expect(screen.getByText('Loaded shards distribution - To be implemented')).toBeInTheDocument();
    
    // Click first tab
    await user.click(screen.getByText('Current Node Info'));
    expect(screen.getByText('Current node info - To be implemented')).toBeInTheDocument();
  });
});

