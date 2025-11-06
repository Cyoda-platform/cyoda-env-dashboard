/**
 * Query Invalidation Hook
 * Replaces Vue's Event Bus with React Query's invalidation system
 * 
 * Vue Event Bus Events:
 * - workflow:reload -> invalidateWorkflow()
 * - transitions:reload -> invalidateTransitions()
 * - graphicalStatemachine:reset -> invalidateGraphicalData()
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Hook to invalidate React Query caches
 * This replaces the Vue event bus pattern with React Query's built-in invalidation
 * 
 * @example
 * ```tsx
 * const { invalidateWorkflow, invalidateTransitions } = useQueryInvalidation();
 * 
 * // After creating a transition
 * await createTransition(data);
 * invalidateTransitions(workflowId); // Reload transitions list
 * invalidateWorkflow(workflowId); // Reload workflow data
 * ```
 */
export function useQueryInvalidation() {
  const queryClient = useQueryClient();

  /**
   * Invalidate workflow data
   * Replaces: eventBus.$emit('workflow:reload')
   */
  const invalidateWorkflow = useCallback((workflowId?: string) => {
    if (workflowId) {
      // Invalidate specific workflow
      queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
    } else {
      // Invalidate all workflows
      queryClient.invalidateQueries({ queryKey: ['workflow'] });
    }
  }, [queryClient]);

  /**
   * Invalidate workflows list
   */
  const invalidateWorkflowsList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
  }, [queryClient]);

  /**
   * Invalidate transitions data
   * Replaces: eventBus.$emit('transitions:reload')
   */
  const invalidateTransitions = useCallback((workflowId?: string) => {
    if (workflowId) {
      // Invalidate specific workflow's transitions
      queryClient.invalidateQueries({ queryKey: ['transitions', workflowId] });
    } else {
      // Invalidate all transitions
      queryClient.invalidateQueries({ queryKey: ['transitions'] });
    }
  }, [queryClient]);

  /**
   * Invalidate processes data
   */
  const invalidateProcesses = useCallback((workflowId?: string) => {
    if (workflowId) {
      queryClient.invalidateQueries({ queryKey: ['processes', workflowId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    }
  }, [queryClient]);

  /**
   * Invalidate criteria data
   */
  const invalidateCriteria = useCallback((workflowId?: string) => {
    if (workflowId) {
      queryClient.invalidateQueries({ queryKey: ['criteria', workflowId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['criteria'] });
    }
  }, [queryClient]);

  /**
   * Invalidate instances data
   */
  const invalidateInstances = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['instances'] });
  }, [queryClient]);

  /**
   * Invalidate graphical state machine data
   * Replaces: eventBus.$emit('graphicalStatemachine:reset')
   */
  const invalidateGraphicalData = useCallback((workflowId?: string) => {
    // Invalidate all related data for graphical view
    invalidateWorkflow(workflowId);
    invalidateTransitions(workflowId);
    invalidateProcesses(workflowId);
    invalidateCriteria(workflowId);
  }, [invalidateWorkflow, invalidateTransitions, invalidateProcesses, invalidateCriteria]);

  /**
   * Invalidate all workflow-related data
   * Useful after major changes
   */
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['workflow'] });
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
    queryClient.invalidateQueries({ queryKey: ['transitions'] });
    queryClient.invalidateQueries({ queryKey: ['processes'] });
    queryClient.invalidateQueries({ queryKey: ['criteria'] });
    queryClient.invalidateQueries({ queryKey: ['instances'] });
  }, [queryClient]);

  return {
    // Individual invalidations
    invalidateWorkflow,
    invalidateWorkflowsList,
    invalidateTransitions,
    invalidateProcesses,
    invalidateCriteria,
    invalidateInstances,
    invalidateGraphicalData,
    
    // Bulk invalidation
    invalidateAll,
  };
}

