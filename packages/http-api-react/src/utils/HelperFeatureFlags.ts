/**
 * HelperFeatureFlags
 * Helper functions for feature flag operations
 * 
 * Migrated from: .old_project/packages/cyoda-ui-lib/src/helpers/HelperFeatureFlags.ts
 */

export default class HelperFeatureFlags {
  /**
   * Get feature flag value by name from environment variables
   */
  static getFeatureFlagByName(name: string): boolean {
    const value = import.meta.env[name];
    return [true, 1, 'true', '1'].includes(value);
  }

  /**
   * Check if ChatBot feature is enabled
   */
  static isChatBotEnabled(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_CHATBOT');
  }

  /**
   * Check if Models Info feature is enabled
   * When enabled, uses /platform-api/entity-info/fetch/models-info endpoint
   * which returns entity type information (BUSINESS/PERSISTENCE)
   */
  static isUseModelsInfo(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_USE_MODELS_INFO');
  }

  /**
   * Check if Entity Viewer should use JSON format
   */
  static isEntityViewerUseJson(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON');
  }

  /**
   * Check if Trino SQL Schema page is enabled
   */
  static isTrinoSqlSchemaEnabled(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_TRINO_SQL_SCHEMA');
  }

  /**
   * Check if Tasks page is enabled
   */
  static isTasksEnabled(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_TASKS');
  }
}

