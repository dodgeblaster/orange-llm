/**
 * LLM Configuration Manager
 * Centralizes configuration management for the LLM module
 */
import { ModelConfig } from './models';
import { TokenPricing } from './pricing';
/**
 * Configuration for LLM services
 */
export interface LLMConfig {
    region?: string;
    defaultModelId: string;
    inferenceDefaults: {
        maxTokens: number;
        temperature: number;
        topP: number;
    };
    enableTokenTracking: boolean;
    debug: boolean;
}
/**
 * LLM Configuration Manager
 * Manages configuration for LLM services
 */
export declare class LLMConfigManager {
    private static instance;
    private config;
    private constructor();
    /**
     * Get the singleton instance of the configuration manager
     */
    static getInstance(config?: Partial<LLMConfig>): LLMConfigManager;
    /**
     * Update the configuration
     */
    updateConfig(config: Partial<LLMConfig>): void;
    /**
     * Get the current configuration
     */
    getConfig(): LLMConfig;
    /**
     * Get the AWS region
     */
    getRegion(): string;
    /**
     * Get the default model ID
     */
    getDefaultModelId(): string;
    /**
     * Get model configuration by ID
     */
    getModelConfig(modelId: string): ModelConfig | undefined;
    /**
     * Get inference configuration for a model
     */
    getInferenceConfig(modelId?: string): any;
    /**
     * Get pricing for a model
     */
    getModelPricing(modelId: string): TokenPricing;
    /**
     * Calculate cost for tokens
     */
    calculateCost(modelId: string, inputTokens: number, outputTokens: number): {
        inputCost: string;
        outputCost: string;
        totalCost: string;
    };
    /**
     * Check if token tracking is enabled
     */
    isTokenTrackingEnabled(): boolean;
    /**
     * Check if debug mode is enabled
     */
    isDebugEnabled(): boolean;
}
