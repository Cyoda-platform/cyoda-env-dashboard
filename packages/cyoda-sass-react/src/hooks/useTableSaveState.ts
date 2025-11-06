import { useCallback } from 'react';
import type { TableSaveState } from '../types';

/**
 * Hook for saving and loading table state to/from localStorage
 * Mimics the Vue mixin functionality
 * 
 * @param tableKey - Unique key for the table
 * @returns Object with save and load functions
 */
export const useTableSaveState = (tableKey: string) => {
  const storageKey = `tableSaveState:${tableKey}`;

  /**
   * Save table state to localStorage
   */
  const saveState = useCallback((state: TableSaveState) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save table state:', error);
    }
  }, [storageKey]);

  /**
   * Load table state from localStorage
   */
  const loadState = useCallback((): TableSaveState | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load table state:', error);
      return null;
    }
  }, [storageKey]);

  /**
   * Delete table state from localStorage
   */
  const deleteState = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to delete table state:', error);
    }
  }, [storageKey]);

  /**
   * Handle column drag end event
   */
  const onHeaderDragend = useCallback((newWidth: number, _oldWidth: number, column: any) => {
    const state = loadState() || {};
    const columnWidths = state.columnWidths || {};
    columnWidths[column.property] = newWidth;
    saveState({ ...state, columnWidths });
  }, [loadState, saveState]);

  /**
   * Handle sort change event
   */
  const onSortChange = useCallback((sort: { prop: string; order: 'ascending' | 'descending' | null }) => {
    const state = loadState() || {};
    if (sort.order) {
      saveState({ ...state, sort: { prop: sort.prop, order: sort.order } });
    } else {
      const { sort: _, ...rest } = state;
      saveState(rest);
    }
  }, [loadState, saveState]);

  return {
    saveState,
    loadState,
    deleteState,
    onHeaderDragend,
    onSortChange,
  };
};

export default useTableSaveState;

