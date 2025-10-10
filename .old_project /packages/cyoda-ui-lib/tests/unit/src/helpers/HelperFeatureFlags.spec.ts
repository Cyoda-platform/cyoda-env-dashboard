import { describe, it, expect, vi, beforeEach } from 'vitest';
import HelperFeatureFlags from '../../../../src/helpers/HelperFeatureFlags';

vi.mock('../../../src/helpers/HelperFeatureFlags', () => ({
  default: {
    getFeatureFlagByName: vi.fn(),
    isChatBotEnabled: vi.fn(),
    isUseModelsInfo: vi.fn(),
  },
}));

describe('HelperFeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeatureFlagByName', () => {
    it('should return true for valid truthy values', () => {
      vi.spyOn(HelperFeatureFlags, 'getFeatureFlagByName').mockImplementation((name) => {
        if (['FEATURE_FLAG_TRUE', 'FEATURE_FLAG_1', 'FEATURE_FLAG_STRING_TRUE', 'FEATURE_FLAG_STRING_1'].includes(name)) {
          return true;
        }
        return false;
      });

      expect(HelperFeatureFlags.getFeatureFlagByName('FEATURE_FLAG_TRUE')).toBe(true);
      expect(HelperFeatureFlags.getFeatureFlagByName('FEATURE_FLAG_1')).toBe(true);
      expect(HelperFeatureFlags.getFeatureFlagByName('FEATURE_FLAG_STRING_TRUE')).toBe(true);
      expect(HelperFeatureFlags.getFeatureFlagByName('FEATURE_FLAG_STRING_1')).toBe(true);
    });

    it('should return false for invalid or falsy values', () => {
      vi.spyOn(HelperFeatureFlags, 'getFeatureFlagByName').mockImplementation(() => false);

      expect(HelperFeatureFlags.getFeatureFlagByName('FEATURE_FLAG_FALSE')).toBe(false);
      expect(HelperFeatureFlags.getFeatureFlagByName('UNDEFINED_FLAG')).toBe(false);
    });
  });

  describe('isChatBotEnabled', () => {
    it('should return true if the chatbot feature flag is enabled', () => {
      vi.spyOn(HelperFeatureFlags, 'isChatBotEnabled').mockReturnValue(true);

      expect(HelperFeatureFlags.isChatBotEnabled()).toBe(true);
    });

    it('should return false if the chatbot feature flag is disabled', () => {
      vi.spyOn(HelperFeatureFlags, 'isChatBotEnabled').mockReturnValue(false);

      expect(HelperFeatureFlags.isChatBotEnabled()).toBe(false);
    });
  });

  describe('isUseModelsInfo', () => {
    it('should return true if the meta model feature flag is enabled', () => {
      vi.spyOn(HelperFeatureFlags, 'isUseModelsInfo').mockReturnValue(true);

      expect(HelperFeatureFlags.isUseModelsInfo()).toBe(true);
    });

    it('should return false if the meta model feature flag is disabled', () => {
      vi.spyOn(HelperFeatureFlags, 'isUseModelsInfo').mockReturnValue(false);

      expect(HelperFeatureFlags.isUseModelsInfo()).toBe(false);
    });
  });
});
