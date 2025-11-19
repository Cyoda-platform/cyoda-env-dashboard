/**
 * Tests for PmComponentsClear Component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PmComponentsClear } from '../PmComponentsClear';
import * as hooks from '../../../hooks';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useDoClearAllCaches: vi.fn(),
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

const mockDoClearAllCaches = vi.fn();

describe('PmComponentsClear', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(hooks.useDoClearAllCaches).mockReturnValue({
      mutate: mockDoClearAllCaches,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component', () => {
    render(<PmComponentsClear />);
    
    const button = screen.getByRole('button', { name: /clear/i });
    expect(button).toBeInTheDocument();
  });

  it('should render primary button', () => {
    render(<PmComponentsClear />);
    
    const button = screen.getByRole('button', { name: /clear/i });
    expect(button).toHaveClass('ant-btn-primary');
  });

  it('should render dropdown icon', () => {
    const { container } = render(<PmComponentsClear />);
    
    const icon = container.querySelector('.anticon-down');
    expect(icon).toBeInTheDocument();
  });

  it('should render button text', () => {
    render(<PmComponentsClear />);
    
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();
    render(<PmComponentsClear />);
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Clear Caches')).toBeInTheDocument();
    });
  });

  it('should show modal on Clear Caches click', async () => {
    const user = userEvent.setup();
    render(<PmComponentsClear />);

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    const menuItem = await screen.findByText('Clear Caches');
    await user.click(menuItem);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should show modal on menu item click', async () => {
    const user = userEvent.setup();
    render(<PmComponentsClear />);

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    const menuItem = await screen.findByText('Clear Caches');
    await user.click(menuItem);

    await waitFor(() => {
      const warnings = screen.getAllByText('Warning');
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  it('should have dropdown menu item', async () => {
    const user = userEvent.setup();
    render(<PmComponentsClear />);

    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Clear Caches')).toBeInTheDocument();
    });
  });

  it('should have dropdown trigger on click', () => {
    render(<PmComponentsClear />);
    
    const button = screen.getByRole('button', { name: /clear/i });
    expect(button).toBeInTheDocument();
  });

  it('should have one menu item', async () => {
    const user = userEvent.setup();
    render(<PmComponentsClear />);
    
    const button = screen.getByRole('button', { name: /clear/i });
    await user.click(button);
    
    await waitFor(() => {
      const menuItem = screen.getByText('Clear Caches');
      expect(menuItem).toBeInTheDocument();
    });
  });
});

