/**
 * ShardsDetailTabPmComponents Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShardsDetailTabPmComponents from '../ShardsDetailTabPmComponents';

describe('ShardsDetailTabPmComponents', () => {
  it('should render PM components title', () => {
    render(<ShardsDetailTabPmComponents />);
    
    expect(screen.getByText('PM components')).toBeInTheDocument();
  });

  it('should render all tab labels', () => {
    render(<ShardsDetailTabPmComponents />);
    
    expect(screen.getByText('Execution Queues Info')).toBeInTheDocument();
    expect(screen.getByText('Execution Monitors')).toBeInTheDocument();
    expect(screen.getByText('Service Processes View')).toBeInTheDocument();
    expect(screen.getByText('Cyoda Runnable Components')).toBeInTheDocument();
  });

  it('should show Execution Queues Info tab content by default', () => {
    render(<ShardsDetailTabPmComponents />);
    
    expect(screen.getByText('Execution Queues Info - To be implemented')).toBeInTheDocument();
  });

  it('should switch to Execution Monitors tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabPmComponents />);
    
    const tab = screen.getByText('Execution Monitors');
    await user.click(tab);
    
    expect(screen.getByText('Execution Monitors - To be implemented')).toBeInTheDocument();
  });

  it('should switch to Service Processes View tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabPmComponents />);
    
    const tab = screen.getByText('Service Processes View');
    await user.click(tab);
    
    expect(screen.getByText('Service Processes View - To be implemented')).toBeInTheDocument();
  });

  it('should switch to Cyoda Runnable Components tab when clicked', async () => {
    const user = userEvent.setup();
    render(<ShardsDetailTabPmComponents />);
    
    const tab = screen.getByText('Cyoda Runnable Components');
    await user.click(tab);
    
    expect(screen.getByText('Cyoda Runnable Components - To be implemented')).toBeInTheDocument();
  });

  it('should have correct layout structure', () => {
    const { container } = render(<ShardsDetailTabPmComponents />);
    
    expect(container.querySelector('.row')).toBeInTheDocument();
    expect(container.querySelector('.col-sm-12')).toBeInTheDocument();
    expect(container.querySelector('.wrap-title')).toBeInTheDocument();
    expect(container.querySelector('.flex')).toBeInTheDocument();
  });

  it('should render Card component', () => {
    const { container } = render(<ShardsDetailTabPmComponents />);
    
    const card = container.querySelector('.ant-card');
    expect(card).toBeInTheDocument();
  });

  it('should render Tabs component', () => {
    const { container } = render(<ShardsDetailTabPmComponents />);
    
    const tabs = container.querySelector('.ant-tabs');
    expect(tabs).toBeInTheDocument();
  });

  it('should have 4 tab panes', () => {
    const { container } = render(<ShardsDetailTabPmComponents />);
    
    const tabPanes = container.querySelectorAll('.ant-tabs-tab');
    expect(tabPanes.length).toBe(4);
  });
});

