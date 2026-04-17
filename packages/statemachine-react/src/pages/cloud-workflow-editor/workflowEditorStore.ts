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
import type { WorkflowDoc, QueryCondition, TransitionDefinition, ProcessorDefinition } from '../../gateways';
import type { ValidationIssue } from './validateWorkflowDoc';

export interface WorkflowEditorState {
  pristine: WorkflowDoc | null;
  current: WorkflowDoc | null;
  errors: ValidationIssue[];

  hydrate(initial: WorkflowDoc): void;
  setErrors(errors: ValidationIssue[]): void;

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

export function createWorkflowEditorStore(): WorkflowEditorStore {
  return create<WorkflowEditorState>()(
    immer((set) => ({
      pristine: null,
      current: null,
      errors: [],

      hydrate(initial) {
        set((s) => {
          s.pristine = initial;
          s.current = initial;
          s.errors = [];
        });
      },

      setErrors(errors) { set((s) => { s.errors = errors; }); },

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
          s.errors = [];
        });
      },

      addState(name) {
        set((s) => {
          if (!s.current || name in s.current.states) return;
          s.current.states[name] = { transitions: [] };
          s.errors = [];
        });
      },

      deleteState(name) {
        set((s) => {
          if (!s.current || !(name in s.current.states)) return;
          delete s.current.states[name];
          s.errors = [];
        });
      },

      addTransition(stateName) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ??= [];
          list.push({ name: '', next: stateName, manual: false });
          s.errors = [];
        });
      },

      deleteTransition(stateName, index) {
        set((s) => {
          if (!s.current || !(stateName in s.current.states)) return;
          const list = s.current.states[stateName].transitions ?? [];
          if (index < 0 || index >= list.length) return;
          list.splice(index, 1);
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
          s.errors = [];
        });
      },
    })),
  );
}
