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
    active: true,
    persisted: true,
    creationDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    states: ['CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    initialState: 'CREATED',
  },
  {
    id: 'workflow-002',
    name: 'Customer Onboarding',
    entityClassName: 'com.example.Customer',
    description: 'Customer registration and verification workflow',
    enabled: true,
    active: true,
    persisted: true,
    creationDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    states: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED'],
    initialState: 'PENDING',
  },
  {
    id: 'workflow-003',
    name: 'Payment Processing',
    entityClassName: 'com.example.Payment',
    description: 'Payment authorization and settlement workflow',
    enabled: false,
    active: false,
    persisted: false,
    creationDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    states: ['INITIATED', 'AUTHORIZED', 'CAPTURED', 'SETTLED', 'FAILED'],
    initialState: 'INITIATED',
  },
];

// Mock states data
const mockStates = [
  // Workflow 1: Order Processing states
  { id: 'state-001', name: 'CREATED', workflowId: 'workflow-001', isInitial: true, isFinal: false },
  { id: 'state-002', name: 'PROCESSING', workflowId: 'workflow-001', isInitial: false, isFinal: false },
  { id: 'state-003', name: 'SHIPPED', workflowId: 'workflow-001', isInitial: false, isFinal: false },
  { id: 'state-004', name: 'DELIVERED', workflowId: 'workflow-001', isInitial: false, isFinal: true },
  { id: 'state-005', name: 'CANCELLED', workflowId: 'workflow-001', isInitial: false, isFinal: true },
  // Workflow 2: Customer Onboarding states
  { id: 'state-006', name: 'PENDING', workflowId: 'workflow-002', isInitial: true, isFinal: false },
  { id: 'state-007', name: 'VERIFIED', workflowId: 'workflow-002', isInitial: false, isFinal: false },
  { id: 'state-008', name: 'ACTIVE', workflowId: 'workflow-002', isInitial: false, isFinal: false },
  { id: 'state-009', name: 'SUSPENDED', workflowId: 'workflow-002', isInitial: false, isFinal: true },
  // Workflow 3: Payment Processing states
  { id: 'state-010', name: 'INITIATED', workflowId: 'workflow-003', isInitial: true, isFinal: false },
  { id: 'state-011', name: 'AUTHORIZED', workflowId: 'workflow-003', isInitial: false, isFinal: false },
  { id: 'state-012', name: 'CAPTURED', workflowId: 'workflow-003', isInitial: false, isFinal: false },
  { id: 'state-013', name: 'SETTLED', workflowId: 'workflow-003', isInitial: false, isFinal: true },
  { id: 'state-014', name: 'FAILED', workflowId: 'workflow-003', isInitial: false, isFinal: true },
];

// Mock transitions data
const mockTransitions = [
  {
    id: 'trans-001',
    name: 'Start Processing',
    startStateId: 'state-001',
    endStateId: 'state-002',
    startStateName: 'CREATED',
    endStateName: 'PROCESSING',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: ['criteria-001'],
    endProcessesIds: ['process-001'],
  },
  {
    id: 'trans-002',
    name: 'Ship Order',
    startStateId: 'state-002',
    endStateId: 'state-003',
    startStateName: 'PROCESSING',
    endStateName: 'SHIPPED',
    automated: false,
    active: true,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: ['criteria-002'],
    endProcessesIds: ['process-002'],
  },
  {
    id: 'trans-003',
    name: 'Deliver Order',
    startStateId: 'state-003',
    endStateId: 'state-004',
    startStateName: 'SHIPPED',
    endStateName: 'DELIVERED',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: [],
    endProcessesIds: ['process-003'],
  },
  {
    id: 'trans-004',
    name: 'Cancel Order',
    startStateId: 'state-001',
    endStateId: 'state-005',
    startStateName: 'CREATED',
    endStateName: 'CANCELLED',
    automated: false,
    active: true,
    persisted: true,
    workflowId: 'workflow-001',
    criteriaIds: [],
    endProcessesIds: [],
  },
  // Workflow 2: Customer Onboarding transitions
  {
    id: 'trans-005',
    name: 'Verify Customer',
    startStateId: 'state-006',
    endStateId: 'state-007',
    startStateName: 'PENDING',
    endStateName: 'VERIFIED',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-002',
    criteriaIds: [],
    endProcessesIds: [],
  },
  {
    id: 'trans-006',
    name: 'Activate Account',
    startStateId: 'state-007',
    endStateId: 'state-008',
    startStateName: 'VERIFIED',
    endStateName: 'ACTIVE',
    automated: false,
    active: true,
    persisted: true,
    workflowId: 'workflow-002',
    criteriaIds: [],
    endProcessesIds: [],
  },
  {
    id: 'trans-007',
    name: 'Suspend Account',
    startStateId: 'state-008',
    endStateId: 'state-009',
    startStateName: 'ACTIVE',
    endStateName: 'SUSPENDED',
    automated: false,
    active: true,
    persisted: true,
    workflowId: 'workflow-002',
    criteriaIds: [],
    endProcessesIds: [],
  },
  // Workflow 3: Payment Processing transitions
  {
    id: 'trans-008',
    name: 'Authorize Payment',
    startStateId: 'state-010',
    endStateId: 'state-011',
    startStateName: 'INITIATED',
    endStateName: 'AUTHORIZED',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-003',
    criteriaIds: [],
    endProcessesIds: [],
  },
  {
    id: 'trans-009',
    name: 'Capture Payment',
    startStateId: 'state-011',
    endStateId: 'state-012',
    startStateName: 'AUTHORIZED',
    endStateName: 'CAPTURED',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-003',
    criteriaIds: [],
    endProcessesIds: [],
  },
  {
    id: 'trans-010',
    name: 'Settle Payment',
    startStateId: 'state-012',
    endStateId: 'state-013',
    startStateName: 'CAPTURED',
    endStateName: 'SETTLED',
    automated: true,
    active: true,
    persisted: true,
    workflowId: 'workflow-003',
    criteriaIds: [],
    endProcessesIds: [],
  },
  {
    id: 'trans-011',
    name: 'Fail Payment',
    startStateId: 'state-010',
    endStateId: 'state-014',
    startStateName: 'INITIATED',
    endStateName: 'FAILED',
    automated: false,
    active: true,
    persisted: true,
    workflowId: 'workflow-003',
    criteriaIds: [],
    endProcessesIds: [],
  },
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

// Mock entity classes with type information
const mockEntityClasses = [
  { name: 'com.example.Order', type: 'BUSINESS' },
  { name: 'com.example.Customer', type: 'BUSINESS' },
  { name: 'com.example.Payment', type: 'BUSINESS' },
  { name: 'com.example.Product', type: 'BUSINESS' },
  { name: 'com.example.Shipment', type: 'PERSISTENCE' },
  { name: 'com.example.Invoice', type: 'PERSISTENCE' },
  { name: 'com.example.Ticket', type: 'BUSINESS' },
  { name: 'com.example.Task', type: 'BUSINESS' },
  { name: 'com.example.Document', type: 'PERSISTENCE' },
  { name: 'com.example.Contract', type: 'BUSINESS' },
  { name: 'com.example.Subscription', type: 'PERSISTENCE' },
  { name: 'com.example.Transaction', type: 'BUSINESS' },
  { name: 'com.test.TestEntity', type: 'BUSINESS' },
  { name: 'com.test.SampleWorkflow', type: 'PERSISTENCE' },
  { name: 'com.test.DemoProcess', type: 'BUSINESS' },
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

    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/[\w-]+$/)) {
      const workflowId = url.split('/').pop();
      const workflow = mockWorkflows.find(w => w.id === workflowId);
      return { data: workflow || null, status: workflow ? 200 : 404 };
    }

    // State endpoints
    if (url === '/platform-api/statemachine/states') {
      return { data: mockStates, status: 200 };
    }

    // Get states list for a workflow
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/states$/)) {
      const parts = url.split('/');
      const workflowId = parts[parts.length - 2];
      const filtered = mockStates.filter(s => s.workflowId === workflowId);
      return { data: filtered, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/states\/[\w-]+$/)) {
      const stateId = url.split('/').pop();
      const state = mockStates.find(s => s.id === stateId);
      return { data: state || null, status: state ? 200 : 404 };
    }

    // Transition endpoints
    if (url === '/platform-api/statemachine/transitions') {
      return { data: mockTransitions, status: 200 };
    }

    // Get transitions list for a workflow
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/transitions$/)) {
      const parts = url.split('/');
      const workflowId = parts[parts.length - 2];
      const filtered = mockTransitions.filter(t => t.workflowId === workflowId);
      return { data: filtered, status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/transitions\/[\w-]+$/)) {
      const transitionId = url.split('/').pop();
      const transition = mockTransitions.find(t => t.id === transitionId);
      return { data: transition || null, status: transition ? 200 : 404 };
    }

    // Criteria endpoints
    if (url === '/platform-api/statemachine/criteria') {
      const entityClassName = config?.params?.entityClassName;
      const filtered = entityClassName
        ? mockCriteria.filter(c => c.entityClassName === entityClassName)
        : mockCriteria;
      return { data: filtered, status: 200 };
    }

    if (url === '/platform-api/statemachine/criteriacheckers') {
      return { data: ['PaymentChecker', 'StockChecker', 'AddressChecker'], status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/criteria\/[\w-]+$/)) {
      const criteriaId = url.split('/').pop();
      const criteria = mockCriteria.find(c => c.id === criteriaId);
      return { data: criteria || null, status: criteria ? 200 : 404 };
    }

    // Process endpoints
    if (url === '/platform-api/statemachine/processes') {
      const entityClassName = config?.params?.entityClassName;
      const filtered = entityClassName
        ? mockProcesses.filter(p => p.entityClassName === entityClassName)
        : mockProcesses;
      return { data: filtered, status: 200 };
    }

    if (url === '/platform-api/statemachine/processors') {
      return { data: ['EmailProcessor', 'InventoryProcessor', 'InvoiceProcessor'], status: 200 };
    }

    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/processes\/[\w-]+$/)) {
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

    // Entity endpoints
    if (url.match(/\/platform-api\/entity\/([\w.]+)\/([\w-]+)$/)) {
      const parts = url.split('/');
      const entityId = parts.pop();
      const entityClass = parts.pop();

      // Return mock entity data
      return {
        data: [
          { type: 'LEAF', columnName: 'id', value: entityId, presented: true },
          { type: 'LEAF', columnName: 'entityClass', value: entityClass, presented: true },
          { type: 'LEAF', columnName: 'state', value: 'PROCESSING', presented: true },
          { type: 'LEAF', columnName: 'createdDate', value: Date.now() - 86400000, presented: true },
          { type: 'LEAF', columnName: 'updatedDate', value: Date.now(), presented: true },
          { type: 'LEAF', columnName: 'description', value: 'Sample entity data', presented: true },
        ],
        status: 200
      };
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
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows$/)) {
      const newWorkflow = {
        id: data.id || `workflow-${Date.now()}`,
        name: data.name,
        entityClassName: data.entityClassName,
        description: data.description || '',
        documentLink: data.documentLink || '',
        enabled: data.enabled !== undefined ? data.enabled : true,
        active: data.active !== undefined ? data.active : true,
        persisted: data.persisted !== undefined ? data.persisted : true,
        creationDate: Date.now(),
        useDecisionTree: data.useDecisionTree || false,
        criteriaIds: data.criteriaIds || [],
        initialState: data.initialState || '',
      };
      mockWorkflows.push(newWorkflow);
      return { data: newWorkflow, status: 200 };
    }

    // Create state
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/transitions\/([\w-]+)\/states$/)) {
      const parts = url.split('/');
      const transitionId = parts[parts.length - 2];
      const workflowId = parts[parts.length - 4];
      const newState = {
        ...data,
        id: data.id || `state-${Date.now()}`,
        workflowId, // Ensure workflowId is set
        transitionId, // Store the transition that created this state
      };
      mockStates.push(newState);
      return { data: newState, status: 200 };
    }

    // Create transition
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/transitions$/)) {
      const parts = url.split('/');
      const workflowId = parts[parts.length - 2];

      // Look up state names from mockStates
      const startState = mockStates.find(s => s.id === data.startStateId);
      const endState = mockStates.find(s => s.id === data.endStateId);

      const newTransition = {
        ...data,
        id: data.id || `trans-${Date.now()}`,
        workflowId, // Ensure workflowId is set
        startStateName: startState?.name || data.startStateName || '',
        endStateName: endState?.name || data.endStateName || '',
      };
      mockTransitions.push(newTransition);
      return { data: newTransition, status: 200 };
    }

    // Create criteria
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/criteria$/)) {
      const newCriteria = {
        ...data,
        id: data.id || `criteria-${Date.now()}`,
      };
      mockCriteria.push(newCriteria);
      return { data: newCriteria, status: 200 };
    }

    // Create process
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/processes$/)) {
      const newProcess = {
        ...data,
        id: data.id || `process-${Date.now()}`,
      };
      mockProcesses.push(newProcess);
      return { data: newProcess, status: 200 };
    }

    // Copy workflow
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/copy\/([\w-]+)$/)) {
      const workflowId = url.split('/').pop();
      const workflow = mockWorkflows.find(w => w.id === workflowId);
      if (workflow) {
        const newId = `workflow-copy-${Date.now()}`;
        const newWorkflow = {
          ...workflow,
          id: newId,
          name: `${workflow.name} (Copy)`,
        };
        mockWorkflows.push(newWorkflow);
        return { data: newId, status: 200 };
      }
    }

    // Copy transition
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/transitions\/copy\/([\w-]+)$/)) {
      const parts = url.split('/');
      const transitionId = parts.pop();
      const transition = mockTransitions.find(t => t.id === transitionId);
      if (transition) {
        const newId = `trans-copy-${Date.now()}`;
        const newTransition = {
          ...transition,
          id: newId,
          name: `${transition.name} (Copy)`,
        };
        mockTransitions.push(newTransition);
        return { data: newId, status: 200 };
      }
    }

    // Copy criteria
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/criteria\/copy\/([\w-]+)$/)) {
      const criteriaId = url.split('/').pop();
      const criteria = mockCriteria.find(c => c.id === criteriaId);
      if (criteria) {
        const newId = `criteria-copy-${Date.now()}`;
        const newCriteria = {
          ...criteria,
          id: newId,
          name: `${criteria.name} (Copy)`,
        };
        mockCriteria.push(newCriteria);
        return { data: newId, status: 200 };
      }
    }

    // Copy process
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/processes\/copy\/([\w-]+)$/)) {
      const processId = url.split('/').pop();
      const process = mockProcesses.find(p => p.id === processId);
      if (process) {
        const newId = `process-copy-${Date.now()}`;
        const newProcess = {
          ...process,
          id: newId,
          name: `${process.name} (Copy)`,
        };
        mockProcesses.push(newProcess);
        return { data: newId, status: 200 };
      }
    }

    return { data, status: 200 };
  },

  put: async (url: string, data: any) => {
    console.log('Mock PUT:', url, data);

    // Update workflow
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)$/)) {
      const workflowId = url.split('/').pop();
      const index = mockWorkflows.findIndex(w => w.id === workflowId);
      if (index !== -1) {
        mockWorkflows[index] = {
          ...mockWorkflows[index],
          ...data,
          id: workflowId, // Preserve the ID
        };
        return { data: mockWorkflows[index], status: 200 };
      }
    }

    // Update state
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/states\/([\w-]+)$/)) {
      const parts = url.split('/');
      const stateId = parts.pop();
      const index = mockStates.findIndex(s => s.id === stateId);
      if (index !== -1) {
        mockStates[index] = {
          ...mockStates[index],
          ...data,
          id: stateId,
        };
        return { data: mockStates[index], status: 200 };
      }
    }

    // Update transition
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/workflows\/([\w-]+)\/transitions\/([\w-]+)$/)) {
      const parts = url.split('/');
      const transitionId = parts.pop();
      const index = mockTransitions.findIndex(t => t.id === transitionId);
      if (index !== -1) {
        // Look up state names from mockStates if state IDs are being updated
        const startStateId = data.startStateId || mockTransitions[index].startStateId;
        const endStateId = data.endStateId || mockTransitions[index].endStateId;
        const startState = mockStates.find(s => s.id === startStateId);
        const endState = mockStates.find(s => s.id === endStateId);

        mockTransitions[index] = {
          ...mockTransitions[index],
          ...data,
          id: transitionId,
          startStateName: startState?.name || data.startStateName || mockTransitions[index].startStateName || '',
          endStateName: endState?.name || data.endStateName || mockTransitions[index].endStateName || '',
        };
        return { data: mockTransitions[index], status: 200 };
      }
    }

    // Update criteria
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/criteria\/([\w-]+)$/)) {
      const criteriaId = url.split('/').pop();
      const index = mockCriteria.findIndex(c => c.id === criteriaId);
      if (index !== -1) {
        mockCriteria[index] = {
          ...mockCriteria[index],
          ...data,
          id: criteriaId,
        };
        return { data: mockCriteria[index], status: 200 };
      }
    }

    // Update process
    if (url.match(/\/platform-api\/statemachine\/(draft|published|persisted|transient)\/processes\/([\w-]+)$/)) {
      const processId = url.split('/').pop();
      const index = mockProcesses.findIndex(p => p.id === processId);
      if (index !== -1) {
        mockProcesses[index] = {
          ...mockProcesses[index],
          ...data,
          id: processId,
        };
        return { data: mockProcesses[index], status: 200 };
      }
    }

    return { data, status: 200 };
  },

  delete: async (url: string) => {
    console.log('Mock DELETE:', url);
    return { data: null, status: 200 };
  },
};

// Mock useEntity hook
export const useEntity = (
  entityClassName: string,
  entityId: string,
  _version?: string,
  options?: { enabled?: boolean }
) => {
  // Return mock entity data
  if (options?.enabled === false || !entityClassName || !entityId) {
    return {
      data: null,
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve(),
    };
  }

  return {
    data: [
      { type: 'LEAF', columnName: 'id', value: entityId, presented: true },
      { type: 'LEAF', columnName: 'entityClass', value: entityClassName, presented: true },
      { type: 'LEAF', columnName: 'state', value: 'PROCESSING', presented: true },
      { type: 'LEAF', columnName: 'createdDate', value: Date.now() - 86400000, presented: true },
      { type: 'LEAF', columnName: 'updatedDate', value: Date.now(), presented: true },
      { type: 'LEAF', columnName: 'description', value: 'Sample entity data', presented: true },
    ],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

// Export all axios instances (they all use the same mock for now)
export { axios };
export const axiosPublic = axios;
export const axiosProcessing = axios;
export const axiosGrafana = axios;
export const axiosAI = axios;
export default axios;

