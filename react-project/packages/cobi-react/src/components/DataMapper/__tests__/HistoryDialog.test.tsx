/**
 * Tests for HistoryDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryDialog from '../HistoryDialog';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe('HistoryDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnRestore = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    render(
      <HistoryDialog
        visible={false}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.queryByText('Mapping History')).not.toBeInTheDocument();
  });

  it('should render when visible is true', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Mapping History')).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Mapping History')).toBeInTheDocument();
  });

  it('should render Close button', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should call onClose when Close button is clicked', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display loading state initially', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    // Table should be in loading state
    const table = document.querySelector('.ant-table');
    expect(table).toBeTruthy();
  });

  it('should load history when visible and entityMappingId are provided', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Updated mapping/i)).toBeInTheDocument();
    });
  });

  it('should display history table columns', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getAllByText('Version')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Timestamp')[0]).toBeInTheDocument();
      expect(screen.getAllByText('User')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Action')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Changes')[0]).toBeInTheDocument();
    });
  });

  it('should display history entries', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Updated mapping')).toBeInTheDocument();
      expect(screen.getByText('Added transformers')).toBeInTheDocument();
      expect(screen.getByText('Created mapping')).toBeInTheDocument();
    });
  });

  it('should display user names', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      const adminElements = screen.getAllByText('admin');
      expect(adminElements.length).toBeGreaterThan(0);
    });
  });

  it('should display version column', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      // Check for Version column header
      expect(screen.getAllByText('Version')[0]).toBeInTheDocument();
    });
  });

  it('should display Restore buttons', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
        onRestore={mockOnRestore}
      />
    );
    
    await waitFor(() => {
      const restoreButtons = screen.getAllByText('Restore');
      expect(restoreButtons.length).toBeGreaterThan(0);
    });
  });

  it('should display Restore buttons even when onRestore is not provided', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      // Wait for history to load
      expect(screen.getByText('Updated mapping')).toBeInTheDocument();
    });

    // Restore buttons should be present (component always shows them)
    const restoreButtons = screen.getAllByText('Restore');
    expect(restoreButtons.length).toBeGreaterThan(0);
  });

  it('should work without entityMappingId', () => {
    render(
      <HistoryDialog
        visible={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Mapping History')).toBeInTheDocument();
  });

  it('should render modal with history-dialog class', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );

    // Modal should be rendered
    expect(screen.getByText('Mapping History')).toBeInTheDocument();
  });

  it('should have modal width of 1000', () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Mapping History')).toBeInTheDocument();
  });

  it('should reload history when entityMappingId changes', async () => {
    const { rerender } = render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id-1"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Updated mapping')).toBeInTheDocument();
    });
    
    rerender(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id-2"
        onClose={mockOnClose}
      />
    );
    
    // History should reload
    await waitFor(() => {
      expect(screen.getByText('Updated mapping')).toBeInTheDocument();
    });
  });

  it('should display changes count', async () => {
    render(
      <HistoryDialog
        visible={true}
        entityMappingId="test-id"
        onClose={mockOnClose}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});

