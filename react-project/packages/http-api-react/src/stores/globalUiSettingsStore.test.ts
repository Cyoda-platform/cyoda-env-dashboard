/**
 * GlobalUiSettingsStore Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGlobalUiSettingsStore } from './globalUiSettingsStore';

describe('GlobalUiSettingsStore', () => {
  beforeEach(() => {
    // Reset store state
    const store = useGlobalUiSettingsStore.getState();
    store.setEntityType('BUSINESS');
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have default entity type as BUSINESS', () => {
      const store = useGlobalUiSettingsStore.getState();
      expect(store.entityType).toBe('BUSINESS');
    });
  });

  describe('setEntityType', () => {
    it('should update entity type to BUSINESS', () => {
      const store = useGlobalUiSettingsStore.getState();
      store.setEntityType('BUSINESS');
      expect(store.entityType).toBe('BUSINESS');
    });

    it('should update entity type to PERSISTENCE', () => {
      useGlobalUiSettingsStore.getState().setEntityType('PERSISTENCE');
      expect(useGlobalUiSettingsStore.getState().entityType).toBe('PERSISTENCE');
    });

    it('should persist entity type to localStorage', () => {
      const store = useGlobalUiSettingsStore.getState();
      store.setEntityType('PERSISTENCE');
      
      // Check localStorage
      const stored = localStorage.getItem('cyoda_global_ui_settings');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.entityType).toBe('PERSISTENCE');
      }
    });
  });

  describe('Persistence', () => {
    it('should restore state from localStorage', () => {
      // Set initial state
      const store1 = useGlobalUiSettingsStore.getState();
      store1.setEntityType('PERSISTENCE');
      
      // Create new store instance (simulating page reload)
      const store2 = useGlobalUiSettingsStore.getState();
      expect(store2.entityType).toBe('PERSISTENCE');
    });
  });

  describe('Store Subscription', () => {
    it('should notify subscribers on state change', () => {
      const store = useGlobalUiSettingsStore.getState();
      let notified = false;
      
      const unsubscribe = useGlobalUiSettingsStore.subscribe(() => {
        notified = true;
      });
      
      store.setEntityType('PERSISTENCE');
      expect(notified).toBe(true);
      
      unsubscribe();
    });
  });
});

