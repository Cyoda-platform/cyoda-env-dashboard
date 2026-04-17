/**
 * HelperFeatureFlags Tests
 * Tests for feature flag utility functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import HelperFeatureFlags from './HelperFeatureFlags';

describe('HelperFeatureFlags', () => {
  // Snapshot original env values BY VALUE (not by reference) so afterEach can
  // genuinely restore them. Naïve `Object.assign(import.meta.env, originalEnv)`
  // with `originalEnv = import.meta.env` is a no-op because both sides are the
  // same object reference; tests would silently leak state into siblings.
  const originalEnv: Record<string, unknown> = { ...(import.meta.env as Record<string, unknown>) };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Delete any key the test added that wasn't in the original snapshot,
    // and restore every snapshot key to its original value (including undefined).
    const env = import.meta.env as Record<string, unknown>;
    for (const key of Object.keys(env)) {
      if (!(key in originalEnv)) {
        delete env[key];
      }
    }
    for (const key of Object.keys(originalEnv)) {
      env[key] = originalEnv[key];
    }
  });

  describe('getFeatureFlagByName', () => {
    it('should return true for boolean true value', () => {
      // Mock import.meta.env
      import.meta.env.TEST_FLAG = true as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(true);
    });

    it('should return true for number 1 value', () => {
      import.meta.env.TEST_FLAG = 1 as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(true);
    });

    it('should return true for string "true" value', () => {
      import.meta.env.TEST_FLAG = 'true' as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(true);
    });

    it('should return true for string "1" value', () => {
      import.meta.env.TEST_FLAG = '1' as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(true);
    });

    it('should return false for boolean false value', () => {
      import.meta.env.TEST_FLAG = false as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(false);
    });

    it('should return false for string "false" value', () => {
      import.meta.env.TEST_FLAG = 'false' as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(false);
    });

    it('should return false for undefined value', () => {
      delete (import.meta.env as any).UNDEFINED_FLAG;

      const result = HelperFeatureFlags.getFeatureFlagByName('UNDEFINED_FLAG');
      expect(result).toBe(false);
    });

    it('should return false for number 0 value', () => {
      import.meta.env.TEST_FLAG = 0 as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(false);
    });

    it('should return false for string "0" value', () => {
      import.meta.env.TEST_FLAG = '0' as any;

      const result = HelperFeatureFlags.getFeatureFlagByName('TEST_FLAG');
      expect(result).toBe(false);
    });
  });

  describe('isChatBotEnabled', () => {
    it('should return true when VITE_FEATURE_FLAG_CHATBOT is enabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_CHATBOT = true as any;

      const result = HelperFeatureFlags.isChatBotEnabled();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_CHATBOT is disabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_CHATBOT = false as any;

      const result = HelperFeatureFlags.isChatBotEnabled();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_CHATBOT is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_CHATBOT;

      const result = HelperFeatureFlags.isChatBotEnabled();
      expect(result).toBe(false);
    });
  });

  describe('isUseModelsInfo', () => {
    it('should return true when VITE_FEATURE_FLAG_USE_MODELS_INFO is enabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_USE_MODELS_INFO = true as any;

      const result = HelperFeatureFlags.isUseModelsInfo();
      expect(result).toBe(true);
    });

    it('should return true when VITE_FEATURE_FLAG_USE_MODELS_INFO is "true"', () => {
      import.meta.env.VITE_FEATURE_FLAG_USE_MODELS_INFO = 'true' as any;

      const result = HelperFeatureFlags.isUseModelsInfo();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_USE_MODELS_INFO is disabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_USE_MODELS_INFO = false as any;

      const result = HelperFeatureFlags.isUseModelsInfo();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_USE_MODELS_INFO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_USE_MODELS_INFO;

      const result = HelperFeatureFlags.isUseModelsInfo();
      expect(result).toBe(false);
    });
  });

  describe('isEntityViewerUseJson', () => {
    it('should return true when VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON is enabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON = true as any;

      const result = HelperFeatureFlags.isEntityViewerUseJson();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON is disabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON = false as any;

      const result = HelperFeatureFlags.isEntityViewerUseJson();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON;

      const result = HelperFeatureFlags.isEntityViewerUseJson();
      expect(result).toBe(false);
    });
  });

  describe('isTrinoSqlSchemaEnabled', () => {
    it('should return true when VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA is enabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA = true as any;

      const result = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
      expect(result).toBe(true);
    });

    it('should return true when VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA is "true"', () => {
      import.meta.env.VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA = 'true' as any;

      const result = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA is disabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA = false as any;

      const result = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA;

      const result = HelperFeatureFlags.isTrinoSqlSchemaEnabled();
      expect(result).toBe(false);
    });
  });

  describe('isTasksEnabled', () => {
    it('should return true when VITE_FEATURE_FLAG_TASKS is enabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = true as any;

      const result = HelperFeatureFlags.isTasksEnabled();
      expect(result).toBe(true);
    });

    it('should return true when VITE_FEATURE_FLAG_TASKS is "true"', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = 'true' as any;

      const result = HelperFeatureFlags.isTasksEnabled();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_TASKS is disabled', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = false as any;

      const result = HelperFeatureFlags.isTasksEnabled();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_TASKS is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_TASKS;

      const result = HelperFeatureFlags.isTasksEnabled();
      expect(result).toBe(false);
    });
  });

  describe('isCyodaGo', () => {
    it('should return true when VITE_FEATURE_FLAG_IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(true);
    });

    it('should return true when VITE_FEATURE_FLAG_IS_CYODA_GO is the string "true"', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = 'true' as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(true);
    });

    it('should return false when VITE_FEATURE_FLAG_IS_CYODA_GO is false', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = false as any;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(false);
    });

    it('should return false when VITE_FEATURE_FLAG_IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      const result = HelperFeatureFlags.isCyodaGo();
      expect(result).toBe(false);
    });
  });

  describe('isCyodaCloud auto-implication from isCyodaGo', () => {
    it('should return true when only IS_CYODA_CLOUD is set', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return true when only IS_CYODA_GO is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return true when both flags are set', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(true);
    });

    it('should return false when neither flag is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(false);
    });

    it('should return false when both flags are explicitly false', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = false as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = false as any;

      expect(HelperFeatureFlags.isCyodaCloud()).toBe(false);
    });
  });

  describe('isReportingAvailable', () => {
    it('should return true when IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isReportingAvailable()).toBe(true);
    });

    it('should return false when IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isReportingAvailable()).toBe(false);
    });
  });

  describe('isTasksAvailable', () => {
    it('should return true when TASKS flag is true and IS_CYODA_GO is not set', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = true as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(true);
    });

    it('should return false when TASKS flag is true but IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = true as any;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });

    it('should return false when TASKS flag is false', () => {
      import.meta.env.VITE_FEATURE_FLAG_TASKS = false as any;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });

    it('should return false when neither flag is set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_TASKS;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isTasksAvailable()).toBe(false);
    });
  });

  describe('isProcessingManagerAvailable', () => {
    it('should return true when IS_CYODA_GO is not set', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isProcessingManagerAvailable()).toBe(true);
    });

    it('should return false when IS_CYODA_GO is true', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isProcessingManagerAvailable()).toBe(false);
    });
  });

  describe('isCloudBusinessActive', () => {
    it('returns true when isCyodaCloud is true AND entityType is BUSINESS', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;

      expect(HelperFeatureFlags.isCloudBusinessActive('BUSINESS')).toBe(true);
    });

    it('returns true under cyoda-go (which implies cloud) with BUSINESS', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_GO = true as any;

      expect(HelperFeatureFlags.isCloudBusinessActive('BUSINESS')).toBe(true);
    });

    it('returns false when entityType is PERSISTENCE even in cloud mode', () => {
      import.meta.env.VITE_FEATURE_FLAG_IS_CYODA_CLOUD = true as any;

      expect(HelperFeatureFlags.isCloudBusinessActive('PERSISTENCE')).toBe(false);
    });

    it('returns false in legacy mode regardless of entityType', () => {
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_CLOUD;
      delete (import.meta.env as any).VITE_FEATURE_FLAG_IS_CYODA_GO;

      expect(HelperFeatureFlags.isCloudBusinessActive('BUSINESS')).toBe(false);
      expect(HelperFeatureFlags.isCloudBusinessActive('PERSISTENCE')).toBe(false);
    });

    it('does NOT export the old name isCloudWorkflowsActive (catches a botched merge that re-introduces it)', () => {
      expect((HelperFeatureFlags as any).isCloudWorkflowsActive).toBeUndefined();
    });
  });
});

