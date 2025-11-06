/**
 * Scripts Store
 * 
 * State management for reusable scripts using Zustand.
 * Manages script definitions and editor state.
 * State is persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Script {
  id: string;
  name: string;
  description: string;
  body: string;
  language: 'javascript' | 'groovy';
  createdAt: number;
  updatedAt: number;
}

interface ScriptsState {
  // Scripts list
  scripts: Script[];
  setScripts: (scripts: Script[]) => void;
  addScript: (script: Script) => void;
  updateScript: (id: string, updates: Partial<Script>) => void;
  removeScript: (id: string) => void;

  // Current script being edited
  currentScript: Script | null;
  setCurrentScript: (script: Script | null) => void;

  // Editor state
  editorContent: string;
  setEditorContent: (content: string) => void;

  // Dirty state
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  scripts: [],
  currentScript: null,
  editorContent: '',
  isDirty: false,
};

/**
 * Scripts Store Hook
 * 
 * Zustand store for reusable scripts with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useScriptsStore } from './stores/scriptsStore';
 * 
 * function ScriptEditor() {
 *   const currentScript = useScriptsStore((state) => state.currentScript);
 *   const editorContent = useScriptsStore((state) => state.editorContent);
 *   const setEditorContent = useScriptsStore((state) => state.setEditorContent);
 *   const isDirty = useScriptsStore((state) => state.isDirty);
 *   
 *   return (
 *     <div>
 *       {isDirty && <span>Unsaved changes</span>}
 *       <h1>{currentScript?.name}</h1>
 *       <textarea
 *         value={editorContent}
 *         onChange={(e) => setEditorContent(e.target.value)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useScriptsStore = create<ScriptsState>()(
  persist(
    (set) => ({
      ...initialState,

      // Scripts management
      setScripts: (scripts) => set({ scripts }),

      addScript: (script) =>
        set((state) => ({
          scripts: [...state.scripts, script],
        })),

      updateScript: (id, updates) =>
        set((state) => ({
          scripts: state.scripts.map((script) =>
            script.id === id ? { ...script, ...updates, updatedAt: Date.now() } : script
          ),
        })),

      removeScript: (id) =>
        set((state) => ({
          scripts: state.scripts.filter((script) => script.id !== id),
        })),

      // Current script
      setCurrentScript: (script) => set({ currentScript: script }),

      // Editor state
      setEditorContent: (content) => set({ editorContent: content, isDirty: true }),

      // Dirty state
      setIsDirty: (dirty) => set({ isDirty: dirty }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'cobi-scripts-storage',
      partialize: (state) => ({
        scripts: state.scripts,
      }),
    }
  )
);

