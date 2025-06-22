const MODELS = {
  'us.anthropic.claude-3-7-sonnet-20250219-v1:0': {
    id: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    provider: 'bedrock',
    displayName: 'Claude 3.7 Sonnet',
    description: 'Latest Claude model with improved reasoning',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'anthropic.claude-3-5-sonnet-20241022-v2:0': {
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    provider: 'bedrock',
    displayName: 'Claude 3.5 Sonnet',
    description: 'Balanced Claude model for general use',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'anthropic.claude-3-sonnet-20240229-v1:0': {
    id: 'anthropic.claude-3-sonnet-20240229-v1:0',
    provider: 'bedrock',
    displayName: 'Claude 3 Sonnet',
    description: 'Original Claude 3 model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'amazon.nova-pro-v1:0': {
    id: 'amazon.nova-pro-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Pro',
    description: 'High-performance Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'amazon.nova-lite-v1:0': {
    id: 'amazon.nova-lite-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Lite',
    description: 'Balanced Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'amazon.nova-micro-v1:0': {
    id: 'amazon.nova-micro-v1:0',
    provider: 'bedrock',
    displayName: 'Amazon Nova Micro',
    description: 'Cost-effective Amazon Nova model',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'us.amazon.nova-premier-v1:0': {
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  },
  'us.meta.llama3-3-70b-instruct-v1:0': {
    id: 'us.meta.llama3-3-70b-instruct-v1:0',
    provider: 'bedrock',
    displayName: 'Llama 3.3 70B',
    description: 'Latest Llama model with 70B parameters',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 0.9
  }
};


export function getInferenceConfig(modelId) {
  const modelConfig = MODELS[modelId];

  if (!modelConfig) {
    throw new Error(`${modelId} is not supported`)
  }
  
  return {
    maxTokens: modelConfig?.maxTokens || 2048,
    temperature: modelConfig?.defaultTemperature || 0.7,
    topP: modelConfig?.defaultTopP || 0.9
  };
}