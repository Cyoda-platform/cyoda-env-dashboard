/**
 * LiveUpdateToggle Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LiveUpdateToggle from '../LiveUpdateToggle';
import { useAppStore } from '../../../stores/appStore';

describe('LiveUpdateToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store to default state
    useAppStore.setState({
      liveUpdate: false,
    });
  });

  it('should render the component', () => {
    render(<LiveUpdateToggle />);
    
    expect(screen.getByText('Live update:')).toBeInTheDocument();
  });

  it('should render with switch in OFF state by default', () => {
    render(<LiveUpdateToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toHaveClass('ant-switch-checked');
  });

  it('should render with switch in ON state when liveUpdate is true', () => {
    useAppStore.setState({ liveUpdate: true });
    
    render(<LiveUpdateToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).toHaveClass('ant-switch-checked');
  });

  it('should toggle liveUpdate state when clicked', async () => {
    const user = userEvent.setup();
    render(<LiveUpdateToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).toBeInTheDocument();
    
    // Initially OFF
    expect(useAppStore.getState().liveUpdate).toBe(false);
    
    // Click to turn ON
    await user.click(switchElement!);
    
    // Should be ON now
    expect(useAppStore.getState().liveUpdate).toBe(true);
    
    // Click to turn OFF
    await user.click(switchElement!);
    
    // Should be OFF now
    expect(useAppStore.getState().liveUpdate).toBe(false);
  });

  it('should call setLiveUpdate when switch is toggled', async () => {
    const user = userEvent.setup();
    const setLiveUpdateSpy = vi.spyOn(useAppStore.getState(), 'setLiveUpdate');
    
    render(<LiveUpdateToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    await user.click(switchElement!);
    
    expect(setLiveUpdateSpy).toHaveBeenCalledWith(true);
  });

  it('should have correct CSS class', () => {
    const { container } = render(<LiveUpdateToggle />);
    
    const wrapper = container.querySelector('.live-update-toggle');
    expect(wrapper).toBeInTheDocument();
  });

  it('should persist state changes', async () => {
    const user = userEvent.setup();
    render(<LiveUpdateToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    
    // Toggle ON
    await user.click(switchElement!);
    expect(useAppStore.getState().liveUpdate).toBe(true);
    
    // Simulate component unmount and remount
    const { unmount } = render(<LiveUpdateToggle />);
    unmount();
    
    // State should persist
    expect(useAppStore.getState().liveUpdate).toBe(true);
  });
});

