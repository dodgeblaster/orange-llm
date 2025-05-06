/**
 * Model configuration for LLM services
 * This file centralizes all model-related configuration
 */
export interface ModelConfig {
    id: string;
    provider: 'bedrock' | 'ollama';
    displayName: string;
    description?: string;
    maxTokens?: number;
    defaultTemperature?: number;
    defaultTopP?: number;
}
export interface ModelGroup {
    name: string;
    models: string[];
    description?: string;
}
/**
 * Claude models
 */
export declare const CLAUDE_MODELS: Record<string, ModelConfig>;
/**
 * Amazon Nova models
 */
export declare const NOVA_MODELS: Record<string, ModelConfig>;
/**
 * Meta Llama models
 */
export declare const LLAMA_MODELS: Record<string, ModelConfig>;
/**
 * Model groups for fallback chains
 */
export declare const MODEL_GROUPS: Record<string, ModelGroup>;
/**
 * All available models
 */
export declare const ALL_MODELS: Record<string, ModelConfig>;
/**
 * Default model to use if none specified
 */
export declare const DEFAULT_MODEL: string;
/**
 * Get model config by ID
 */
export declare function getModelConfigById(modelId: string): ModelConfig | undefined;
/**
 * Get inference config for a model
 */
export declare function getInferenceConfig(modelId: string): any;
