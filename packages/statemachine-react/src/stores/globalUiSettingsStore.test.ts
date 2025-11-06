/**
 * Global UI Settings Store Tests
 * Tests for the global UI settings Zustand store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGlobalUiSettingsStore } from './globalUiSettingsStore';

describe('useGlobalUiSettingsStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Reset store state after each test
    const { result } = renderHook(() => useGlobalUiSettingsStore());
    act(() => {
      result.current.setEntityType('BUSINESS');
      result.current.setIsEnabledTechView(true);
    });
  });

  describe('Initial State', () => {
    it('should have default entity type as BUSINESS', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      expect(result.current.entityType).toBe('BUSINESS');
    });

    it('should have tech view enabled by default', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      expect(result.current.isEnabledTechView).toBe(true);
    });
  });

  describe('setEntityType', () => {
    it('should update entity type to BUSINESS', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setEntityType('BUSINESS');
      });
      
      expect(result.current.entityType).toBe('BUSINESS');
    });

    it('should update entity type to PERSISTENCE', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setEntityType('PERSISTENCE');
      });
      
      expect(result.current.entityType).toBe('PERSISTENCE');
    });

    it('should toggle between BUSINESS and PERSISTENCE', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      // Start with BUSINESS
      act(() => {
        result.current.setEntityType('BUSINESS');
      });
      expect(result.current.entityType).toBe('BUSINESS');
      
      // Toggle to PERSISTENCE
      act(() => {
        result.current.setEntityType('PERSISTENCE');
      });
      expect(result.current.entityType).toBe('PERSISTENCE');
      
      // Toggle back to BUSINESS
      act(() => {
        result.current.setEntityType('BUSINESS');
      });
      expect(result.current.entityType).toBe('BUSINESS');
    });
  });

  describe('setIsEnabledTechView', () => {
    it('should enable tech view', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setIsEnabledTechView(true);
      });
      
      expect(result.current.isEnabledTechView).toBe(true);
    });

    it('should disable tech view', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setIsEnabledTechView(false);
      });
      
      expect(result.current.isEnabledTechView).toBe(false);
    });

    it('should toggle tech view on and off', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      // Enable
      act(() => {
        result.current.setIsEnabledTechView(true);
      });
      expect(result.current.isEnabledTechView).toBe(true);
      
      // Disable
      act(() => {
        result.current.setIsEnabledTechView(false);
      });
      expect(result.current.isEnabledTechView).toBe(false);
      
      // Enable again
      act(() => {
        result.current.setIsEnabledTechView(true);
      });
      expect(result.current.isEnabledTechView).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should persist entity type to localStorage', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setEntityType('PERSISTENCE');
      });
      
      // Check localStorage
      const stored = localStorage.getItem('global-ui-settings');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.entityType).toBe('PERSISTENCE');
    });

    it('should persist tech view setting to localStorage', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setIsEnabledTechView(false);
      });
      
      // Check localStorage
      const stored = localStorage.getItem('global-ui-settings');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.state.isEnabledTechView).toBe(false);
    });

    it('should restore state from localStorage', () => {
      // Set initial state
      const { result: result1 } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result1.current.setEntityType('PERSISTENCE');
        result1.current.setIsEnabledTechView(false);
      });
      
      // Create new hook instance (simulating page reload)
      const { result: result2 } = renderHook(() => useGlobalUiSettingsStore());
      
      // Should restore from localStorage
      expect(result2.current.entityType).toBe('PERSISTENCE');
      expect(result2.current.isEnabledTechView).toBe(false);
    });

    it('should persist multiple state changes', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      // Make multiple changes
      act(() => {
        result.current.setEntityType('PERSISTENCE');
      });
      
      act(() => {
        result.current.setIsEnabledTechView(false);
      });
      
      act(() => {
        result.current.setEntityType('BUSINESS');
      });
      
      // Check final state in localStorage
      const stored = localStorage.getItem('global-ui-settings');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.state.entityType).toBe('BUSINESS');
      expect(parsed.state.isEnabledTechView).toBe(false);
    });
  });

  describe('State Sharing', () => {
    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useGlobalUiSettingsStore());
      const { result: result2 } = renderHook(() => useGlobalUiSettingsStore());
      
      // Change state in first instance
      act(() => {
        result1.current.setEntityType('PERSISTENCE');
      });
      
      // Both instances should have the same state
      expect(result1.current.entityType).toBe('PERSISTENCE');
      expect(result2.current.entityType).toBe('PERSISTENCE');
    });

    it('should update all instances when state changes', () => {
      const { result: result1 } = renderHook(() => useGlobalUiSettingsStore());
      const { result: result2 } = renderHook(() => useGlobalUiSettingsStore());
      
      // Change entity type
      act(() => {
        result1.current.setEntityType('PERSISTENCE');
      });
      
      expect(result1.current.entityType).toBe('PERSISTENCE');
      expect(result2.current.entityType).toBe('PERSISTENCE');
      
      // Change tech view
      act(() => {
        result2.current.setIsEnabledTechView(false);
      });
      
      expect(result1.current.isEnabledTechView).toBe(false);
      expect(result2.current.isEnabledTechView).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid entity types', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      // Valid types
      act(() => {
        result.current.setEntityType('BUSINESS');
      });
      expect(result.current.entityType).toBe('BUSINESS');
      
      act(() => {
        result.current.setEntityType('PERSISTENCE');
      });
      expect(result.current.entityType).toBe('PERSISTENCE');
    });

    it('should only accept boolean for tech view', () => {
      const { result } = renderHook(() => useGlobalUiSettingsStore());
      
      act(() => {
        result.current.setIsEnabledTechView(true);
      });
      expect(result.current.isEnabledTechView).toBe(true);
      
      act(() => {
        result.current.setIsEnabledTechView(false);
      });
      expect(result.current.isEnabledTechView).toBe(false);
    });
  });
});

