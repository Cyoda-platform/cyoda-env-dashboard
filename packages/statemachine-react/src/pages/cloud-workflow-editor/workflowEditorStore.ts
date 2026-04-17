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
      updateWorkflowProps(patch) {
        set((s) => {
          if (!s.current) return;
          Object.assign(s.current, patch);
          s.errors = [];
        });
      },

      renameState(oldName, newName) {
        if (oldName === newName) return;
        set((s) => {
          if (!s.current || !(oldName in s.current.states)) return;
          s.current.states[newName] = s.current.states[oldName];
          delete s.current.states[oldName];
          if (s.current.initialState === oldName) s.current.initialState = newName;
          // Path rewrites
          const oldPrefix = `/states/${oldName}`;
          const newPrefix = `/states/${newName}`;
          if (s.selectedPath === oldPrefix || s.selectedPath.startsWith(oldPrefix + '/')) {
            s.selectedPath = newPrefix + s.selectedPath.slice(oldPrefix.length);
          }
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p === oldPrefix || p.startsWith(oldPrefix + '/')) {
              next.add(newPrefix + p.slice(oldPrefix.length));
            } else {
              next.add(p);
            }
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },

      addState(name) {
        set((s) => {
          if (!s.current || name in s.current.states) return;
          s.current.states[name] = { transitions: [] };
          s.selectedPath = `/states/${name}`;
          s.expandedPaths.add(`/states/${name}`);
          s.errors = [];
        });
      },

      deleteState(name) {
        set((s) => {
          if (!s.current || !(name in s.current.states)) return;
          delete s.current.states[name];
          const prefix = `/states/${name}`;
          if (s.selectedPath === prefix || s.selectedPath.startsWith(prefix + '/')) {
            s.selectedPath = '/';
          }
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p !== prefix && !p.startsWith(prefix + '/')) next.add(p);
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },
      addTransition(stateName) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ??= [];
          list.push({ name: '', next: stateName, manual: false });
          const newIndex = list.length - 1;
          const newPath = `/states/${stateName}/transitions/${newIndex}`;
          s.selectedPath = newPath;
          s.expandedPaths.add(`/states/${stateName}`);
          s.expandedPaths.add(newPath);
          s.errors = [];
        });
      },

      deleteTransition(stateName, index) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ?? [];
          if (index < 0 || index >= list.length) return;
          list.splice(index, 1);

          const deletedPath = `/states/${stateName}/transitions/${index}`;
          // Selection: if it was the deleted one or a descendant, jump to parent.
          if (s.selectedPath === deletedPath || s.selectedPath.startsWith(deletedPath + '/')) {
            s.selectedPath = `/states/${stateName}`;
          } else {
            // If selection was at a higher index in the same state, decrement.
            const m = s.selectedPath.match(new RegExp(`^/states/${stateName}/transitions/(\\d+)(.*)$`));
            if (m) {
              const j = Number(m[1]);
              if (j > index) s.selectedPath = `/states/${stateName}/transitions/${j - 1}${m[2]}`;
            }
          }
          // Expansion: drop the deleted path + descendants; shift higher indices.
          const next = new Set<string>();
          for (const p of s.expandedPaths) {
            if (p === deletedPath || p.startsWith(deletedPath + '/')) continue;
            const m = p.match(new RegExp(`^/states/${stateName}/transitions/(\\d+)(.*)$`));
            if (m) {
              const j = Number(m[1]);
              if (j > index) { next.add(`/states/${stateName}/transitions/${j - 1}${m[2]}`); continue; }
            }
            next.add(p);
          }
          s.expandedPaths = next;
          s.errors = [];
        });
      },

      updateTransition(stateName, index, patch) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[index];
          if (!t) return;
          Object.assign(t, patch);
          s.errors = [];
        });
      },
      addProcessor(stateName, ti, processor) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[ti];
          if (!t) return;
          (t.processors ??= []).push(processor);
          s.errors = [];
        });
      },

      updateProcessor(stateName, ti, pi, patch) {
        set((s) => {
          const p = s.current?.states[stateName]?.transitions?.[ti]?.processors?.[pi];
          if (!p) return;
          Object.assign(p, patch);
          s.errors = [];
        });
      },

      deleteProcessor(stateName, ti, pi) {
        set((s) => {
          const list = s.current?.states[stateName]?.transitions?.[ti]?.processors;
          if (!list || pi < 0 || pi >= list.length) return;
          list.splice(pi, 1);
          s.errors = [];
        });
      },

      setTransitionCriterion(stateName, ti, criterion) {
        set((s) => {
          const t = s.current?.states[stateName]?.transitions?.[ti];
          if (!t) return;
          if (criterion === undefined) delete t.criterion;
          else t.criterion = criterion;
          s.errors = [];
        });
      },

      resetToPristine() {
        set((s) => {
          if (!s.pristine) return;
          s.current = s.pristine;
          s.selectedPath = '/';
          s.expandedPaths = defaultExpansion(s.pristine);
          s.errors = [];
        });
      },
    })),
  );
}
