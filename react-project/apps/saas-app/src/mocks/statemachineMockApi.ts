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

let mockCriteria: any[] = [];
let mockProcesses: any[] = [];

// Load/save data from localStorage
function loadMockData() {
  try {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      mockWorkflows = data.workflows || mockWorkflows;
      mockCriteria = data.criteria || [];
      mockProcesses = data.processes || [];
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

  // Request interceptor
  requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      const url = config.url || '';

      // Intercept statemachine endpoints
      if (url.includes('/platform-api/statemachine/')) {
        console.log('🔄 Mock intercepting:', config.method?.toUpperCase(), url);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;
      const url = config?.url || '';

      // Only intercept 404 errors for statemachine endpoints
      if (error.response?.status === 404 && url.includes('/platform-api/statemachine/')) {
        console.log('🎭 Mock handling 404:', config.method?.toUpperCase(), url);

        // GET /platform-api/statemachine/workflow-enabled-types
        if (url === '/platform-api/statemachine/workflow-enabled-types') {
          return {
            data: [
              { entityClass: 'com.cyoda.tms.model.entities.User', workflowEnabled: true },
              { entityClass: 'com.cyoda.tms.model.entities.Order', workflowEnabled: true },
              { entityClass: 'com.cyoda.tms.model.entities.Product', workflowEnabled: true },
            ],
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }

        // GET /platform-api/statemachine/workflows
        if (url === '/platform-api/statemachine/workflows') {
          return {
            data: mockWorkflows,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }

        // GET /platform-api/statemachine/criteria
        if (url === '/platform-api/statemachine/criteria') {
          return {
            data: mockCriteria,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }

        // GET /platform-api/statemachine/processes
        if (url === '/platform-api/statemachine/processes') {
          return {
            data: mockProcesses,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }

        // POST /platform-api/statemachine/persisted/workflows
        if (config.method === 'post' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows$/)) {
          const newWorkflow = {
            id: `workflow-${Date.now()}`,
            ...config.data,
            creationDate: Date.now(),
          };
          mockWorkflows.push(newWorkflow);
          saveMockData();
          console.log('✅ Created workflow:', newWorkflow.name);
          return {
            data: newWorkflow,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          };
        }

        // PUT /platform-api/statemachine/persisted/workflows/:id
        if (config.method === 'put' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+$/)) {
          const workflowId = url.split('/').pop();
          const index = mockWorkflows.findIndex(w => w.id === workflowId);
          if (index !== -1) {
            mockWorkflows[index] = { ...mockWorkflows[index], ...config.data };
            saveMockData();
            console.log('✅ Updated workflow:', mockWorkflows[index].name);
            return {
              data: mockWorkflows[index],
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            };
          }
        }

        // DELETE /platform-api/statemachine/persisted/workflows/:id
        if (config.method === 'delete' && url.match(/\/platform-api\/statemachine\/(persisted|transient)\/workflows\/[\w-]+$/)) {
          const workflowId = url.split('/').pop();
          const index = mockWorkflows.findIndex(w => w.id === workflowId);
          if (index !== -1) {
            const deleted = mockWorkflows.splice(index, 1)[0];
            saveMockData();
            console.log('✅ Deleted workflow:', deleted.name);
            return {
              data: { success: true },
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            };
          }
        }
      }

      // If not handled, reject with original error
      return Promise.reject(error);
    }
  );
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

// Auto-enable if previously enabled
if (isMockEnabled()) {
  enableStatemachineMock();
}

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).enableStatemachineMock = enableStatemachineMock;
  (window as any).disableStatemachineMock = disableStatemachineMock;
  (window as any).resetStatemachineMockData = resetStatemachineMockData;
}

