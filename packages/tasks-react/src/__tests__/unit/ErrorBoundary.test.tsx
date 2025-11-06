/**
 * Unit Tests: ErrorBoundary Component
 * Tests error catching, fallback UI, and recovery actions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError error={new Error('Custom error message')} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
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

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should display "Reload Page" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should display "Go Home" button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should display error ID for support', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/error id:/i)).toBeInTheDocument();
    });
  });

  describe('Recovery Actions', () => {
    it('should reset error state when "Try Again" is clicked', () => {
      let shouldThrow = true;
      
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error
      shouldThrow = false;

      // Click Try Again
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);

      // Re-render with fixed component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Should show content now
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
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

      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);

      expect(reloadMock).toHaveBeenCalled();
    });

    it('should navigate to home when "Go Home" is clicked', () => {
      const assignMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByText('Go Home');
      fireEvent.click(goHomeButton);

      expect(assignMock).toHaveBeenCalledWith('/');
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
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
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

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Re-render with same error
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still show error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should clear error state after successful reset', () => {
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Error shown
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix error and click Try Again
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Error should be cleared
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});

