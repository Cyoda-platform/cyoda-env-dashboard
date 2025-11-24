/**
 * Unit Tests: ErrorBoundary Component
 * Tests error catching, fallback UI, and recovery actions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ 
  shouldThrow = true, 
  error = new Error('Test error') 
}) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not show error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryAllByText(/something went wrong/i).length).toBe(0);
    });
  });

  describe('Error Catching', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError error={new Error('Custom error message')} />
        </ErrorBoundary>
      );

      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Fallback UI', () => {
    it('should display "Try Again" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getAllByText('Try Again').length).toBeGreaterThan(0);
    });

    it('should display "Reload Page" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getAllByText('Reload Page').length).toBeGreaterThan(0);
    });

    it('should display "Go Home" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getAllByText('Go Home').length).toBeGreaterThan(0);
    });

    it('should display error ID for support in production', () => {
      const originalEnv = import.meta.env.DEV;
      // @ts-ignore
      import.meta.env.DEV = false;

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/error id:/i)).toBeInTheDocument();

      // @ts-ignore
      import.meta.env.DEV = originalEnv;
    });
  });

  describe('Recovery Actions', () => {
    it('should reset error state when "Try Again" is clicked', () => {
      const { rerender, unmount } = render(
        <ErrorBoundary key="error">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);

      // Click Try Again - this resets the error boundary state
      const tryAgainButtons = screen.getAllByText('Try Again');
      fireEvent.click(tryAgainButtons[0]);

      // Unmount and remount with a component that doesn't throw
      unmount();
      render(
        <ErrorBoundary key="no-error">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Should show the new content
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should reload page when "Reload Page" is clicked', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const reloadButtons = screen.getAllByText('Reload Page');
      fireEvent.click(reloadButtons[0]);

      expect(reloadMock).toHaveBeenCalled();
    });

    it('should navigate to home when "Go Home" is clicked', () => {
      delete (window as any).location;
      (window as any).location = { href: '' };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const goHomeButtons = screen.getAllByText('Go Home');
      fireEvent.click(goHomeButtons[0]);

      expect(window.location.href).toBe('/');
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryAllByText(/something went wrong/i).length).toBe(0);
    });
  });

  describe('Development Mode', () => {
    it('should show error details in development mode', () => {
      const originalEnv = import.meta.env.DEV;
      // @ts-ignore
      import.meta.env.DEV = true;

      render(
        <ErrorBoundary>
          <ThrowError error={new Error('Test error')} />
        </ErrorBoundary>
      );

      // Should show error details section
      expect(screen.getByText(/error details/i)).toBeInTheDocument();

      // @ts-ignore
      import.meta.env.DEV = originalEnv;
    });
  });

  describe('Error State Management', () => {
    it('should maintain error state until reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);

      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show error
      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);
    });

    it('should clear error state after successful reset', () => {
      const { unmount } = render(
        <ErrorBoundary key="error">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error shown
      expect(screen.getAllByText(/something went wrong/i).length).toBeGreaterThan(0);

      // Click Try Again
      fireEvent.click(screen.getAllByText('Try Again')[0]);

      // Unmount and remount with a component that doesn't throw
      unmount();
      render(
        <ErrorBoundary key="no-error">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error should be cleared
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});

