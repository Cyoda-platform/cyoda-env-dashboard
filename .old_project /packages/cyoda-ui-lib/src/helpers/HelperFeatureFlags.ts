export default class HelperFeatureFlags {
  static getFeatureFlagByName(name: string): boolean {
    return [true, 1, 'true', '1'].includes(import.meta.env[name]);
  }

  static isChatBotEnabled() {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_CHATBOT')
  }

  static isUseModelsInfo() {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_USE_MODELS_INFO')
  }

  static isEntityViewerUseJson() {
    return this.getFeatureFlagByName('VITE_FEATURE_FLAG_ENTITY_VIEWER_USE_JSON')
  }
}
