/**
 * State Machine Store
 * Zustand store for state machine state management
 * Migrated from: .old_project/packages/statemachine/src/stores/statemachine.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axios, HelperFeatureFlags } from '@cyoda/http-api-react';
import type {
  Workflow,
  WorkflowForm,
  State,
  StateForm,
  Transition,
  TransitionForm,
  Criteria,
  CriteriaForm,
  Process,
  ProcessForm,
  InstancesRequest,
  InstancesResponse,
  PersistedType,
} from '../types';

interface StatemachineState {
  // State
  selectedWorkflow: Workflow | null;
  selectedEntityClassName: string | null;
  
  // Actions
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  setSelectedEntityClassName: (entityClassName: string | null) => void;
  
  // API Methods - Workflows
  getWorkflowEnabledTypes: () => Promise<any>;
  getAllWorkflowsList: (entityClassName?: string) => Promise<any>;
  postWorkflow: (form: WorkflowForm) => Promise<any>;
  putWorkflow: (form: WorkflowForm & { id: string }) => Promise<any>;
  deleteWorkflow: (workflowId: string) => Promise<any>;
  copyWorkflow: (persistedType: PersistedType, workflowId: string) => Promise<any>;
  getWorkflow: (persistedType: PersistedType, workflowId: string) => Promise<any>;
  
  // API Methods - States
  getStatesList: (persistedType: PersistedType, workflowId: string) => Promise<any>;
  getState: (persistedType: PersistedType, workflowId: string, stateId: string) => Promise<any>;
  postState: (persistedType: PersistedType, workflowId: string, transitionId: string, form: StateForm) => Promise<any>;
  putState: (persistedType: PersistedType, workflowId: string, stateId: string, form: StateForm) => Promise<any>;
  deleteState: (persistedType: PersistedType, workflowId: string, stateId: string) => Promise<any>;
  
  // API Methods - Transitions
  getTransitionsList: (persistedType: PersistedType, workflowId: string) => Promise<any>;
  getTransition: (persistedType: PersistedType, workflowId: string, transitionId: string) => Promise<any>;
  postTransition: (persistedType: PersistedType, workflowId: string, form: TransitionForm) => Promise<any>;
  putTransition: (persistedType: PersistedType, workflowId: string, transitionId: string, form: TransitionForm) => Promise<any>;
  deleteTransition: (persistedType: PersistedType, workflowId: string, transitionId: string) => Promise<any>;
  copyTransition: (persistedType: PersistedType, workflowId: string, transitionId: string) => Promise<any>;
  
  // API Methods - Criteria
  getCriteriaList: (entityClassName?: string) => Promise<any>;
  getCriteria: (persistedType: PersistedType, criteriaId: string, entityClassName?: string) => Promise<any>;
  getCriteriaDefs: (params: { rootClass: string; colPaths: string[] }) => Promise<any>;
  postCriteria: (persistedType: PersistedType, form: CriteriaForm) => Promise<any>;
  putCriteria: (persistedType: PersistedType, criteriaId: string, form: CriteriaForm) => Promise<any>;
  deleteCriteria: (persistedType: PersistedType, criteriaId: string) => Promise<any>;
  copyCriteria: (persistedType: PersistedType, criteriaId: string) => Promise<any>;
  getCriteriacheckers: (entityClassName?: string) => Promise<any>;
  
  // API Methods - Processes
  getProcessesList: (entityClassName?: string) => Promise<any>;
  getProcessorsList: () => Promise<any>;
  getProcesses: (persistedType: PersistedType, processId: string, entityClassName?: string) => Promise<any>;
  postProcesses: (persistedType: PersistedType, form: ProcessForm) => Promise<any>;
  postProcessesTemplate: (persistedType: PersistedType, form: ProcessForm) => Promise<any>;
  putProcesses: (persistedType: PersistedType, processId: string, form: ProcessForm) => Promise<any>;
  putProcessesTemplate: (persistedType: PersistedType, processId: string, form: ProcessForm) => Promise<any>;
  deleteProcesses: (persistedType: PersistedType, processId: string) => Promise<any>;
  copyProcesses: (persistedType: PersistedType, processId: string) => Promise<any>;
  
  // API Methods - Instances
  postInstances: (data: InstancesRequest) => Promise<any>;
  
  // API Methods - Entity Info
  getEntityParentClassesAndInterfaces: (entityClass: string) => Promise<any>;
}

export const useStatemachineStore = create<StatemachineState>()(
  persist(
    (set, get) => ({
      // Initial State
      selectedWorkflow: null,
      selectedEntityClassName: null,
      
      // State Actions
      setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
      setSelectedEntityClassName: (entityClassName) => set({ selectedEntityClassName: entityClassName }),
      
      // Workflow API Methods
      getWorkflowEnabledTypes: async () => {
        // Check feature flag to determine which endpoint to use
        const useModelsInfo = HelperFeatureFlags.isUseModelsInfo();

        if (useModelsInfo) {
          // When feature flag is enabled, use models-info endpoint which returns entity type info
          return await axios.get('/platform-api/entity-info/fetch/models-info', {
            params: { stateEnabled: true }
          });
        }
        // Otherwise use the basic workflow-enabled-types endpoint (returns just strings)
        return await axios.get('/platform-api/statemachine/workflow-enabled-types');
      },
      
      getAllWorkflowsList: async (entityClassName) => {
        return axios.get('/platform-api/statemachine/workflows', {
          params: { entityClassName },
        });
      },
      
      postWorkflow: async (form) => {
        return axios.post('/platform-api/statemachine/persisted/workflows', form);
      },
      
      putWorkflow: async (form) => {
        return axios.put(
          `/platform-api/statemachine/persisted/workflows/${encodeURIComponent(form.id)}`,
          form
        );
      },
      
      deleteWorkflow: async (workflowId) => {
        const url = `/platform-api/statemachine/persisted/workflows/${encodeURIComponent(workflowId)}`;
        // Mute global error handler - we'll handle errors in the component
        return axios.delete(url, { muteErrors: true } as any);
      },
      
      copyWorkflow: async (persistedType, workflowId) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/workflows/copy/${encodeURIComponent(workflowId)}`
        );
      },
      
      getWorkflow: async (persistedType, workflowId) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}`
        );
      },
      
      // State API Methods
      getStatesList: async (persistedType, workflowId) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states`
        );
      },
      
      getState: async (persistedType, workflowId, stateId) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${encodeURIComponent(stateId)}`
        );
      },
      
      postState: async (persistedType, workflowId, transitionId, form) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}/states`,
          form
        );
      },
      
      putState: async (persistedType, workflowId, stateId, form) => {
        return axios.put(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${stateId}`,
          form
        );
      },
      
      deleteState: async (persistedType, workflowId, stateId) => {
        return axios.delete(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/states/${stateId}`
        );
      },
      
      // Transition API Methods
      getTransitionsList: async (persistedType, workflowId) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions`
        );
      },
      
      getTransition: async (persistedType, workflowId, transitionId) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`
        );
      },
      
      postTransition: async (persistedType, workflowId, form) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions`,
          form
        );
      },
      
      putTransition: async (persistedType, workflowId, transitionId, form) => {
        return axios.put(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`,
          form
        );
      },
      
      deleteTransition: async (persistedType, workflowId, transitionId) => {
        return axios.delete(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/${encodeURIComponent(transitionId)}`
        );
      },

      copyTransition: async (persistedType, workflowId, transitionId) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/workflows/${encodeURIComponent(workflowId)}/transitions/copy/${encodeURIComponent(transitionId)}`
        );
      },

      // Criteria API Methods
      getCriteriaList: async (entityClassName) => {
        return axios.get('/platform-api/statemachine/criteria', {
          params: { entityClassName },
        });
      },
      
      getCriteria: async (persistedType, criteriaId, entityClassName) => {
        const { data: responseData } = await axios.get(
          `/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`,
          { params: { entityClassName } }
        );
        
        // Normalize response data
        if (!responseData.name && responseData.id) {
          responseData.name = responseData.id;
        }
        if (!responseData.hasOwnProperty('description')) {
          responseData.description = '';
        }
        if (responseData.condition && !responseData.condition.hasOwnProperty('conditions')) {
          responseData.condition = {
            '@bean': 'com.cyoda.core.conditions.GroupCondition',
            operator: 'AND',
            conditions: [responseData.condition],
          };
        }
        return { data: responseData };
      },
      
      getCriteriaDefs: async (params) => {
        const colPaths = params.colPaths
          .map((el) => `colPath=${encodeURIComponent(el)}`)
          .join('&');
        return axios.get(
          `/platform-api/entity-info/fetch/coldefs?rootClass=${params.rootClass}&${colPaths}`
        );
      },
      
      postCriteria: async (persistedType, form) => {
        return axios.post(`/platform-api/statemachine/${persistedType}/criteria`, form);
      },
      
      putCriteria: async (persistedType, criteriaId, form) => {
        return axios.put(
          `/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`,
          form
        );
      },
      
      deleteCriteria: async (persistedType, criteriaId) => {
        return axios.delete(
          `/platform-api/statemachine/${persistedType}/criteria/${criteriaId}`
        );
      },

      copyCriteria: async (persistedType, criteriaId) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/criteria/copy/${encodeURIComponent(criteriaId)}`
        );
      },

      getCriteriacheckers: async (entityClassName) => {
        return axios.get('/platform-api/statemachine/criteriacheckers', {
          params: { entityClassName },
        });
      },
      
      // Process API Methods
      getProcessesList: async (entityClassName) => {
        return axios.get('/platform-api/statemachine/processes', {
          params: { entityClassName },
        });
      },
      
      getProcessorsList: async () => {
        return axios.get('/platform-api/statemachine/processors');
      },
      
      getProcesses: async (persistedType, processId, entityClassName) => {
        return axios.get(
          `/platform-api/statemachine/${persistedType}/processes/${processId}`,
          { params: { entityClassName } }
        );
      },
      
      postProcesses: async (persistedType, form) => {
        return axios.post(`/platform-api/statemachine/${persistedType}/processes`, form);
      },
      
      postProcessesTemplate: async (persistedType, form) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/processes/template`,
          form
        );
      },
      
      putProcesses: async (persistedType, processId, form) => {
        return axios.put(
          `/platform-api/statemachine/${persistedType}/processes/${processId}`,
          form
        );
      },
      
      putProcessesTemplate: async (persistedType, processId, form) => {
        return axios.put(
          `/platform-api/statemachine/${persistedType}/processes/template/${processId}`,
          form
        );
      },
      
      deleteProcesses: async (persistedType, processId) => {
        return axios.delete(
          `/platform-api/statemachine/${persistedType}/processes/${processId}`
        );
      },

      copyProcesses: async (persistedType, processId) => {
        return axios.post(
          `/platform-api/statemachine/${persistedType}/processes/copy/${encodeURIComponent(processId)}`
        );
      },

      // Instance API Methods
      postInstances: async (data) => {
        const response = await axios.post('/platform-api/statemachine/instances', data);
        return response;
      },
      
      // Entity Info API Methods
      getEntityParentClassesAndInterfaces: async (entityClass) => {
        return axios.get(
          `/platform-api/entity-info/entity-parents-interfaces?entityClass=${entityClass}`
        );
      },
    }),
    {
      name: 'cyoda_statemachine',
      partialize: (state) => ({
        selectedWorkflow: state.selectedWorkflow,
        selectedEntityClassName: state.selectedEntityClassName,
      }),
    }
  )
);

