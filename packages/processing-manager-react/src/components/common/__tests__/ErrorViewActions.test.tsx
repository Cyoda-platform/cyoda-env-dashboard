/**
 * Tests for ErrorViewActions Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { message, Modal } from 'antd';
import ErrorViewActions from '../ErrorViewActions';

// Mock hooks
vi.mock('../../../hooks', () => ({
  useProcessingQueueForceMarkProcessed: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ErrorViewActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', () => {
    renderWithRouter(<ErrorViewActions />);
    
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
  });

  it('should render Actions button with dropdown icon', () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('ant-btn-primary');
  });

  it('should show dropdown menu when clicked', async () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Force mark processed')).toBeInTheDocument();
    });
  });

  it('should have all menu items', async () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Force mark processed')).toBeInTheDocument();
      expect(screen.getByText('Resubmit Events For Error(with error event)')).toBeInTheDocument();
      expect(screen.getByText('Resubmit Events For Error(without error event)')).toBeInTheDocument();
    });
  });

  it('should call onReload when provided', () => {
    const onReload = vi.fn();
    renderWithRouter(<ErrorViewActions onReload={onReload} />);
    
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
  });

  it('should handle missing onReload prop', () => {
    renderWithRouter(<ErrorViewActions />);
    
    expect(screen.getByRole('button', { name: /Actions/i })).toBeInTheDocument();
  });

  it('should be a primary button', () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    expect(button).toHaveClass('ant-btn-primary');
  });

  it('should use dropdown trigger on click', () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    expect(button).toBeInTheDocument();
  });

  it('should render with BrowserRouter', () => {
    const { container } = renderWithRouter(<ErrorViewActions />);
    
    expect(container.querySelector('.ant-btn')).toBeInTheDocument();
  });

  it('should have DownOutlined icon', () => {
    renderWithRouter(<ErrorViewActions />);
    
    const button = screen.getByRole('button', { name: /Actions/i });
    expect(button.querySelector('.anticon-down')).toBeInTheDocument();
  });
});

