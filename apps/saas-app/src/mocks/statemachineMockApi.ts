/**
 * Mock API for State Machine endpoints
 * This provides mock data when the backend is not available
 */

import { axios } from '@cyoda/http-api-react';

const MOCK_STORAGE_KEY = 'saas-app-statemachine-mock-enabled';
const DATA_STORAGE_KEY = 'saas-app-statemachine-mock-data';

// Check if mock is enabled
const isMockEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  return stored === 'true';
};

// Mock data
let mockWorkflows: any[] = [
  {
    id: 'workflow-001',
    name: 'Order Processing',
    entityClassName: 'com.cyoda.tms.model.entities.Order',
    description: 'Workflow for processing customer orders',
    active: true,
    persisted: true,
    creationDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'workflow-002',
    name: 'User Onboarding',
    entityClassName: 'com.cyoda.tms.model.entities.User',
    description: 'Workflow for onboarding new users',
    active: true,
    persisted: true,
    creationDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
];

let mockCriteria: any[] = [
  { id: 'criteria-001', name: 'Payment Verified', description: 'Check if payment is verified', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'criteria-002', name: 'Stock Available', description: 'Check if items are in stock', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'criteria-003', name: 'Address Valid', description: 'Validate shipping address', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'criteria-004', name: 'User Verified', description: 'Check if user email is verified', entityClassName: 'com.cyoda.tms.model.entities.User', persisted: true },
  { id: 'criteria-005', name: 'Profile Complete', description: 'Check if user profile is complete', entityClassName: 'com.cyoda.tms.model.entities.User', persisted: true },
];

let mockProcesses: any[] = [
  { id: 'process-001', name: 'Send Confirmation Email', description: 'Send order confirmation to customer', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'process-002', name: 'Update Inventory', description: 'Decrease stock levels', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'process-003', name: 'Generate Invoice', description: 'Create invoice document', entityClassName: 'com.cyoda.tms.model.entities.Order', persisted: true },
  { id: 'process-004', name: 'Send Welcome Email', description: 'Send welcome email to new user', entityClassName: 'com.cyoda.tms.model.entities.User', persisted: true },
  { id: 'process-005', name: 'Create User Profile', description: 'Initialize user profile data', entityClassName: 'com.cyoda.tms.model.entities.User', persisted: true },
];

let mockTransitions: any[] = [
  // Order Processing workflow transitions
  {
    id: 'trans-001',
    name: 'Start Processing',
    workflowId: 'workflow-001',
    startStateId: 'state-001',
    endStateId: 'state-002',
    startStateName: 'CREATED',
    endStateName: 'PROCESSING',
    automated: true,
    active: true,
    persisted: true,
    criteriaIds: ['criteria-001'],
    endProcessesIds: ['process-001'],
  },
  {
    id: 'trans-002',
    name: 'Ship Order',
    workflowId: 'workflow-001',
    startStateId: 'state-002',
    endStateId: 'state-003',
    startStateName: 'PROCESSING',
    endStateName: 'SHIPPED',
    automated: false,
    active: true,
    persisted: true,
    criteriaIds: ['criteria-002'],
    endProcessesIds: ['process-002'],
  },
  {
    id: 'trans-003',
    name: 'Complete Order',
    workflowId: 'workflow-001',
    startStateId: 'state-003',
    endStateId: 'state-004',
    startStateName: 'SHIPPED',
    endStateName: 'COMPLETED',
    automated: false,
    active: true,
    persisted: true,
    criteriaIds: ['criteria-003'],
    endProcessesIds: ['process-003'],
  },
  // User Onboarding workflow transitions
  {
    id: 'trans-004',
    name: 'Verify User',
    workflowId: 'workflow-002',
    startStateId: 'state-005',
    endStateId: 'state-006',
    startStateName: 'PENDING',
    endStateName: 'VERIFIED',
    automated: true,
    active: true,
    persisted: true,
    criteriaIds: ['criteria-004'],
    endProcessesIds: ['process-004'],
  },
  {
    id: 'trans-005',
    name: 'Activate User',
    workflowId: 'workflow-002',
    startStateId: 'state-006',
    endStateId: 'state-007',
    startStateName: 'VERIFIED',
    endStateName: 'ACTIVE',
    automated: false,
    active: true,
    persisted: true,
    criteriaIds: ['criteria-005'],
    endProcessesIds: ['process-005'],
  },
];

let mockStates: any[] = [
  // Order Processing workflow states
  { id: 'state-001', name: 'CREATED', workflowId: 'workflow-001', initial: true, terminal: false, persisted: true },
  { id: 'state-002', name: 'PROCESSING', workflowId: 'workflow-001', initial: false, terminal: false, persisted: true },
  { id: 'state-003', name: 'SHIPPED', workflowId: 'workflow-001', initial: false, terminal: false, persisted: true },
  { id: 'state-004', name: 'COMPLETED', workflowId: 'workflow-001', initial: false, terminal: true, persisted: true },
  // User Onboarding workflow states
  { id: 'state-005', name: 'PENDING', workflowId: 'workflow-002', initial: true, terminal: false, persisted: true },
  { id: 'state-006', name: 'VERIFIED', workflowId: 'workflow-002', initial: false, terminal: false, persisted: true },
  { id: 'state-007', name: 'ACTIVE', workflowId: 'workflow-002', initial: false, terminal: true, persisted: true },
];

// Load/save data from localStorage
function loadMockData() {
  try {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      mockWorkflows = data.workflows || mockWorkflows;
      mockCriteria = data.criteria || [];
      mockProcesses = data.processes || [];
      mockTransitions = data.transitions || [];
      mockStates = data.states || [];
      console.log('📦 Loaded statemachine mock data from localStorage');
    }
  } catch (error) {
    console.warn('Failed to load mock data:', error);
  }
}

function saveMockData() {
  try {
    const data = {
      workflows: mockWorkflows,
      criteria: mockCriteria,
      processes: mockProcesses,
      transitions: mockTransitions,
      states: mockStates,
    };
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Saved statemachine mock data to localStorage');
  } catch (error) {
    console.warn('Failed to save mock data:', error);
  }
}

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

/**
 * Enable mock API
 */
export function enableStatemachineMock() {
  if (requestInterceptorId !== null) return; // Already enabled

  console.log('🧪 Statemachine Mock API enabled');
  localStorage.setItem(MOCK_STORAGE_KEY, 'true');
  loadMockData();

  // Request interceptor - intercept ALL statemachine requests
  requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      const url = config.url || '';

      // Intercept statemachine endpoints and entity-info models-info endpoint
      if (url.includes('/platform-api/statemachine/') || url.includes('/platform-api/entity-info/fetch/models-info')) {
        console.log('🔄 Mock intercepting:', config.method?.toUpperCase(), url);

        // Mark this request as mocked so we can handle it in response interceptor
        config.headers = config.headers || {};
        (config.headers as any)['X-Mock-Intercepted'] = 'true';

        // Mute errors for mocked requests so error handler doesn't log them
        (config as any).muteErrors = true;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle both errors AND successful responses
  responseInterceptorId = axios.interceptors.response.use(
    (response) => {
      // If this was marked for mocking, intercept the response
      if (response.config.headers?.['X-Mock-Intercepted'] === 'true') {
        const url = response.config.url || '';
        const method = response.config.method?.toLowerCase();
        console.log('🎭 Mock handling success:', method?.toUpperCase(), url);

        // Return mock data instead of real response
        return handleMockResponse(response.config, url, method);
      }
      return response;
    },
    async (error) => {
      const config = error.config;
      const url = config?.url || '';

      // Also handle errors for statemachine and entity-info endpoints
      if (config?.headers?.['X-Mock-Intercepted'] === 'true' ||
          url.includes('/platform-api/statemachine/') ||
          url.includes('/platform-api/entity-info/fetch/models-info')) {
        const method = config?.method?.toLowerCase();
        console.log('🎭 Mock handling error:', method?.toUpperCase(), url, 'Status:', error.response?.status);

        return handleMockResponse(config, url, method);
      }

      // If not handled, reject with original error
      return Promise.reject(error);
    }
  );
}

// Helper function to handle mock responses
function handleMockResponse(config: any, url: string, method?: string): Promise<any> {
  console.log('🎯 handleMockResponse called:', method?.toUpperCase(), url);

  // GET /platform-api/entity-info/fetch/models-info (feature flag enabled)
  if (url.includes('/platform-api/entity-info/fetch/models-info')) {
    console.log('✅ Returning mock models-info');
    const stateEnabled = config.params?.stateEnabled === true || config.params?.stateEnabled === 'true';

    const allEntities = [
      { name: 'com.cyoda.tms.model.entities.User', value: 'com.cyoda.tms.model.entities.User', label: 'User', type: 'BUSINESS', stateEnabled: true },
      { name: 'com.cyoda.tms.model.entities.Order', value: 'com.cyoda.tms.model.entities.Order', label: 'Order', type: 'BUSINESS', stateEnabled: true },
      { name: 'com.cyoda.tms.model.entities.Product', value: 'com.cyoda.tms.model.entities.Product', label: 'Product', type: 'BUSINESS', stateEnabled: true },
      { name: 'com.cyoda.tms.model.entities.Invoice', value: 'com.cyoda.tms.model.entities.Invoice', label: 'Invoice', type: 'BUSINESS', stateEnabled: false },
    ];

    return Promise.resolve({
      data: stateEnabled ? allEntities.filter(e => e.stateEnabled) : allEntities,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/workflow-enabled-types
  if (url === '/platform-api/statemachine/workflow-enabled-types') {
    console.log('✅ Returning mock workflow-enabled-types');
    return Promise.resolve({
      data: [
        { entityClass: 'com.cyoda.tms.model.entities.User', workflowEnabled: true },
        { entityClass: 'com.cyoda.tms.model.entities.Order', workflowEnabled: true },
        { entityClass: 'com.cyoda.tms.model.entities.Product', workflowEnabled: true },
      ],
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/workflows
  if (url === '/platform-api/statemachine/workflows') {
    console.log('✅ Returning mock workflows:', mockWorkflows.length);
    return Promise.resolve({
      data: mockWorkflows,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/criteria
  if (url === '/platform-api/statemachine/criteria') {
    console.log('✅ Returning mock criteria:', mockCriteria.length);
    return Promise.resolve({
      data: mockCriteria,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/processes
  if (url === '/platform-api/statemachine/processes') {
    console.log('✅ Returning mock processes:', mockProcesses.length);
    return Promise.resolve({
      data: mockProcesses,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/persisted/workflows/:id - Get single workflow
  if (method === 'get' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+$/)) {
    const workflowId = url.split('/').pop();
    const workflow = mockWorkflows.find(w => w.id === workflowId);
    if (workflow) {
      console.log('✅ Returning mock workflow:', workflow.name);
      return Promise.resolve({
        data: workflow,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    } else {
      console.warn('⚠️ Workflow not found:', workflowId);
      return Promise.reject({
        response: {
          data: { message: 'Workflow not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config,
        },
        message: 'Workflow not found',
      });
    }
  }

  // GET /platform-api/statemachine/persisted/workflows/:id/states
  if (method === 'get' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/states$/)) {
    const workflowId = url.split('/').filter(p => p.startsWith('workflow-'))[0];
    const workflowStates = mockStates.filter(s => s.workflowId === workflowId);
    console.log('✅ Returning mock states:', workflowStates.length, 'for workflow:', workflowId);
    return Promise.resolve({
      data: workflowStates,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // GET /platform-api/statemachine/persisted/workflows/:id/transitions
  if (method === 'get' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/transitions$/)) {
    const workflowId = url.split('/').filter(p => p.startsWith('workflow-'))[0];
    const workflowTransitions = mockTransitions.filter(t => t.workflowId === workflowId);
    console.log('✅ Returning mock transitions:', workflowTransitions.length, 'for workflow:', workflowId);
    return Promise.resolve({
      data: workflowTransitions,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // POST /platform-api/statemachine/persisted/workflows/:id/transitions
  if (method === 'post' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/transitions$/)) {
    console.log('🎯 POST transition - config.data:', config.data);

    // Extract workflowId from URL
    const workflowId = url.split('/').filter(p => p.startsWith('workflow-'))[0];

    // Parse data if it's a string
    let transitionData = config.data;
    if (typeof transitionData === 'string') {
      try {
        transitionData = JSON.parse(transitionData);
      } catch (e) {
        console.error('Failed to parse transition data:', e);
      }
    }

    const newTransition = {
      id: `transition-${Date.now()}`,
      workflowId,
      ...transitionData,
      creationDate: Date.now(),
    };

    mockTransitions.push(newTransition);
    saveMockData();

    console.log('✅ Created transition:', newTransition.name || newTransition.id, newTransition);
    return Promise.resolve({
      data: newTransition,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // PUT /platform-api/statemachine/persisted/workflows/:id/transitions/:transitionId
  if (method === 'put' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/transitions\/[\w-]+$/)) {
    console.log('🎯 PUT transition - config.data:', config.data);

    // Parse data if it's a string
    let transitionData = config.data;
    if (typeof transitionData === 'string') {
      try {
        transitionData = JSON.parse(transitionData);
      } catch (e) {
        console.error('Failed to parse transition data:', e);
      }
    }

    console.log('✅ Updated transition:', transitionData.name || transitionData.id);
    return Promise.resolve({
      data: transitionData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // DELETE /platform-api/statemachine/persisted/workflows/:id/transitions/:transitionId
  if (method === 'delete' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/transitions\/[\w-]+$/)) {
    console.log('✅ Deleted transition');
    return Promise.resolve({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // POST /platform-api/statemachine/persisted/workflows/:id/transitions/:transitionId/states
  if (method === 'post' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/transitions\/[\w-]+\/states$/)) {
    console.log('🎯 POST transition state - config.data:', config.data);

    // Extract workflowId and transitionId from URL
    const urlParts = url.split('/');
    const workflowId = urlParts.find(p => p.startsWith('workflow-'));
    const transitionId = urlParts.find(p => p.startsWith('transition-'));

    // Parse data if it's a string
    let stateData = config.data;
    if (typeof stateData === 'string') {
      try {
        stateData = JSON.parse(stateData);
      } catch (e) {
        console.error('Failed to parse state data:', e);
      }
    }

    const newState = {
      id: `state-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      transitionId,
      ...stateData,
      creationDate: Date.now(),
    };

    mockStates.push(newState);
    saveMockData();

    console.log('✅ Created transition state:', newState.name || newState.id, newState);
    return Promise.resolve({
      data: newState,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // POST /platform-api/statemachine/persisted/workflows/:workflowId/transitions/:transitionId/states
  // Note: This endpoint is used to create a new state linked to a transition
  // The real Cyoda backend automatically updates the transition's endStateId
  if (method === 'post' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[^/]+\/transitions\/[^/]+\/states$/)) {
    console.log('🎯 POST state (via transition) - config.data:', config.data);

    // Extract transitionId from URL
    const transitionIdMatch = url.match(/\/transitions\/([^/]+)\/states$/);
    const transitionId = transitionIdMatch ? decodeURIComponent(transitionIdMatch[1]) : null;

    // Parse data if it's a string
    let stateData = config.data;
    if (typeof stateData === 'string') {
      try {
        stateData = JSON.parse(stateData);
      } catch (e) {
        console.error('Failed to parse state data:', e);
      }
    }

    const newState = {
      id: `state-${Date.now()}`,
      ...stateData,
      creationDate: Date.now(),
    };

    // Add to mockStates
    mockStates.push(newState);

    // Update the transition's endStateId (simulating real backend behavior)
    const transition = mockTransitions.find(t => t.id === transitionId);
    if (transition) {
      transition.endStateId = newState.id;
      console.log('✅ Updated transition endStateId:', transitionId, '→', newState.id);
    }

    saveMockData();

    console.log('✅ Created state via transition:', newState.name || newState.id, 'for transition:', transitionId);

    return Promise.resolve({
      data: newState,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // PUT /platform-api/statemachine/persisted/workflows/:id/states/:stateId
  if (method === 'put' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/states\/[\w-]+$/)) {
    console.log('🎯 PUT state - config.data:', config.data);

    // Parse data if it's a string
    let stateData = config.data;
    if (typeof stateData === 'string') {
      try {
        stateData = JSON.parse(stateData);
      } catch (e) {
        console.error('Failed to parse state data:', e);
      }
    }

    console.log('✅ Updated state:', stateData.name || stateData.id);
    return Promise.resolve({
      data: stateData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // DELETE /platform-api/statemachine/persisted/workflows/:id/states/:stateId
  if (method === 'delete' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+\/states\/[\w-]+$/)) {
    console.log('✅ Deleted state');
    return Promise.resolve({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // POST /platform-api/statemachine/persisted/workflows
  if (method === 'post' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows$/)) {
    console.log('🎯 POST workflow - config.data:', config.data);

    // Parse data if it's a string
    let workflowData = config.data;
    if (typeof workflowData === 'string') {
      try {
        workflowData = JSON.parse(workflowData);
      } catch (e) {
        console.error('Failed to parse workflow data:', e);
      }
    }

    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      ...workflowData,
      active: workflowData.active !== undefined ? workflowData.active : true,
      persisted: true,
      creationDate: Date.now(),
    };
    mockWorkflows.push(newWorkflow);
    saveMockData();
    console.log('✅ Created workflow:', newWorkflow.name, newWorkflow);
    return Promise.resolve({
      data: newWorkflow,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  }

  // PUT /platform-api/statemachine/persisted/workflows/:id
  if (method === 'put' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+$/)) {
    const workflowId = url.split('/').pop();
    const index = mockWorkflows.findIndex(w => w.id === workflowId);
    if (index !== -1) {
      mockWorkflows[index] = { ...mockWorkflows[index], ...config.data };
      saveMockData();
      console.log('✅ Updated workflow:', mockWorkflows[index].name);
      return Promise.resolve({
        data: mockWorkflows[index],
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
  }

  // DELETE /platform-api/statemachine/persisted/workflows/:id
  if (method === 'delete' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+$/)) {
    const workflowId = url.split('/').pop();
    const index = mockWorkflows.findIndex(w => w.id === workflowId);
    if (index !== -1) {
      const deleted = mockWorkflows.splice(index, 1)[0];
      saveMockData();
      console.log('✅ Deleted workflow:', deleted.name);
      return Promise.resolve({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }
  }

  // If no mock handler found, return 404
  console.warn('⚠️ No mock handler for:', method, url);
  return Promise.reject({
    response: {
      data: null,
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config,
    },
    message: 'Mock endpoint not found',
  });
}

/**
 * Disable mock API
 */
export function disableStatemachineMock() {
  if (requestInterceptorId !== null) {
    axios.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
  }
  if (responseInterceptorId !== null) {
    axios.interceptors.response.eject(responseInterceptorId);
    responseInterceptorId = null;
  }
  localStorage.setItem(MOCK_STORAGE_KEY, 'false');
  console.log('🔌 Statemachine Mock API disabled');
}

/**
 * Reset mock data to defaults
 */
export function resetStatemachineMockData() {
  mockWorkflows = [
    {
      id: 'workflow-001',
      name: 'Order Processing',
      entityClassName: 'com.cyoda.tms.model.entities.Order',
      description: 'Workflow for processing customer orders',
      active: true,
      persisted: true,
      creationDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
    {
      id: 'workflow-002',
      name: 'User Onboarding',
      entityClassName: 'com.cyoda.tms.model.entities.User',
      description: 'Workflow for onboarding new users',
      active: true,
      persisted: true,
      creationDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
    },
  ];
  mockCriteria = [];
  mockProcesses = [];
  saveMockData();
  console.log('🔄 Reset statemachine mock data');
}

// Make functions available globally FIRST
if (typeof window !== 'undefined') {
  (window as any).enableStatemachineMock = enableStatemachineMock;
  (window as any).disableStatemachineMock = disableStatemachineMock;
  (window as any).resetStatemachineMockData = resetStatemachineMockData;

  // Log that mock API is available
  console.log('🎭 Statemachine Mock API loaded. Use window.enableStatemachineMock() to enable.');
}

// Auto-enable ONLY if previously enabled (not automatically in dev mode)
// This prevents the mock from interfering with real backend authentication
if (isMockEnabled()) {
  console.log('🔄 Auto-enabling mock API (was previously enabled)');
  enableStatemachineMock();
}
// REMOVED: Auto-enable in development mode
// The mock should only be enabled manually to avoid interfering with real backend

