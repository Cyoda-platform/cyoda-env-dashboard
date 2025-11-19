/**
 * Tests for useTableState hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { useTableState } from './useTableState';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useTableState', () => {
  beforeEach(() => {
    localStorageMock.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(BrowserRouter, {}, children);

  it('should initialize with default state', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    expect(result.current.tableState.currentPage).toBe(1);
    expect(result.current.tableState.pageSize).toBe(10);
    // sortField and sortOrder can be undefined or null when not set
    expect(result.current.tableState.sortField).toBeFalsy();
    expect(result.current.tableState.sortOrder).toBeFalsy();
  });

  it('should update table state', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    act(() => {
      result.current.updateTableState({ currentPage: 2, pageSize: 20 });
    });

    expect(result.current.tableState.currentPage).toBe(2);
    expect(result.current.tableState.pageSize).toBe(20);
  });

  it('should persist state to localStorage', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    act(() => {
      result.current.updateTableState({ currentPage: 3, pageSize: 50 });
    });

    const stored = localStorage.getItem('tableSaveState:test-table');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.currentPage).toBe(3);
    expect(parsed.pageSize).toBe(50);
  });

  it('should restore state from localStorage', () => {
    // Set initial state in localStorage
    localStorage.setItem(
      'tableSaveState:test-table',
      JSON.stringify({ currentPage: 5, pageSize: 25 })
    );

    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    expect(result.current.tableState.currentPage).toBe(5);
    expect(result.current.tableState.pageSize).toBe(25);
  });

  it('should handle table change event', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    act(() => {
      result.current.handleTableChange(
        { current: 2, pageSize: 20 },
        {},
        { field: 'name', order: 'ascend' }
      );
    });

    expect(result.current.tableState.currentPage).toBe(2);
    expect(result.current.tableState.pageSize).toBe(20);
    expect(result.current.tableState.sortField).toBe('name');
    expect(result.current.tableState.sortOrder).toBe('ascend');
  });

  it('should set filter', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    act(() => {
      result.current.setFilter('test filter');
    });

    expect(result.current.tableState.filter).toBe('test filter');
    expect(result.current.tableState.currentPage).toBe(1); // Should reset to page 1
  });

  it('should reset table state', () => {
    const { result } = renderHook(
      () => useTableState({ storageKey: 'test-table', defaultPageSize: 10 }),
      { wrapper }
    );

    // Set some state
    act(() => {
      result.current.updateTableState({ currentPage: 5, pageSize: 50 });
    });

    // Reset
    act(() => {
      result.current.resetTableState();
    });

    expect(result.current.tableState.currentPage).toBe(1);
    expect(result.current.tableState.pageSize).toBe(10);
  });

  it('should not sync to URL when syncWithUrl is false', () => {
    const { result } = renderHook(
      () =>
        useTableState({
          storageKey: 'test-table',
          defaultPageSize: 10,
          syncWithUrl: false,
        }),
      { wrapper }
    );

    act(() => {
      result.current.updateTableState({ currentPage: 3 });
    });

    // URL should not contain pagination params
    expect(window.location.search).not.toContain('currentPage');
  });

  it('should sync to URL when syncWithUrl is true', () => {
    const { result } = renderHook(
      () =>
        useTableState({
          storageKey: 'test-table',
          defaultPageSize: 10,
          syncWithUrl: true,
        }),
      { wrapper }
    );

    act(() => {
      result.current.updateTableState({ currentPage: 3, pageSize: 25 });
    });

    // URL should contain pagination params
    expect(window.location.search).toContain('currentPage=3');
    expect(window.location.search).toContain('pageSize=25');
  });

  it('should restore state from URL when syncWithUrl is true', () => {
    // Set URL params
    window.history.pushState({}, '', '/?currentPage=4&pageSize=30');

    const { result } = renderHook(
      () =>
        useTableState({
          storageKey: 'test-table',
          defaultPageSize: 10,
          syncWithUrl: true,
        }),
      { wrapper }
    );

    expect(result.current.tableState.currentPage).toBe(4);
    expect(result.current.tableState.pageSize).toBe(30);
  });

  it('should prioritize URL params over localStorage', () => {
    // Set localStorage
    localStorage.setItem(
      'tableSaveState:test-table',
      JSON.stringify({ currentPage: 2, pageSize: 20 })
    );

    // Set URL params (should take priority)
    window.history.pushState({}, '', '/?currentPage=5&pageSize=50');

    const { result } = renderHook(
      () =>
        useTableState({
          storageKey: 'test-table',
          defaultPageSize: 10,
          syncWithUrl: true,
        }),
      { wrapper }
    );

    expect(result.current.tableState.currentPage).toBe(5);
    expect(result.current.tableState.pageSize).toBe(50);
  });
});

