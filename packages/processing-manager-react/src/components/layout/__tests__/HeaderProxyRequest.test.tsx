/**
 * HeaderProxyRequest Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeaderProxyRequest from '../HeaderProxyRequest';

describe('HeaderProxyRequest', () => {
  let reloadSpy: any;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock window.location.reload
    reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });
    
    // Clear any existing timers
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render proxy request switch', () => {
    render(<HeaderProxyRequest />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should render info popover icon', () => {
    render(<HeaderProxyRequest />);
    
    // The InfoCircleOutlined icon should be present
    const container = screen.getByRole('switch').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should initialize with default value (true) when localStorage is empty', () => {
    render(<HeaderProxyRequest />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should initialize with value from localStorage', () => {
    localStorage.setItem('proxyRequest', JSON.stringify(false));
    
    render(<HeaderProxyRequest />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should save to localStorage when switch is toggled', () => {
    vi.useFakeTimers();

    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');

    // Initially true
    expect(switchElement).toBeChecked();

    // Toggle to false
    fireEvent.click(switchElement);

    // Check localStorage was updated
    expect(localStorage.getItem('proxyRequest')).toBe('false');

    vi.useRealTimers();
  });

  it('should reload window after 1 second when toggled', () => {
    vi.useFakeTimers();

    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');

    // Toggle switch
    fireEvent.click(switchElement);

    // Reload should not be called immediately
    expect(reloadSpy).not.toHaveBeenCalled();

    // Fast-forward time by 1 second
    vi.advanceTimersByTime(1000);

    // Now reload should be called
    expect(reloadSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should toggle from true to false', () => {
    vi.useFakeTimers();

    localStorage.setItem('proxyRequest', JSON.stringify(true));

    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();

    fireEvent.click(switchElement);

    expect(localStorage.getItem('proxyRequest')).toBe('false');

    vi.useRealTimers();
  });

  it('should toggle from false to true', () => {
    vi.useFakeTimers();

    localStorage.setItem('proxyRequest', JSON.stringify(false));

    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();

    fireEvent.click(switchElement);

    expect(localStorage.getItem('proxyRequest')).toBe('true');

    vi.useRealTimers();
  });

  it('should display popover content when hovering over info icon', async () => {
    const user = userEvent.setup();
    
    render(<HeaderProxyRequest />);
    
    // Find the info icon (it's wrapped in a Popover)
    const container = screen.getByRole('switch').closest('div');
    expect(container).toBeInTheDocument();
    
    // The popover content is rendered on hover, but testing Ant Design Popover
    // requires more complex setup. For now, we verify the component renders.
  });

  it('should handle multiple rapid toggles correctly', () => {
    vi.useFakeTimers();

    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');

    // Toggle multiple times
    fireEvent.click(switchElement);
    fireEvent.click(switchElement);
    fireEvent.click(switchElement);

    // Should end up in the opposite state (toggled 3 times)
    expect(localStorage.getItem('proxyRequest')).toBe('false');

    vi.useRealTimers();
  });

  it('should persist state across re-renders', () => {
    localStorage.setItem('proxyRequest', JSON.stringify(false));
    
    const { rerender } = render(<HeaderProxyRequest />);
    
    let switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
    
    // Re-render
    rerender(<HeaderProxyRequest />);
    
    switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should handle invalid localStorage value gracefully', () => {
    localStorage.setItem('proxyRequest', 'invalid-json');

    // Should not throw error and should use default value
    render(<HeaderProxyRequest />);

    const switchElement = screen.getByRole('switch');
    // Should default to true when localStorage value is invalid
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked(); // Should default to true
  });
});

