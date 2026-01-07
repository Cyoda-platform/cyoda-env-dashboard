/**
 * State Machine Hooks
 * React Query hooks for state machine operations
 * Migrated from: .old_project/packages/statemachine/src/stores/statemachine.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStatemachineStore } from '../stores/statemachineStore';
import type {
  WorkflowForm,
  StateForm,
  TransitionForm,
  CriteriaForm,
  ProcessForm,
  InstancesRequest,
  PersistedType,
} from '../types';

// Query Keys
export const statemachineKeys = {
  all: ['statemachine'] as const,
  workflows: () => [...statemachineKeys.all, 'workflows'] as const,
  workflowsList: (entityClassName?: string) => [...statemachineKeys.workflows(), 'list', entityClassName] as const,
  workflow: (persistedType: PersistedType, workflowId: string) => [...statemachineKeys.workflows(), persistedType, workflowId] as const,
  workflowEnabledTypes: () => [...statemachineKeys.workflows(), 'enabled-types'] as const,
  
  states: () => [...statemachineKeys.all, 'states'] as const,
  statesList: (persistedType: PersistedType, workflowId: string) => [...statemachineKeys.states(), persistedType, workflowId] as const,
  state: (persistedType: PersistedType, workflowId: string, stateId: string) => [...statemachineKeys.states(), persistedType, workflowId, stateId] as const,
  
  transitions: () => [...statemachineKeys.all, 'transitions'] as const,
  transitionsList: (persistedType: PersistedType, workflowId: string) => [...statemachineKeys.transitions(), persistedType, workflowId] as const,
  transition: (persistedType: PersistedType, workflowId: string, transitionId: string) => [...statemachineKeys.transitions(), persistedType, workflowId, transitionId] as const,
  
  criteria: () => [...statemachineKeys.all, 'criteria'] as const,
  criteriaList: (entityClassName?: string) => [...statemachineKeys.criteria(), 'list', entityClassName] as const,
  criteriaItem: (persistedType: PersistedType, criteriaId: string, entityClassName?: string) => [...statemachineKeys.criteria(), persistedType, criteriaId, entityClassName] as const,
  criteriacheckers: (entityClassName?: string) => [...statemachineKeys.criteria(), 'checkers', entityClassName] as const,
  
  processes: () => [...statemachineKeys.all, 'processes'] as const,
  processesList: (entityClassName?: string) => [...statemachineKeys.processes(), 'list', entityClassName] as const,
  processItem: (persistedType: PersistedType, processId: string, entityClassName?: string) => [...statemachineKeys.processes(), persistedType, processId, entityClassName] as const,
  processorsList: () => [...statemachineKeys.processes(), 'processors'] as const,

  instances: () => [...statemachineKeys.all, 'instances'] as const,

  entityInfo: () => [...statemachineKeys.all, 'entity-info'] as const,
  entityParentClasses: (entityClassName: string) => [...statemachineKeys.entityInfo(), 'parent-classes', entityClassName] as const,
};

// ============================================================================
// Workflow Hooks
// ============================================================================

export function useWorkflowEnabledTypes() {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.workflowEnabledTypes(),
    queryFn: async () => {
      const response = await store.getWorkflowEnabledTypes();
      return response.data;
    },
  });
}

export function useWorkflowsList(entityClassName?: string) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.workflowsList(entityClassName),
    queryFn: async () => {
      const response = await store.getAllWorkflowsList(entityClassName);
      // Ensure we always return an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
  });
}

export function useWorkflow(persistedType: PersistedType, workflowId: string, enabled = true) {
  const store = useStatemachineStore();
  
  return useQuery({
    queryKey: statemachineKeys.workflow(persistedType, workflowId),
    queryFn: async () => {
      const response = await store.getWorkflow(persistedType, workflowId);
      return response.data;
    },
    enabled: enabled && !!workflowId,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async (form: WorkflowForm) => {
      const response = await store.postWorkflow(form);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async (form: WorkflowForm & { id: string }) => {
      const response = await store.putWorkflow(form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflow('persisted', variables.id) });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      const response = await store.deleteWorkflow(workflowId);
      return response.data;
    },
    onMutate: async (workflowId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: statemachineKeys.workflowsList() });

      // Snapshot the previous value
      const previousWorkflows = queryClient.getQueryData(statemachineKeys.workflowsList());

      // Optimistically update to remove the workflow
      queryClient.setQueryData(statemachineKeys.workflowsList(), (old: any) => {
        if (!old) return old;
        return old.filter((w: any) => w.id !== workflowId);
      });

      // Return context with the snapshot
      return { previousWorkflows };
    },
    onError: (err, workflowId, context: any) => {
      // Rollback on error
      if (context?.previousWorkflows) {
        queryClient.setQueryData(statemachineKeys.workflowsList(), context.previousWorkflows);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}

export function useCopyWorkflow() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async ({ persistedType, workflowId }: { persistedType: PersistedType; workflowId: string }) => {
      const response = await store.copyWorkflow(persistedType, workflowId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.workflows() });
    },
  });
}

// ============================================================================
// State Hooks
// ============================================================================

export function useStatesList(persistedType: PersistedType, workflowId: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.statesList(persistedType, workflowId),
    queryFn: async () => {
      const response = await store.getStatesList(persistedType, workflowId);
      // Real Cyoda backend returns data in response.data.Data
      return response.data?.Data || response.data || [];
    },
    enabled: enabled && !!workflowId,
  });
}

export function useState(persistedType: PersistedType, workflowId: string, stateId: string, enabled = true) {
  const store = useStatemachineStore();
  
  return useQuery({
    queryKey: statemachineKeys.state(persistedType, workflowId, stateId),
    queryFn: async () => {
      const response = await store.getState(persistedType, workflowId, stateId);
      return response.data;
    },
    enabled: enabled && !!workflowId && !!stateId,
  });
}

export function useCreateState() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      transitionId,
      form,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      transitionId: string;
      form: StateForm;
    }) => {
      const response = await store.postState(persistedType, workflowId, transitionId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate states list
      queryClient.invalidateQueries({ queryKey: statemachineKeys.statesList(variables.persistedType, variables.workflowId) });
      // Invalidate the transition that was used to create this state
      // The backend automatically updates the transition's endStateId
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transition(variables.persistedType, variables.workflowId, variables.transitionId) });
      // Also invalidate transitions list
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transitionsList(variables.persistedType, variables.workflowId) });
    },
  });
}

export function useUpdateState() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      stateId,
      form,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      stateId: string;
      form: StateForm;
    }) => {
      const response = await store.putState(persistedType, workflowId, stateId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.statesList(variables.persistedType, variables.workflowId) });
      queryClient.invalidateQueries({ queryKey: statemachineKeys.state(variables.persistedType, variables.workflowId, variables.stateId) });
    },
  });
}

export function useDeleteState() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      stateId,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      stateId: string;
    }) => {
      const response = await store.deleteState(persistedType, workflowId, stateId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.statesList(variables.persistedType, variables.workflowId) });
    },
  });
}

// ============================================================================
// Transition Hooks
// ============================================================================

export function useTransitionsList(persistedType: PersistedType, workflowId: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.transitionsList(persistedType, workflowId),
    queryFn: async () => {
      const response = await store.getTransitionsList(persistedType, workflowId);
      // Real Cyoda backend returns data in response.data.Data
      return response.data?.Data || response.data || [];
    },
    enabled: enabled && !!workflowId,
  });
}

export function useTransition(persistedType: PersistedType, workflowId: string, transitionId: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.transition(persistedType, workflowId, transitionId),
    queryFn: async () => {
      const response = await store.getTransition(persistedType, workflowId, transitionId);
      return response.data?.Data || response.data;
    },
    enabled: enabled && !!workflowId && !!transitionId,
  });
}

export function useCreateTransition() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      form,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      form: TransitionForm;
    }) => {
      const response = await store.postTransition(persistedType, workflowId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transitionsList(variables.persistedType, variables.workflowId) });
    },
  });
}

export function useUpdateTransition() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();
  
  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      transitionId,
      form,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      transitionId: string;
      form: TransitionForm;
    }) => {
      const response = await store.putTransition(persistedType, workflowId, transitionId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transitionsList(variables.persistedType, variables.workflowId) });
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transition(variables.persistedType, variables.workflowId, variables.transitionId) });
    },
  });
}

export function useDeleteTransition() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      transitionId,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      transitionId: string;
    }) => {
      const response = await store.deleteTransition(persistedType, workflowId, transitionId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transitionsList(variables.persistedType, variables.workflowId) });
    },
  });
}

export function useCopyTransition() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({
      persistedType,
      workflowId,
      transitionId,
    }: {
      persistedType: PersistedType;
      workflowId: string;
      transitionId: string;
    }) => {
      const response = await store.copyTransition(persistedType, workflowId, transitionId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.transitionsList(variables.persistedType, variables.workflowId) });
    },
  });
}

// ============================================================================
// Criteria Hooks
// ============================================================================

export function useCriteriaList(entityClassName?: string) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.criteriaList(entityClassName),
    queryFn: async () => {
      const response = await store.getCriteriaList(entityClassName);
      return response.data;
    },
  });
}

export function useCriteria(persistedType: PersistedType, criteriaId: string, entityClassName?: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.criteriaItem(persistedType, criteriaId, entityClassName),
    queryFn: async () => {
      const response = await store.getCriteria(persistedType, criteriaId, entityClassName);
      // getCriteria already normalizes the data in the store, so we use response.data directly
      return response.data;
    },
    enabled: enabled && !!criteriaId,
  });
}

export function useCriteriacheckers(entityClassName?: string) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.criteriacheckers(entityClassName),
    queryFn: async () => {
      const response = await store.getCriteriacheckers(entityClassName);
      return response.data;
    },
  });
}

export function useCriteriaDefs(rootClass: string, colPaths: string[], enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: ['criteriaDefs', rootClass, colPaths],
    queryFn: async () => {
      const response = await store.getCriteriaDefs({ rootClass, colPaths });
      return response.data;
    },
    enabled: enabled && !!rootClass && colPaths.length > 0,
  });
}

export function useCreateCriteria() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, form }: { persistedType: PersistedType; form: CriteriaForm }) => {
      const response = await store.postCriteria(persistedType, form);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.criteria() });
    },
  });
}

export function useUpdateCriteria() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({
      persistedType,
      criteriaId,
      form,
    }: {
      persistedType: PersistedType;
      criteriaId: string;
      form: CriteriaForm;
    }) => {
      const response = await store.putCriteria(persistedType, criteriaId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.criteria() });
      queryClient.invalidateQueries({ queryKey: statemachineKeys.criteriaItem(variables.persistedType, variables.criteriaId) });
    },
  });
}

export function useDeleteCriteria() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, criteriaId }: { persistedType: PersistedType; criteriaId: string }) => {
      const response = await store.deleteCriteria(persistedType, criteriaId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.criteria() });
    },
  });
}

export function useCopyCriteria() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, criteriaId }: { persistedType: PersistedType; criteriaId: string }) => {
      const response = await store.copyCriteria(persistedType, criteriaId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.criteria() });
    },
  });
}

// ============================================================================
// Process Hooks
// ============================================================================

export function useProcessesList(entityClassName?: string) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.processesList(entityClassName),
    queryFn: async () => {
      const response = await store.getProcessesList(entityClassName);
      return response.data;
    },
  });
}

export function useProcessorsList() {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.processorsList(),
    queryFn: async () => {
      const response = await store.getProcessorsList();
      return response.data;
    },
  });
}

export function useProcess(persistedType: PersistedType, processId: string, entityClassName?: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.processItem(persistedType, processId, entityClassName),
    queryFn: async () => {
      const response = await store.getProcesses(persistedType, processId, entityClassName);
      return response.data?.Data || response.data;
    },
    enabled: enabled && !!processId,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, form }: { persistedType: PersistedType; form: ProcessForm }) => {
      // Use different endpoint for template processes
      const response = form.isTemplate
        ? await store.postProcessesTemplate(persistedType, form)
        : await store.postProcesses(persistedType, form);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.processes() });
    },
  });
}

export function useUpdateProcess() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({
      persistedType,
      processId,
      form,
    }: {
      persistedType: PersistedType;
      processId: string;
      form: ProcessForm;
    }) => {
      // Use different endpoint for template processes
      const response = form.isTemplate
        ? await store.putProcessesTemplate(persistedType, processId, form)
        : await store.putProcesses(persistedType, processId, form);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.processes() });
      queryClient.invalidateQueries({ queryKey: statemachineKeys.processItem(variables.persistedType, variables.processId) });
    },
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, processId }: { persistedType: PersistedType; processId: string }) => {
      const response = await store.deleteProcesses(persistedType, processId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.processes() });
    },
  });
}

export function useCopyProcess() {
  const queryClient = useQueryClient();
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async ({ persistedType, processId }: { persistedType: PersistedType; processId: string }) => {
      const response = await store.copyProcesses(persistedType, processId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statemachineKeys.processes() });
    },
  });
}

// ============================================================================
// Instance Hooks
// ============================================================================

export function useInstances() {
  const store = useStatemachineStore();

  return useMutation({
    mutationFn: async (data: InstancesRequest) => {
      const response = await store.postInstances(data);
      return response.data;
    },
  });
}

// Store state hooks
export function useStatemachineState() {
  return useStatemachineStore();
}

// ============================================================================
// Convenience Aliases for List Hooks
// ============================================================================

/**
 * Alias for useTransitionsList - fetches transitions for a workflow
 */
export function useTransitions(persistedType: PersistedType, workflowId: string, enabled = true) {
  return useTransitionsList(persistedType, workflowId, enabled);
}

/**
 * Fetches all processes for an entity class (for graphical view)
 * Note: This returns all processes for an entity class, not workflow-specific
 */
export function useProcesses(persistedType: PersistedType, workflowId: string, entityClassName?: string, enabled = true) {
  return useProcessesList(entityClassName);
}

/**
 * Fetches all criteria for an entity class (for graphical view)
 * Note: This returns all criteria for an entity class, not workflow-specific
 */
export function useCriteriaForWorkflow(persistedType: PersistedType, workflowId: string, entityClassName?: string, enabled = true) {
  return useCriteriaList(entityClassName);
}

// ============================================================================
// Entity Info Hooks
// ============================================================================

/**
 * Fetches parent classes and interfaces for an entity class
 * Used to filter processors by entity class hierarchy
 */
export function useEntityParentClasses(entityClassName: string, enabled = true) {
  const store = useStatemachineStore();

  return useQuery({
    queryKey: statemachineKeys.entityParentClasses(entityClassName),
    queryFn: async () => {
      const response = await store.getEntityParentClassesAndInterfaces(entityClassName);
      return response.data;
    },
    enabled: enabled && !!entityClassName,
  });
}

