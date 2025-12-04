/**
 * HelperFeatureFlags Tests
 * Tests for feature flag utility functions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import HelperFeatureFlags from './HelperFeatureFlags';

describe('HelperFeatureFlags', () => {
  const originalEnv = import.meta.env;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    Object.assign(import.meta.env, originalEnv);
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
});

