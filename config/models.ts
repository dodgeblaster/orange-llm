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
  models: string[]; // Array of model IDs
  description?: string;
}

/**
 * Claude models
 */
export const CLAUDE_MODELS: Record<string, ModelConfig> = {
  'claude-3-7-sonnet': {
    id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    provider: 'bedrock',
    displayName: 'Claude 3.7 Sonnet',
    description: 'Latest Claude model with improved reasoning',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'claude-3-5-sonnet': {
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    provider: 'bedrock',
    displayName: 'Claude 3.5 Sonnet',
    description: 'Balanced Claude model for general use',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'claude-3-sonnet': {
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    provider: 'bedrock',
    displayName: 'Claude 3 Sonnet',
    description: 'Original Claude 3 model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  }
};

/**
 * Amazon Nova models
 */
export const NOVA_MODELS: Record<string, ModelConfig> = {
  'nova-pro': {
    id: 'amazon.nova-pro-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Pro',
    description: 'High-performance Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'nova-lite': {
    id: 'amazon.nova-lite-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Lite',
    description: 'Balanced Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'nova-micro': {
    id: 'amazon.nova-micro-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Micro',
    description: 'Cost-effective Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  }
};

/**
 * Meta Llama models
 */
export const LLAMA_MODELS: Record<string, ModelConfig> = {
  'llama-3-3': {
    id: 'us.meta.llama3-3-70b-instruct-v1:0',
    provider: 'bedrock',
    displayName: 'Llama 3.3 70B',
    description: 'Latest Llama model with 70B parameters',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  }
};

/**
 * Model groups for fallback chains
 */
export const MODEL_GROUPS: Record<string, ModelGroup> = {
  'claude': {
    name: 'Claude Models',
    models: Object.values(CLAUDE_MODELS).map(model => model.id),
    description: 'Anthropic Claude models in order of preference'
  },
  'nova': {
    name: 'Nova Models',
    models: Object.values(NOVA_MODELS).map(model => model.id),
    description: 'Amazon Nova models in order of preference'
  },
  'llama': {
    name: 'Llama Models',
    models: Object.values(LLAMA_MODELS).map(model => model.id),
    description: 'Meta Llama models in order of preference'
  }
};

/**
 * All available models
 */
export const ALL_MODELS: Record<string, ModelConfig> = {
  ...CLAUDE_MODELS,
  ...NOVA_MODELS,
  ...LLAMA_MODELS
};

/**
 * Default model to use if none specified
 */
export const DEFAULT_MODEL = NOVA_MODELS['nova-micro'].id;

/**
 * Get model config by ID
 */
export function getModelConfigById(modelId: string): ModelConfig | undefined {
  return Object.values(ALL_MODELS).find(model => model.id === modelId);
}

/**
 * Get inference config for a model
 */
export function getInferenceConfig(modelId: string): any {
  const modelConfig = getModelConfigById(modelId);
  
  return {
    maxTokens: modelConfig?.maxTokens || 2048,
    temperature: modelConfig?.defaultTemperature || 0.7,
    topP: modelConfig?.defaultTopP || 0.9
  };
}
