/**
 * Tests for Reports Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useReportsStore } from './reportsStore';
import type { ReportSettings } from './reportsStore';

describe('reportsStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    useReportsStore.getState().clearReportsSettings();
  });

  describe('Initial State', () => {
    it('should have empty reportsSettings array initially', () => {
      const state = useReportsStore.getState();
      expect(state.reportsSettings).toEqual([]);
    });
  });

  describe('setReportsSettings', () => {
    it('should add new report settings', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      const state = useReportsStore.getState();
      expect(state.reportsSettings).toHaveLength(1);
      expect(state.reportsSettings[0]).toEqual(settings);
    });

    it('should update existing report settings', () => {
      const initialSettings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(initialSettings);

      const updatedSettings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'value',
        },
      };

      useReportsStore.getState().setReportsSettings(updatedSettings);

      const state = useReportsStore.getState();
      expect(state.reportsSettings).toHaveLength(1);
      expect(state.reportsSettings[0]).toEqual(updatedSettings);
    });

    it('should handle multiple reports', () => {
      const settings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      const settings2: ReportSettings = {
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      };

      const settings3: ReportSettings = {
        id: 'report-3',
        settings: {
          idField: 'status',
        },
      };

      useReportsStore.getState().setReportsSettings(settings1);
      useReportsStore.getState().setReportsSettings(settings2);
      useReportsStore.getState().setReportsSettings(settings3);

      const state = useReportsStore.getState();
      expect(state.reportsSettings).toHaveLength(3);
      expect(state.reportsSettings[0]).toEqual(settings1);
      expect(state.reportsSettings[1]).toEqual(settings2);
      expect(state.reportsSettings[2]).toEqual(settings3);
    });

    it('should preserve other reports when updating one', () => {
      const settings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      const settings2: ReportSettings = {
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      };

      useReportsStore.getState().setReportsSettings(settings1);
      useReportsStore.getState().setReportsSettings(settings2);

      const updatedSettings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'status',
        },
      };

      useReportsStore.getState().setReportsSettings(updatedSettings1);

      const state = useReportsStore.getState();
      expect(state.reportsSettings).toHaveLength(2);
      expect(state.reportsSettings[0]).toEqual(updatedSettings1);
      expect(state.reportsSettings[1]).toEqual(settings2);
    });
  });

  describe('getStoredSettings', () => {
    it('should return undefined for non-existent report', () => {
      const result = useReportsStore.getState().getStoredSettings('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return settings for existing report', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      const result = useReportsStore.getState().getStoredSettings('report-1');
      expect(result).toEqual(settings);
    });

    it('should return correct settings for specific report among multiple', () => {
      const settings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      const settings2: ReportSettings = {
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      };

      const settings3: ReportSettings = {
        id: 'report-3',
        settings: {
          idField: 'status',
        },
      };

      useReportsStore.getState().setReportsSettings(settings1);
      useReportsStore.getState().setReportsSettings(settings2);
      useReportsStore.getState().setReportsSettings(settings3);

      expect(useReportsStore.getState().getStoredSettings('report-1')).toEqual(settings1);
      expect(useReportsStore.getState().getStoredSettings('report-2')).toEqual(settings2);
      expect(useReportsStore.getState().getStoredSettings('report-3')).toEqual(settings3);
    });
  });

  describe('clearReportsSettings', () => {
    it('should clear all settings', () => {
      const settings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      const settings2: ReportSettings = {
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      };

      useReportsStore.getState().setReportsSettings(settings1);
      useReportsStore.getState().setReportsSettings(settings2);

      expect(useReportsStore.getState().reportsSettings).toHaveLength(2);

      useReportsStore.getState().clearReportsSettings();

      expect(useReportsStore.getState().reportsSettings).toEqual([]);
    });

    it('should allow adding settings after clearing', () => {
      const settings1: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(settings1);
      useReportsStore.getState().clearReportsSettings();

      const settings2: ReportSettings = {
        id: 'report-2',
        settings: {
          idField: 'value',
        },
      };

      useReportsStore.getState().setReportsSettings(settings2);

      const state = useReportsStore.getState();
      expect(state.reportsSettings).toHaveLength(1);
      expect(state.reportsSettings[0]).toEqual(settings2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty idField', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: '',
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      const result = useReportsStore.getState().getStoredSettings('report-1');
      expect(result?.settings.idField).toBe('');
    });

    it('should handle undefined idField', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: undefined,
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      const result = useReportsStore.getState().getStoredSettings('report-1');
      expect(result?.settings.idField).toBeUndefined();
    });

    it('should handle empty settings object', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {},
      };

      useReportsStore.getState().setReportsSettings(settings);

      const result = useReportsStore.getState().getStoredSettings('report-1');
      expect(result?.settings).toEqual({});
    });

    it('should handle special characters in report ID', () => {
      const settings: ReportSettings = {
        id: 'report-with-special-chars-123_abc',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      const result = useReportsStore.getState().getStoredSettings('report-with-special-chars-123_abc');
      expect(result).toEqual(settings);
    });
  });

  describe('Persistence', () => {
    it('should persist settings to localStorage', () => {
      const settings: ReportSettings = {
        id: 'report-1',
        settings: {
          idField: 'name',
        },
      };

      useReportsStore.getState().setReportsSettings(settings);

      // Check localStorage
      const stored = localStorage.getItem('cyoda_reports_settings');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.reportsSettings).toHaveLength(1);
        expect(parsed.state.reportsSettings[0]).toEqual(settings);
      }
    });
  });
});

