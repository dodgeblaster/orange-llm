import { DEFAULT_MODEL, getInferenceConfig, getModelConfigById } from './models.mjs';
import { getModelPricing, calculateCost } from './pricing.mjs';

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  region: 'us-east-1',
  defaultModelId: DEFAULT_MODEL,
  inferenceDefaults: {
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9
  },
  enableTokenTracking: true,
  debug: false
};

/**
 * LLM Configuration Manager
 * Manages configuration for LLM services
 */
export class LLMConfigManager {
  /**
   * @param {Partial<LLMConfig>} [config] - Initial configuration
   */
  constructor(config = {}) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      inferenceDefaults: {
        ...DEFAULT_CONFIG.inferenceDefaults,
        ...(config.inferenceDefaults || {})
      }
    };
  }
  
  /**
   * Create a new LLMConfigManager instance with the given configuration
   * @param {Partial<LLMConfig>} [config] - Configuration to use
   * @returns {LLMConfigManager} A new configuration manager instance
   */
  static create(config = {}) {
    return new LLMConfigManager(config);
  }
  
  /**
   * Update the configuration
   * @param {Partial<LLMConfig>} config - Configuration to update
   */
  updateConfig(config) {
    this.config = {
      ...this.config,
      ...config,
      inferenceDefaults: {
        ...this.config.inferenceDefaults,
        ...(config.inferenceDefaults || {})
      }
    };
  }
  
  /**
   * Get the current configuration
   * @returns {LLMConfig} The current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Get the AWS region
   * @returns {string} The AWS region
   */
  getRegion() {
    return this.config.region || 'us-east-1';
  }
  
  /**
   * Get the default model ID
   * @returns {string} The default model ID
   */
  getDefaultModelId() {
    return this.config.defaultModelId;
  }
  
  /**
   * Get model configuration by ID
   * @param {string} modelId - The model ID
   * @returns {ModelConfig|undefined} The model configuration
   */
  getModelConfig(modelId) {
    return getModelConfigById(modelId);
  }
  
  /**
   * Get inference configuration for a model
   * @param {string} [modelId] - The model ID
   * @returns {Object} The inference configuration
   */
  getInferenceConfig(modelId) {
    const targetModelId = modelId || this.config.defaultModelId;
    const modelInferenceConfig = getInferenceConfig(targetModelId);
    
    // Merge with default inference config
    return {
      ...this.config.inferenceDefaults,
      ...modelInferenceConfig
    };
  }
  
  /**
   * Get pricing for a model
   * @param {string} modelId - The model ID
   * @returns {ModelPricing} The pricing information
   */
  getModelPricing(modelId) {
    return getModelPricing(modelId);
  }
  
  /**
   * Calculate cost for tokens
   * @param {string} modelId - The model ID
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @returns {{inputCost: string, outputCost: string, totalCost: string}} The calculated costs
   */
  calculateCost(modelId, inputTokens, outputTokens) {
    return calculateCost(modelId, inputTokens, outputTokens);
  }
  
  /**
   * Check if token tracking is enabled
   * @returns {boolean} Whether token tracking is enabled
   */
  isTokenTrackingEnabled() {
    return this.config.enableTokenTracking;
  }
  
  /**
   * Check if debug mode is enabled
   * @returns {boolean} Whether debug mode is enabled
   */
  isDebugEnabled() {
    return this.config.debug;
  }
}
