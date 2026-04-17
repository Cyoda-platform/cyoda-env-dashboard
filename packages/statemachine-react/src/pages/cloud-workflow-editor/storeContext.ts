/**
 * React Context that publishes the page-scoped Zustand store to the editor's
 * subtree. Every form/node component reads the store via this context, so
 * tests can supply a fresh store without monkey-patching modules.
 */
import { createContext, useContext } from 'react';
import type { WorkflowEditorStore, WorkflowEditorState } from './workflowEditorStore';

export const WorkflowEditorStoreContext = createContext<WorkflowEditorStore | null>(null);

export function useWorkflowEditorStore<T>(selector: (s: WorkflowEditorState) => T): T {
  const store = useContext(WorkflowEditorStoreContext);
  if (!store) throw new Error('useWorkflowEditorStore: missing WorkflowEditorStoreContext');
  return store(selector);
}
