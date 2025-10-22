/**
 * Mock axios for statemachine-react development
 * This file mocks the @cyoda/http-api-react package to provide test data
 */

// Mock workflows data
const mockWorkflows = [
  {
    id: 'workflow-001',
    name: 'Order Processing Workflow',
    entityClassName: 'com.example.Order',
    description: 'Handles order lifecycle from creation to completion',
    enabled: true,
    states: ['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    initialState: 'CREATED',
  },
  {
    id: 'workflow-002',
    name: 'Customer Onboarding',
    entityClassName: 'com.example.Customer',
    description: 'Customer registration and verification workflow',
    enabled: true,
    states: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED'],
    initialState: 'PENDING',
  },
  {
    id: 'workflow-003',
    name: 'Payment Processing',
    entityClassName: 'com.example.Payment',
    description: 'Payment authorization and settlement workflow',
    enabled: true,
    states: ['INITIATED', 'AUTHORIZED', 'CAPTURED', 'SETTLED', 'FAILED'],
    initialState: 'INITIATED',
  },
];

// Mock states data
const mockStates = [
  { id: 'state-001', name: 'CREATED', workflowId: 'workflow-001', isInitial: true, isFinal: false },
  { id: 'state-002', name: 'PROCESSING', workflowId: 'workflow-001', isInitial: false, isFinal: false },
  { id: 'state-003', name: 'SHIPPED', workflowId: 'workflow-001', isInitial: false, isFinal: false },
  { id: 'state-004', name: 'DELIVERED', workflowId: 'workflow-001', isInitial: false, isFinal: true },
  { id: 'state-005', name: 'CANCELLED', workflowId: 'workflow-001', isInitial: false, isFinal: true },
];

// Mock transitions data
const mockTransitions = [
  { id: 'trans-001', name: 'Start Processing', fromState: 'CREATED', toState: 'PROCESSING', workflowId: 'workflow-001' },
  { id: 'trans-002', name: 'Ship Order', fromState: 'PROCESSING', toState: 'SHIPPED', workflowId: 'workflow-001' },
  { id: 'trans-003', name: 'Deliver Order', fromState: 'SHIPPED', toState: 'DELIVERED', workflowId: 'workflow-001' },
  { id: 'trans-004', name: 'Cancel Order', fromState: 'CREATED', toState: 'CANCELLED', workflowId: 'workflow-001' },
];

// Mock criteria data
const mockCriteria = [
  { id: 'criteria-001', name: 'Payment Verified', description: 'Check if payment is verified', entityClassName: 'com.example.Order' },
  { id: 'criteria-002', name: 'Stock Available', description: 'Check if items are in stock', entityClassName: 'com.example.Order' },
  { id: 'criteria-003', name: 'Address Valid', description: 'Validate shipping address', entityClassName: 'com.example.Order' },
];

// Mock processes data
const mockProcesses = [
  { id: 'process-001', name: 'Send Confirmation Email', description: 'Send order confirmation to customer', entityClassName: 'com.example.Order' },
  { id: 'process-002', name: 'Update Inventory', description: 'Decrease stock levels', entityClassName: 'com.example.Order' },
  { id: 'process-003', name: 'Generate Invoice', description: 'Create invoice document', entityClassName: 'com.example.Order' },
];

// Mock instances data
const mockInstances = [
  { id: 'inst-001', workflowId: 'workflow-001', currentState: 'PROCESSING', entityId: 'order-12345', createdAt: '2024-01-15T10:30:00Z' },
  { id: 'inst-002', workflowId: 'workflow-001', currentState: 'SHIPPED', entityId: 'order-12346', createdAt: '2024-01-15T11:00:00Z' },
  { id: 'inst-003', workflowId: 'workflow-001', currentState: 'DELIVERED', entityId: 'order-12347', createdAt: '2024-01-14T09:15:00Z' },
];

// Mock entity classes
const mockEntityClasses = [
  'com.example.Order',
  'com.example.Customer',
  'com.example.Payment',
  'com.example.Product',
  'com.example.Shipment',
];

const axios = {
  get: async (url: string, config?: any) => {
    console.log('Mock GET:', url, config?.params);

    // Workflow endpoints
    if (url === '/platform-api/statemachine/workflow-enabled-types') {
      return { data: mockEntityClasses, status: 200 };
    }

    if (url === '/platform-api/statemachine/workflows') {
      const entityClassName = config?.params?.entityClassName;
      const filtered = entityClassName 
        ? mockWorkflows.filter(w => w.entityClassName === entityClassName)
        : mockWorkflows;
      return { data: filtered, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/workflows\/[\w-]+$/)) {
      const workflowId = url.split('/').pop();
      const workflow = mockWorkflows.find(w => w.id === workflowId);
      return { data: workflow || null, status: workflow ? 200 : 404 };
    }

    // State endpoints
    if (url === '/platform-api/statemachine/states') {
      return { data: mockStates, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/states\/[\w-]+$/)) {
      const stateId = url.split('/').pop();
      const state = mockStates.find(s => s.id === stateId);
      return { data: state || null, status: state ? 200 : 404 };
    }

    // Transition endpoints
    if (url === '/platform-api/statemachine/transitions') {
      return { data: mockTransitions, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/transitions\/[\w-]+$/)) {
      const transitionId = url.split('/').pop();
      const transition = mockTransitions.find(t => t.id === transitionId);
      return { data: transition || null, status: transition ? 200 : 404 };
    }

    // Criteria endpoints
    if (url === '/platform-api/statemachine/criteria') {
      return { data: mockCriteria, status: 200 };
    }

    if (url === '/platform-api/statemachine/criteriacheckers') {
      return { data: ['PaymentChecker', 'StockChecker', 'AddressChecker'], status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/criteria\/[\w-]+$/)) {
      const criteriaId = url.split('/').pop();
      const criteria = mockCriteria.find(c => c.id === criteriaId);
      return { data: criteria || null, status: criteria ? 200 : 404 };
    }

    // Process endpoints
    if (url === '/platform-api/statemachine/processes') {
      return { data: mockProcesses, status: 200 };
    }

    if (url === '/platform-api/statemachine/processors') {
      return { data: ['EmailProcessor', 'InventoryProcessor', 'InvoiceProcessor'], status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/processes\/[\w-]+$/)) {
      const processId = url.split('/').pop();
      const process = mockProcesses.find(p => p.id === processId);
      return { data: process || null, status: process ? 200 : 404 };
    }

    // Instance endpoints
    if (url === '/platform-api/statemachine/instances') {
      return { data: mockInstances, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/instances\/[\w-]+$/)) {
      const instanceId = url.split('/').pop();
      const instance = mockInstances.find(i => i.id === instanceId);
      return { data: instance || null, status: instance ? 200 : 404 };
    }

    // Entity info endpoints
    if (url.includes('/platform-api/entity-info/entity-parents-interfaces')) {
      return { data: { parents: [], interfaces: [] }, status: 200 };
    }

    // Default response
    console.warn('Mock API: No handler for URL:', url);
    return { data: [], status: 200 };
  },

  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data);

    // Create workflow
    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/workflows$/)) {
      const newWorkflow = {
        ...data,
        id: data.id || `workflow-${Date.now()}`,
      };
      mockWorkflows.push(newWorkflow);
      return { data: newWorkflow, status: 200 };
    }

    // Create state
    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/states$/)) {
      const newState = {
        ...data,
        id: data.id || `state-${Date.now()}`,
      };
      mockStates.push(newState);
      return { data: newState, status: 200 };
    }

    // Create transition
    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/transitions$/)) {
      const newTransition = {
        ...data,
        id: data.id || `trans-${Date.now()}`,
      };
      mockTransitions.push(newTransition);
      return { data: newTransition, status: 200 };
    }

    // Create criteria
    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/criteria$/)) {
      const newCriteria = {
        ...data,
        id: data.id || `criteria-${Date.now()}`,
      };
      mockCriteria.push(newCriteria);
      return { data: newCriteria, status: 200 };
    }

    // Create process
    if (url.match(/\/platform-api\/statemachine\/(draft|published)\/processes$/)) {
      const newProcess = {
        ...data,
        id: data.id || `process-${Date.now()}`,
      };
      mockProcesses.push(newProcess);
      return { data: newProcess, status: 200 };
    }

    return { data, status: 200 };
  },

  put: async (url: string, data: any) => {
    console.log('Mock PUT:', url, data);
    return { data, status: 200 };
  },

  delete: async (url: string) => {
    console.log('Mock DELETE:', url);
    return { data: null, status: 200 };
  },
};

// Export all axios instances (they all use the same mock for now)
export { axios };
export const axiosPublic = axios;
export const axiosProcessing = axios;
export const axiosGrafana = axios;
export const axiosAI = axios;
export default axios;

