import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ActiveRelationInformation from '../ActiveRelationInformation';

describe('ActiveRelationInformation', () => {
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnCancel.mockClear();
  });

  it('should not render when isActive is false', () => {
    const { container } = render(
      <ActiveRelationInformation isActive={false} onCancel={mockOnCancel} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isActive is true', () => {
    render(<ActiveRelationInformation isActive={true} onCancel={mockOnCancel} />);
    expect(screen.getByText(/Press/i)).toBeInTheDocument();
    expect(screen.getByText('ESC')).toBeInTheDocument();
    expect(screen.getByText(/to cancel mapping/i)).toBeInTheDocument();
  });

  it('should call onCancel when ESC key is pressed', () => {
    render(<ActiveRelationInformation isActive={true} onCancel={mockOnCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when Esc key is pressed', () => {
    render(<ActiveRelationInformation isActive={true} onCancel={mockOnCancel} />);
    
    fireEvent.keyDown(document, { key: 'Esc' });
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should not call onCancel when other keys are pressed', () => {
    render(<ActiveRelationInformation isActive={true} onCancel={mockOnCancel} />);
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should not call onCancel when ESC is pressed but isActive is false', () => {
    render(<ActiveRelationInformation isActive={false} onCancel={mockOnCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});

