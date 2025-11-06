/**
 * ProxyModeToggle Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProxyModeToggle from '../ProxyModeToggle';
import { useAppStore } from '../../../stores/appStore';

// Mock window.location.reload
const originalLocation = window.location;

describe('ProxyModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset the store to default state
    useAppStore.setState({
      proxyRequest: true,
    });
    
    // Mock window.location.reload
    delete (window as any).location;
    window.location = { ...originalLocation, reload: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.location = originalLocation;
  });

  it('should render the component', () => {
    render(<ProxyModeToggle />);
    
    expect(screen.getByText('Proxy mode')).toBeInTheDocument();
  });

  it('should render with switch in ON state by default', () => {
    render(<ProxyModeToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveClass('ant-switch-checked');
  });

  it('should render with switch in OFF state when proxyRequest is false', () => {
    useAppStore.setState({ proxyRequest: false });
    
    render(<ProxyModeToggle />);
    
    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).not.toHaveClass('ant-switch-checked');
  });

  it('should render info icon', () => {
    const { container } = render(<ProxyModeToggle />);
    
    const infoIcon = container.querySelector('.anticon-info-circle');
    expect(infoIcon).toBeInTheDocument();
  });

  it('should show popover when info icon is clicked', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const user = userEvent.setup();
    render(<ProxyModeToggle />);

    const infoIcon = document.querySelector('.anticon-info-circle');
    expect(infoIcon).toBeInTheDocument();

    await user.click(infoIcon!);

    // Wait for popover to appear - check for popover content class
    await waitFor(() => {
      const popoverContent = document.querySelector('.ant-popover-inner-content');
      expect(popoverContent).toBeInTheDocument();
    });
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should display popover with content', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const user = userEvent.setup();
    render(<ProxyModeToggle />);

    const infoIcon = document.querySelector('.anticon-info-circle');
    await user.click(infoIcon!);

    await waitFor(() => {
      const popoverContent = document.querySelector('.ant-popover-inner-content');
      expect(popoverContent).toBeInTheDocument();
      expect(popoverContent?.textContent).toContain('on');
      expect(popoverContent?.textContent).toContain('off');
      expect(popoverContent?.textContent).toContain('requests');
    });
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should toggle proxyRequest state when clicked', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const user = userEvent.setup();
    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');
    expect(switchElement).toBeInTheDocument();

    // Initially ON
    expect(useAppStore.getState().proxyRequest).toBe(true);

    // Click to turn OFF
    await user.click(switchElement!);

    // Should be OFF now
    expect(useAppStore.getState().proxyRequest).toBe(false);
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should reload page after 1 second when toggled', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload');

    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');

    // Simulate click directly without userEvent to avoid timing issues
    switchElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Should not reload immediately
    expect(reloadSpy).not.toHaveBeenCalled();

    // Fast-forward time by 1 second
    vi.advanceTimersByTime(1000);

    // Should reload now
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('should not reload page before 1 second', async () => {
    const reloadSpy = vi.spyOn(window.location, 'reload');

    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');

    // Simulate click directly without userEvent to avoid timing issues
    switchElement?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Fast-forward time by 500ms (half a second)
    vi.advanceTimersByTime(500);

    // Should not reload yet
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('should call setProxyRequest when switch is toggled', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const setProxyRequestSpy = vi.spyOn(useAppStore.getState(), 'setProxyRequest');
    const user = userEvent.setup();

    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');
    await user.click(switchElement!);

    expect(setProxyRequestSpy).toHaveBeenCalledWith(false);
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should have correct CSS class', () => {
    const { container } = render(<ProxyModeToggle />);
    
    const wrapper = container.querySelector('.proxy-mode-toggle');
    expect(wrapper).toBeInTheDocument();
  });

  it('should toggle from OFF to ON', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const user = userEvent.setup();
    useAppStore.setState({ proxyRequest: false });

    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');

    // Initially OFF
    expect(useAppStore.getState().proxyRequest).toBe(false);

    // Click to turn ON
    await user.click(switchElement!);

    // Should be ON now
    expect(useAppStore.getState().proxyRequest).toBe(true);
    vi.useFakeTimers(); // Restore fake timers
  });

  it('should persist state changes', async () => {
    vi.useRealTimers(); // Use real timers for this test
    const user = userEvent.setup();
    render(<ProxyModeToggle />);

    const switchElement = document.querySelector('.ant-switch');

    // Toggle OFF
    await user.click(switchElement!);
    expect(useAppStore.getState().proxyRequest).toBe(false);

    // Simulate component unmount and remount
    const { unmount } = render(<ProxyModeToggle />);
    unmount();

    // State should persist
    expect(useAppStore.getState().proxyRequest).toBe(false);
    vi.useFakeTimers(); // Restore fake timers
  });
});

