/**
 * Table State Persistence Hook
 * Saves and restores table state (sorting, column widths, pagination, filters)
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/mixins/TableSaveStateMixin.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TableProps, SorterResult } from 'antd/es/table/interface';

interface TableState {
  currentPage?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend' | null;
  filters?: Record<string, any>;
  [key: string]: any;
}

interface UseTableStateOptions {
  storageKey: string;
  defaultPageSize?: number;
  syncWithUrl?: boolean;
}

/**
 * Hook to persist table state in localStorage and URL
 * 
 * @param options - Configuration options
 * @returns Table state and handlers
 * 
 * @example
 * ```tsx
 * const { tableState, handleTableChange, setFilter } = useTableState({
 *   storageKey: 'workflowsTable',
 *   defaultPageSize: 10,
 *   syncWithUrl: true,
 * });
 * 
 * <Table
 *   pagination={{
 *     current: tableState.currentPage,
 *     pageSize: tableState.pageSize,
 *     onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
 *   }}
 *   onChange={(pagination, filters, sorter) => handleTableChange(pagination, filters, sorter)}
 * />
 * ```
 */
export function useTableState(options: UseTableStateOptions) {
  const { storageKey, defaultPageSize = 10, syncWithUrl = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from localStorage or URL
  const getInitialState = useCallback((): TableState => {
    // Try to get from URL first (if syncWithUrl is enabled)
    if (syncWithUrl) {
      const urlState: TableState = {};
      
      const currentPage = searchParams.get('currentPage');
      const pageSize = searchParams.get('pageSize');
      const sortField = searchParams.get('sortField');
      const sortOrder = searchParams.get('sortOrder');
      const filter = searchParams.get('filter');
      
      if (currentPage) urlState.currentPage = parseInt(currentPage, 10);
      if (pageSize) urlState.pageSize = parseInt(pageSize, 10);
      if (sortField) urlState.sortField = sortField;
      if (sortOrder) urlState.sortOrder = sortOrder as 'ascend' | 'descend';
      if (filter) urlState.filter = filter;
      
      if (Object.keys(urlState).length > 0) {
        return {
          currentPage: 1,
          pageSize: defaultPageSize,
          ...urlState,
        };
      }
    }

    // Try to get from localStorage
    try {
      const stored = localStorage.getItem(`tableSaveState:${storageKey}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load table state from localStorage:', error);
    }

    // Return default state
    return {
      currentPage: 1,
      pageSize: defaultPageSize,
      sortField: undefined,
      sortOrder: null,
      filters: {},
    };
  }, [storageKey, defaultPageSize, syncWithUrl, searchParams]);

  const [tableState, setTableState] = useState<TableState>(getInitialState);

  // Save state to localStorage
  const saveToStorage = useCallback((state: TableState) => {
    try {
      localStorage.setItem(`tableSaveState:${storageKey}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save table state to localStorage:', error);
    }
  }, [storageKey]);

  // Save state to URL
  const saveToUrl = useCallback((state: TableState) => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(searchParams);
    
    // Update URL params
    if (state.currentPage !== undefined) {
      params.set('currentPage', state.currentPage.toString());
    }
    if (state.pageSize !== undefined) {
      params.set('pageSize', state.pageSize.toString());
    }
    if (state.sortField) {
      params.set('sortField', state.sortField);
    }
    if (state.sortOrder) {
      params.set('sortOrder', state.sortOrder);
    } else {
      params.delete('sortOrder');
    }
    if (state.filter) {
      params.set('filter', state.filter);
    } else {
      params.delete('filter');
    }

    setSearchParams(params, { replace: true });
  }, [syncWithUrl, searchParams, setSearchParams]);

  // Update table state
  const updateTableState = useCallback((updates: Partial<TableState>) => {
    setTableState((prev) => {
      const newState = { ...prev, ...updates };
      saveToStorage(newState);
      saveToUrl(newState);
      return newState;
    });
  }, [saveToStorage, saveToUrl]);

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = useCallback((
    pagination?: any,
    filters?: Record<string, any>,
    sorter?: SorterResult<any> | SorterResult<any>[]
  ) => {
    const updates: Partial<TableState> = {};

    if (pagination) {
      if (pagination.current !== undefined) {
        updates.currentPage = pagination.current;
      }
      if (pagination.pageSize !== undefined) {
        updates.pageSize = pagination.pageSize;
      }
    }

    if (filters) {
      updates.filters = filters;
    }

    if (sorter && !Array.isArray(sorter)) {
      updates.sortField = sorter.field as string;
      updates.sortOrder = sorter.order || null;
    }

    updateTableState(updates);
  }, [updateTableState]);

  // Set filter value
  const setFilter = useCallback((filter: string) => {
    updateTableState({ filter, currentPage: 1 }); // Reset to page 1 when filtering
  }, [updateTableState]);

  // Reset table state
  const resetTableState = useCallback(() => {
    const defaultState: TableState = {
      currentPage: 1,
      pageSize: defaultPageSize,
      sortField: undefined,
      sortOrder: null,
      filters: {},
    };
    setTableState(defaultState);
    saveToStorage(defaultState);
    if (syncWithUrl) {
      setSearchParams({}, { replace: true });
    }
  }, [defaultPageSize, saveToStorage, syncWithUrl, setSearchParams]);

  return {
    tableState,
    handleTableChange,
    setFilter,
    updateTableState,
    resetTableState,
  };
}

