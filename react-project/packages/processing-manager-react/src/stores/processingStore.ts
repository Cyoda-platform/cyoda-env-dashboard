/**
 * Processing Store
 *
 * Manages processing nodes state including the list of nodes, selected node,
 * and loading/error states. This store is used throughout the application
 * to track and manage processing node information.
 *
 * Migrated from @cyoda/processing-manager/src/stores/processing.ts (Pinia → Zustand)
 *
 * @example
 * ```typescript
 * import { useProcessingStore } from '@cyoda/processing-manager-react';
 *
 * function NodesList() {
 *   const nodes = useProcessingStore((state) => state.nodesProcessing);
 *   const loading = useProcessingStore((state) => state.loading);
 *   const setSelectedNode = useProcessingStore((state) => state.setSelectedNode);
 *
 *   if (loading) return <Spin />;
 *
 *   return (
 *     <ul>
 *       {nodes.map((node) => (
 *         <li key={node.hostname} onClick={() => setSelectedNode(node)}>
 *           {node.hostname}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */

import { create } from 'zustand';
import type { ProcessingState, PmNode } from '../types';

/**
 * Processing Store Interface
 *
 * Extends ProcessingState with action methods for managing processing nodes.
 */
interface ProcessingStore extends ProcessingState {
  /** Set the list of processing nodes */
  setNodesProcessing: (nodes: PmNode[]) => void;

  /** Set the currently selected node */
  setSelectedNode: (node: PmNode | null) => void;

  /** Set loading state */
  setLoading: (loading: boolean) => void;

  /** Set error message */
  setError: (error: string | null) => void;

  /** Reset store to initial state */
  reset: () => void;
}

/** Initial processing state */
const initialState: ProcessingState = {
  nodesProcessing: [],
  selectedNode: null,
  loading: false,
  error: null,
};

/**
 * Processing Store Hook
 *
 * Zustand store for managing processing nodes state.
 *
 * State includes:
 * - List of processing nodes
 * - Currently selected node
 * - Loading state
 * - Error state
 *
 * @returns ProcessingStore instance
 *
 * @example
 * ```typescript
 * // Subscribe to specific state
 * const nodes = useProcessingStore((state) => state.nodesProcessing);
 *
 * // Access actions
 * const setNodes = useProcessingStore((state) => state.setNodesProcessing);
 *
 * // Update state
 * setNodes([{ hostname: 'node-01', baseUrl: 'http://node-01:8080', grafana: null }]);
 *
 * // Reset to defaults
 * useProcessingStore.getState().reset();
 * ```
 */
export const useProcessingStore = create<ProcessingStore>((set) => ({
  ...initialState,

  setNodesProcessing: (nodes) => set({ nodesProcessing: nodes }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

