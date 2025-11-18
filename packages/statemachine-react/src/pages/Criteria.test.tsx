/**
 * Criteria Page Tests
 * Tests for the Criteria page component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Criteria } from './Criteria';
import { message } from 'antd';

// Mock CriteriaForm component
vi.mock('../components/CriteriaForm', () => ({
  default: ({ onSubmitted, onCancel, criteriaId, entityClassName, persistedType, mode }: any) => (
    <div data-testid="criteria-form">
      <div>CriteriaForm</div>
      <div>Mode: {mode}</div>
      <div>CriteriaId: {criteriaId || 'new'}</div>
      <div>EntityClassName: {entityClassName}</div>
      <div>PersistedType: {persistedType}</div>
      <button onClick={() => onSubmitted()}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

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

const createWrapper = (
  criteriaId = 'new',
  searchParams = 'workflowId=workflow-1&persistedType=persisted&entityClassName=com.example.Order&workflowPersistedType=persisted'
) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/criteria/${criteriaId}?${searchParams}`]}>
        <Routes>
          <Route path="/criteria/:criteriaId" element={children} />
          <Route path="/workflow/:workflowId" element={<div>Workflow Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Criteria Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(message.success).mockClear();
  });

  describe('Rendering', () => {
    it('should render the page with back button', () => {
      render(<Criteria />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /back to workflow/i })).toBeInTheDocument();
    });

    it('should render CriteriaForm component', () => {
      render(<Criteria />, { wrapper: createWrapper() });

      expect(screen.getByTestId('criteria-form')).toBeInTheDocument();
    });

    it('should pass correct props to CriteriaForm for new criteria', () => {
      render(<Criteria />, { wrapper: createWrapper('new') });

      expect(screen.getByText('CriteriaId: new')).toBeInTheDocument();
      expect(screen.getByText('EntityClassName: com.example.Order')).toBeInTheDocument();
      expect(screen.getByText('PersistedType: persisted')).toBeInTheDocument();
      expect(screen.getByText('Mode: page')).toBeInTheDocument();
    });

    it('should pass correct props to CriteriaForm for existing criteria', () => {
      render(<Criteria />, { wrapper: createWrapper('criteria-123') });

      expect(screen.getByText('CriteriaId: criteria-123')).toBeInTheDocument();
      expect(screen.getByText('EntityClassName: com.example.Order')).toBeInTheDocument();
    });

    it('should handle runtime persisted type', () => {
      render(
        <Criteria />,
        {
          wrapper: createWrapper(
            'criteria-123',
            'workflowId=workflow-1&persistedType=runtime&entityClassName=com.example.Order&workflowPersistedType=runtime'
          ),
        }
      );

      expect(screen.getByText('PersistedType: runtime')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to workflow detail on back button click', async () => {
      const { container } = render(<Criteria />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /back to workflow/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should navigate back to workflow detail on cancel', async () => {
      const { container } = render(<Criteria />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should preserve workflow persisted type in navigation', async () => {
      const { container } = render(
        <Criteria />,
        {
          wrapper: createWrapper(
            'new',
            'workflowId=workflow-1&persistedType=draft&entityClassName=com.example.Order&workflowPersistedType=draft'
          ),
        }
      );

      const backButton = screen.getByRole('button', { name: /back to workflow/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should show success message on form submission', async () => {
      render(<Criteria />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalledWith('Criteria saved successfully');
      });
    });

    it('should navigate to workflow detail after successful submission', async () => {
      render(<Criteria />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalled();
        expect(screen.getByText('Workflow Detail Page')).toBeInTheDocument();
      });
    });

    it('should navigate with correct query parameters after submission', async () => {
      render(
        <Criteria />,
        {
          wrapper: createWrapper(
            'new',
            'workflowId=workflow-123&persistedType=draft&entityClassName=com.example.Product&workflowPersistedType=persisted'
          ),
        }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(vi.mocked(message.success)).toHaveBeenCalledWith('Criteria saved successfully');
      });
    });
  });

  describe('Query Parameters', () => {
    it('should handle missing query parameters with defaults', () => {
      render(<Criteria />, { wrapper: createWrapper('new', '') });

      expect(screen.getByText('EntityClassName:')).toBeInTheDocument();
      expect(screen.getByText('PersistedType: persisted')).toBeInTheDocument();
    });

    it('should extract all required query parameters', () => {
      render(
        <Criteria />,
        {
          wrapper: createWrapper(
            'criteria-456',
            'workflowId=wf-789&persistedType=runtime&entityClassName=com.example.Invoice&workflowPersistedType=runtime'
          ),
        }
      );

      expect(screen.getByText('EntityClassName: com.example.Invoice')).toBeInTheDocument();
      expect(screen.getByText('PersistedType: runtime')).toBeInTheDocument();
    });
  });
});

