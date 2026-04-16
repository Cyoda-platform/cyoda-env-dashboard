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
    const value = (import.meta.env as Record<string, unknown>)[name];
    return [true, 1, 'true', '1'].includes(value as string | boolean | number);
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

  /**
   * Check if Cyoda Cloud mode is enabled.
   *
   * Returns true when EITHER VITE_FEATURE_FLAG_IS_CYODA_CLOUD or
   * VITE_FEATURE_FLAG_IS_CYODA_GO is truthy. Cyoda-go is a digital twin
   * of Cyoda Cloud, so any cyoda-go installation is also a cloud-mode
   * installation; the auto-implication is enforced here so a misconfigured
   * .env file (only IS_CYODA_GO=true) still produces correct cloud behavior.
   *
   * When enabled, uses Cyoda Cloud API endpoints:
   * - /model/export/SIMPLE_VIEW/{entityName}/{modelVersion} for entity models
   * - /entity/{entityId} for entity data
   * - /model/{entityName}/{modelVersion}/workflow/{export,import} for workflows
   */
  static isCyodaCloud(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_IS_CYODA_CLOUD')
      || this.isCyodaGo();
  }

  /**
   * Check if the cyoda-go backend is in use.
   * Cyoda-go is a digital twin of Cyoda Cloud that does not expose any
   * /platform-* endpoints. Implies isCyodaCloud() === true.
   */
  static isCyodaGo(): boolean {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_IS_CYODA_GO');
  }

  /**
   * Whether the Reporting feature is available in the current backend mode.
   * Reporting depends on /platform-* endpoints that do not exist on cyoda-go.
   */
  static isReportingAvailable(): boolean {
    return !this.isCyodaGo();
  }

  /**
   * Whether the Tasks feature is available in the current backend mode.
   * Tasks depends on /platform-* endpoints that do not exist on cyoda-go,
   * AND the existing VITE_FEATURE_FLAG_TASKS opt-in must remain in effect.
   */
  static isTasksAvailable(): boolean {
    return !this.isCyodaGo() && this.isTasksEnabled();
  }
}

