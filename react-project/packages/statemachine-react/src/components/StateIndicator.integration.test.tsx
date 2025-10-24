/**
 * StateIndicator Integration Tests
 * Tests for StateIndicator usage across different components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransitionsList } from './TransitionsList';
import { CriteriaList } from './CriteriaList';
import { ProcessesList } from './ProcessesList';
import { StatesListModal } from './StatesListModal';

// Mock hooks
const mockUseTransitionsList = vi.fn();
const mockUseCriteriaList = vi.fn();
const mockUseProcessesList = vi.fn();
const mockUseStatesList = vi.fn();
const mockUseDeleteTransition = vi.fn();
const mockUseDeleteCriteria = vi.fn();
const mockUseDeleteProcess = vi.fn();
const mockUseDeleteState = vi.fn();
const mockUseCopyTransition = vi.fn();
const mockUseCopyCriteria = vi.fn();
const mockUseCopyProcess = vi.fn();

vi.mock('../hooks/useStatemachine', () => ({
  useTransitionsList: () => mockUseTransitionsList(),
  useCriteriaList: () => mockUseCriteriaList(),
  useProcessesList: () => mockUseProcessesList(),
  useStatesList: () => mockUseStatesList(),
  useDeleteTransition: () => mockUseDeleteTransition(),
  useDeleteCriteria: () => mockUseDeleteCriteria(),
  useDeleteProcess: () => mockUseDeleteProcess(),
  useDeleteState: () => mockUseDeleteState(),
  useCopyTransition: () => mockUseCopyTransition(),
  useCopyCriteria: () => mockUseCopyCriteria(),
  useCopyProcess: () => mockUseCopyProcess(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('StateIndicator Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseDeleteTransition.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteCriteria.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteProcess.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseDeleteState.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCopyTransition.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCopyCriteria.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    mockUseCopyProcess.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  describe('TransitionsList', () => {
    it('should render StateIndicator for Active column', () => {
      mockUseTransitionsList.mockReturnValue({
        data: [
          {
            id: 'transition-1',
            name: 'Transition 1',
            active: true,
            persisted: true,
            automated: false,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <TransitionsList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      // StateIndicator should be rendered
      expect(container.querySelector('.state-indicator')).toBeInTheDocument();
    });

    it('should render StateIndicator for Persisted column', () => {
      mockUseTransitionsList.mockReturnValue({
        data: [
          {
            id: 'transition-1',
            name: 'Transition 1',
            active: true,
            persisted: false,
            automated: false,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <TransitionsList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      expect(container.querySelector('.state-indicator')).toBeInTheDocument();
    });

    it('should render StateIndicator with automated type for Automated column', () => {
      mockUseTransitionsList.mockReturnValue({
        data: [
          {
            id: 'transition-1',
            name: 'Transition 1',
            active: true,
            persisted: true,
            automated: true,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <TransitionsList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      // Should have automated indicator
      expect(container.querySelector('.state-indicator-automated')).toBeInTheDocument();
    });
  });

  describe('CriteriaList', () => {
    it('should render StateIndicator for Persisted column', () => {
      mockUseCriteriaList.mockReturnValue({
        data: [
          {
            id: 'criteria-1',
            name: 'Criteria 1',
            persisted: true,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <CriteriaList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      expect(container.querySelector('.state-indicator')).toBeInTheDocument();
    });

    it('should show correct state for persisted criteria', () => {
      mockUseCriteriaList.mockReturnValue({
        data: [
          {
            id: 'criteria-1',
            name: 'Criteria 1',
            persisted: true,
          },
          {
            id: 'criteria-2',
            name: 'Criteria 2',
            persisted: false,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <CriteriaList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      const indicators = container.querySelectorAll('.state-indicator');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('ProcessesList', () => {
    it('should render StateIndicator for Persisted column', () => {
      mockUseProcessesList.mockReturnValue({
        data: [
          {
            id: 'process-1',
            name: 'Process 1',
            persisted: true,
            isTemplate: false,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <ProcessesList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      expect(container.querySelector('.state-indicator')).toBeInTheDocument();
    });

    it('should render StateIndicator for Template column', () => {
      mockUseProcessesList.mockReturnValue({
        data: [
          {
            id: 'process-1',
            name: 'Process 1',
            persisted: true,
            isTemplate: true,
          },
        ],
        isLoading: false,
      });

      const { container } = render(
        <ProcessesList
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      const indicators = container.querySelectorAll('.state-indicator');
      // Should have 2 indicators: Persisted + Template
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('StatesListModal', () => {
    it('should render StateIndicator for Persisted column', () => {
      mockUseStatesList.mockReturnValue({
        data: [
          {
            id: 'state-1',
            name: 'State 1',
            persisted: true,
          },
        ],
        isLoading: false,
        refetch: vi.fn(),
      });

      const { container } = render(
        <StatesListModal
          visible={true}
          onClose={vi.fn()}
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      expect(container.querySelector('.state-indicator')).toBeInTheDocument();
    });

    it('should show correct state for persisted states', () => {
      mockUseStatesList.mockReturnValue({
        data: [
          {
            id: 'state-1',
            name: 'State 1',
            persisted: true,
          },
          {
            id: 'state-2',
            name: 'State 2',
            persisted: false,
          },
        ],
        isLoading: false,
        refetch: vi.fn(),
      });

      const { container } = render(
        <StatesListModal
          visible={true}
          onClose={vi.fn()}
          workflowId="workflow-1"
          persistedType="persisted"
          entityClassName="com.example.Entity"
        />,
        { wrapper: createWrapper() }
      );

      const indicators = container.querySelectorAll('.state-indicator');
      expect(indicators.length).toBeGreaterThan(0);
    });
  });
});

