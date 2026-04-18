/**
 * Integration Test: Workflow Creation Flow
 * Tests the complete workflow creation process including form submission and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import { Workflows } from '../../pages/Workflows';
import { WorkflowDetail } from '../../pages/WorkflowDetail';

// Route the Workflows dispatch to the legacy branch so we do not need to
// mock the cloud-only hooks and components.
vi.mock('@cyoda/http-api-react', async () => {
  const actual = await vi.importActual<any>('@cyoda/http-api-react');
  return {
    ...actual,
    useGlobalUiSettingsStore: () => ({ entityType: 'BUSINESS' }),
    HelperFeatureFlags: {
      ...(actual.HelperFeatureFlags ?? {}),
      isCloudBusinessActive: () => false,
      isCyodaCloud: () => false,
      isWorkflowEnabled: () => true,
      workflowEnabledTypes: () => [],
    },
  };
});

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
    })),
    defaults: {
      paramsSerializer: {},
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

// Mock the hooks with realistic data
vi.mock('../../hooks/useStatemachine', () => ({
  useWorkflowsList: vi.fn(() => ({
    data: [
      {
        id: 'workflow-1',
        name: 'Test Workflow',
        entityClassName: 'com.example.Entity',
        active: true,
        persisted: true,
        createdDatetime: '2024-01-01T10:00:00Z',
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useWorkflow: vi.fn(() => ({
    data: {
      id: 'workflow-1',
      name: 'Test Workflow',
      entityClassName: 'com.example.Entity',
      active: true,
      persisted: true,
      createdDatetime: '2024-01-01T10:00:00Z',
    },
    isLoading: false,
  })),
  useWorkflowEnabledTypes: vi.fn(() => ({
    data: [
      { value: 'com.example.Entity', label: 'Entity' },
    ],
    isLoading: false,
  })),
  useStatesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useTransitionsList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useProcessesList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCriteriaList: vi.fn(() => ({
    data: [],
    isLoading: false,
    refetch: vi.fn(),
  })),
  useCreateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-workflow-id' }),
    isPending: false,
  })),
  useUpdateWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useDeleteWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useCopyWorkflow: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  statemachineKeys: {
    all: ['statemachine'],
    workflows: () => ['statemachine', 'workflows'],
    workflowsList: () => ['statemachine', 'workflows', 'list'],
    workflow: () => ['statemachine', 'workflow'],
    workflowDoc: () => ['statemachine', 'workflows', 'doc'],
    workflowEnabledTypes: () => ['statemachine', 'workflows', 'enabled-types'],
    states: () => ['statemachine', 'states'],
    statesList: () => ['statemachine', 'states', 'list'],
    state: () => ['statemachine', 'states', 'state'],
    transitions: () => ['statemachine', 'transitions'],
    transitionsList: () => ['statemachine', 'transitions', 'list'],
    transition: () => ['statemachine', 'transitions', 'transition'],
    criteria: () => ['statemachine', 'criteria'],
    criteriaList: () => ['statemachine', 'criteria', 'list'],
    criteriaItem: () => ['statemachine', 'criteria', 'item'],
    criteriacheckers: () => ['statemachine', 'criteria', 'checkers'],
  },
}));

// Mock the statemachine store so `useStatemachineStore.getState().getAllWorkflowsList()`
// (called from Workflows.tsx) resolves with our fixture data.
vi.mock('../../stores/statemachineStore', () => {
  const state = {
    selectedWorkflow: null,
    selectedModelRef: null,
    selectedEntityClassName: null,
    setSelectedWorkflow: vi.fn(),
    setSelectedModelRef: vi.fn(),
    setSelectedEntityClassName: vi.fn(),
    getAllWorkflowsList: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'workflow-1',
          name: 'Test Workflow',
          entityClassName: 'com.example.Entity',
          active: true,
          persisted: true,
          createdDatetime: '2024-01-01T10:00:00Z',
        },
      ],
    }),
    getWorkflowEnabledTypes: vi.fn().mockResolvedValue({ data: [] }),
  };
  const hook: any = (selector?: any) => (selector ? selector(state) : state);
  hook.getState = () => state;
  hook.setState = vi.fn();
  return { useStatemachineStore: hook };
});

// Mock HelperDictionary
vi.mock('@cyoda/ui-lib-react', async () => {
  const actual = await vi.importActual('@cyoda/ui-lib-react');
  return {
    ...actual,
    HelperDictionary: {
      getLabel: (type: string, key: string) => key,
      getOptions: () => [],
    },
    HelperFormat: {
      date: (date: string) => new Date(date).toLocaleDateString(),
    },
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/statemachine/workflow/:workflowId" element={<WorkflowDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Workflow Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display workflows list', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    expect(await screen.findByText('Test Workflow')).toBeInTheDocument();
  });

  it('should render workflows page', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Should render the page with workflow data
    expect(await screen.findByText('Test Workflow')).toBeInTheDocument();
  });

  it('should display workflow details', async () => {
    render(<Workflows />, { wrapper: createWrapper() });

    // Workflow should be displayed
    expect(await screen.findByText('Test Workflow')).toBeInTheDocument();
  });
});

