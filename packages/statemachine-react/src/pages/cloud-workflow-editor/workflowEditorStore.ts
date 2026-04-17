/**
 * Page-scoped Zustand store for the cloud workflow editor.
 *
 * Designed for workflows with hundreds of states: components subscribe to
 * narrow slices via selectors and only re-render when their slice changes.
 *
 * Spec: docs/superpowers/specs/2026-04-17-cloud-workflow-editor-design.md §3.2
 */
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

enableMapSet();
import type { WorkflowDoc, QueryCondition, TransitionDefinition, ProcessorDefinition } from '../../gateways';
import type { ValidationIssue } from './validateWorkflowDoc';

export interface WorkflowEditorState {
  pristine: WorkflowDoc | null;
  current: WorkflowDoc | null;
  selectedPath: string;
  expandedPaths: Set<string>;
  errors: ValidationIssue[];

  hydrate(initial: WorkflowDoc, opts?: { preserveView?: boolean }): void;
  setSelected(path: string): void;
  toggleExpand(path: string): void;
  setErrors(errors: ValidationIssue[]): void;

  // Mutations come in Tasks 5–7.
  updateWorkflowProps(patch: Partial<WorkflowDoc>): void;
  renameState(oldName: string, newName: string): void;
  addState(name: string): void;
  deleteState(name: string): void;
  addTransition(stateName: string): void;
  deleteTransition(stateName: string, index: number): void;
  updateTransition(stateName: string, index: number, patch: Partial<TransitionDefinition>): void;
  addProcessor(stateName: string, transitionIndex: number, processor: ProcessorDefinition): void;
  updateProcessor(stateName: string, transitionIndex: number, processorIndex: number, patch: Partial<ProcessorDefinition>): void;
  deleteProcessor(stateName: string, transitionIndex: number, processorIndex: number): void;
  setTransitionCriterion(stateName: string, transitionIndex: number, criterion: QueryCondition | undefined): void;
  resetToPristine(): void;
}

export type WorkflowEditorStore = UseBoundStore<StoreApi<WorkflowEditorState>>;

/** Returns true iff `path` resolves in `doc`. Paths: '/', '/states/<n>', '/states/<n>/transitions/<i>'. */
export function pathResolvesIn(path: string, doc: WorkflowDoc): boolean {
  if (path === '/') return true;
  const m = path.match(/^\/states\/([^/]+)(?:\/transitions\/(\d+))?$/);
  if (!m) return false;
  const stateName = m[1];
  if (!(stateName in doc.states)) return false;
  if (m[2] === undefined) return true;
  const idx = Number(m[2]);
  const transitions = doc.states[stateName].transitions ?? [];
  return idx >= 0 && idx < transitions.length;
}

function defaultExpansion(doc: WorkflowDoc): Set<string> {
  const set = new Set<string>(['/']);
  const firstState = Object.keys(doc.states)[0];
  if (firstState) set.add(`/states/${firstState}`);
  return set;
}

export function createWorkflowEditorStore(): WorkflowEditorStore {
  return create<WorkflowEditorState>()(
    immer((set) => ({
      pristine: null,
      current: null,
      selectedPath: '/',
      expandedPaths: new Set<string>(),
      errors: [],

      hydrate(initial, opts) {
        set((s) => {
          const wasInitialized = s.pristine !== null;
          s.pristine = initial;
          s.current = initial;
          s.errors = [];
          if (opts?.preserveView && wasInitialized) {
            // Selection
            const keepSel = pathResolvesIn(s.selectedPath, initial);
            s.selectedPath = keepSel ? s.selectedPath : '/';
            // Expansion: keep the resolving subset; if NONE resolve, fall back to defaults.
            const kept = new Set<string>();
            for (const p of s.expandedPaths) {
              if (pathResolvesIn(p, initial)) kept.add(p);
            }
            s.expandedPaths = kept.size > 0 ? kept : defaultExpansion(initial);
          } else {
            s.selectedPath = '/';
            s.expandedPaths = defaultExpansion(initial);
          }
        });
      },

      setSelected(path) { set((s) => { s.selectedPath = path; }); },
      toggleExpand(path) {
        set((s) => {
          if (s.expandedPaths.has(path)) s.expandedPaths.delete(path);
          else s.expandedPaths.add(path);
        });
      },
      setErrors(errors) { set((s) => { s.errors = errors; }); },

      // Stubs — implemented in Tasks 5–7.
      updateWorkflowProps() { throw new Error('not implemented'); },
      renameState() { throw new Error('not implemented'); },
      addState() { throw new Error('not implemented'); },
      deleteState() { throw new Error('not implemented'); },
      addTransition() { throw new Error('not implemented'); },
      deleteTransition() { throw new Error('not implemented'); },
      updateTransition() { throw new Error('not implemented'); },
      addProcessor() { throw new Error('not implemented'); },
      updateProcessor() { throw new Error('not implemented'); },
      deleteProcessor() { throw new Error('not implemented'); },
      setTransitionCriterion() { throw new Error('not implemented'); },
      resetToPristine() { throw new Error('not implemented'); },
    })),
  );
}
