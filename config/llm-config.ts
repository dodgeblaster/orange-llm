/**
 * LLM Configuration Manager
 * Centralizes configuration management for the LLM module
 */

import { DEFAULT_MODEL, ModelConfig, getInferenceConfig, getModelConfigById } from './models';
import { TokenPricing, getPricingByModelId, calculateCost } from './pricing';

/**
 * Configuration for LLM services
 */
export interface LLMConfig {
  // AWS configuration
  region?: string;
  
  // Model configuration
  defaultModelId: string;
  
  // Inference configuration
  inferenceDefaults: {
    maxTokens: number;
    temperature: number;
    topP: number;
  };
  
  // Token tracking configuration
  enableTokenTracking: boolean;
  
  // Debug configuration
  debug: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: LLMConfig = {
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
  private static instance: LLMConfigManager;
  private config: LLMConfig;
  
  private constructor(config: Partial<LLMConfig> = {}) {
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
   * Get the singleton instance of the configuration manager
   */
  public static getInstance(config?: Partial<LLMConfig>): LLMConfigManager {
    if (!LLMConfigManager.instance) {
      LLMConfigManager.instance = new LLMConfigManager(config);
    } else if (config) {
      // Update existing instance with new config
      LLMConfigManager.instance.updateConfig(config);
    }
    
    return LLMConfigManager.instance;
  }
  
  /**
   * Update the configuration
   */
  public updateConfig(config: Partial<LLMConfig>): void {
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
   */
  public getConfig(): LLMConfig {
    return { ...this.config };
  }
  
  /**
   * Get the AWS region
   */
  public getRegion(): string {
    return this.config.region || 'us-east-1';
  }
  
  /**
   * Get the default model ID
   */
  public getDefaultModelId(): string {
    return this.config.defaultModelId;
  }
  
  /**
   * Get model configuration by ID
   */
  public getModelConfig(modelId: string): ModelConfig | undefined {
    return getModelConfigById(modelId);
  }
  
  /**
   * Get inference configuration for a model
   */
  public getInferenceConfig(modelId?: string): any {
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
   */
  public getModelPricing(modelId: string): TokenPricing {
    return getPricingByModelId(modelId);
  }
  
  /**
   * Calculate cost for tokens
   */
  public calculateCost(modelId: string, inputTokens: number, outputTokens: number) {
    const pricing = this.getModelPricing(modelId);
    return calculateCost(pricing, inputTokens, outputTokens);
  }
  
  /**
   * Check if token tracking is enabled
   */
  public isTokenTrackingEnabled(): boolean {
    return this.config.enableTokenTracking;
  }
  
  /**
   * Check if debug mode is enabled
   */
  public isDebugEnabled(): boolean {
    return this.config.debug;
  }
}
