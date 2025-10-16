/**
 * Processing Store
 * 
 * State management for processing transactions using Zustand.
 * Manages transaction list and status tracking.
 * State is persisted to localStorage.
 * 
 * Migrated from: .old_project/packages/cobi/src/stores/cobi-processing.ts (Pinia → Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  type: string;
  configId?: string;
  configName?: string;
  error?: string;
}

interface ProcessingState {
  // Transactions list
  transactionsList: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;

  // Active transaction (for monitoring)
  activeTransactionId: string | null;
  setActiveTransactionId: (id: string | null) => void;

  // Auto-refresh state
  autoRefreshEnabled: boolean;
  setAutoRefreshEnabled: (enabled: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  transactionsList: [],
  activeTransactionId: null,
  autoRefreshEnabled: true,
};

/**
 * Processing Store Hook
 * 
 * Zustand store for processing transactions with localStorage persistence.
 * 
 * @example
 * ```typescript
 * import { useProcessingStore } from './stores/processingStore';
 * 
 * function ProcessingMonitor() {
 *   const transactions = useProcessingStore((state) => state.transactionsList);
 *   const addTransaction = useProcessingStore((state) => state.addTransaction);
 *   
 *   const handleStartImport = () => {
 *     addTransaction({
 *       id: 'tx-123',
 *       name: 'Import CSV',
 *       status: 'pending',
 *       createdAt: Date.now(),
 *       updatedAt: Date.now(),
 *       type: 'import',
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleStartImport}>Start Import</button>
 *       <ul>
 *         {transactions.map(tx => (
 *           <li key={tx.id}>{tx.name} - {tx.status}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export const useProcessingStore = create<ProcessingState>()(
  persist(
    (set) => ({
      ...initialState,

      // Transactions management
      addTransaction: (transaction) =>
        set((state) => ({
          transactionsList: [...state.transactionsList, transaction],
        })),

      removeTransaction: (id) =>
        set((state) => ({
          transactionsList: state.transactionsList.filter((tx) => tx.id !== id),
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactionsList: state.transactionsList.map((tx) =>
            tx.id === id ? { ...tx, ...updates, updatedAt: Date.now() } : tx
          ),
        })),

      clearTransactions: () => set({ transactionsList: [] }),

      // Active transaction
      setActiveTransactionId: (id) => set({ activeTransactionId: id }),

      // Auto-refresh
      setAutoRefreshEnabled: (enabled) => set({ autoRefreshEnabled: enabled }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'cobi-processing-storage',
      partialize: (state) => ({
        transactionsList: state.transactionsList,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
    }
  )
);

