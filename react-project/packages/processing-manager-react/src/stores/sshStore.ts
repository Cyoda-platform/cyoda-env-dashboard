/**
 * SSH Store
 * Migrated from @cyoda/processing-manager/src/stores/ssh.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import type { SshState, SshConnection, SshCommand } from '../types';

interface SshStore extends SshState {
  setConnection: (connection: SshConnection | null) => void;
  addCommand: (command: SshCommand) => void;
  clearCommands: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: SshState = {
  connection: null,
  commands: [],
  loading: false,
  error: null,
};

export const useSshStore = create<SshStore>((set) => ({
  ...initialState,

  setConnection: (connection) => set({ connection }),
  
  addCommand: (command) => 
    set((state) => ({ 
      commands: [...state.commands, command] 
    })),
  
  clearCommands: () => set({ commands: [] }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));

