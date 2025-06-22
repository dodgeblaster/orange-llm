const MODELS = {
  // Premier Models
  'mistral-medium-latest': {
    id: 'mistral-medium-latest',
    provider: 'mistral',
    displayName: 'Mistral Medium',
    description: 'State-of-the-art performance. Simplified enterprise deployments. Cost-efficient.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'magistral-medium-latest': {
    id: 'magistral-medium-latest',
    provider: 'mistral',
    displayName: 'Magistral Medium',
    description: 'Thinking model excelling in domain-specific, transparent, and multilingual reasoning.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'codestral-latest': {
    id: 'codestral-latest',
    provider: 'mistral',
    displayName: 'Codestral',
    description: 'Lightweight, fast, and proficient in over 80 programming languages.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'mistral-saba-latest': {
    id: 'mistral-saba-latest',
    provider: 'mistral',
    displayName: 'Mistral Saba',
    description: 'Custom-trained model to serve specific geographies, markets, and customers.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'mistral-large-latest': {
    id: 'mistral-large-latest',
    provider: 'mistral',
    displayName: 'Mistral Large',
    description: 'Top-tier reasoning for high-complexity tasks and sophisticated problems.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'ministral-8b-latest': {
    id: 'ministral-8b-latest',
    provider: 'mistral',
    displayName: 'Ministral 8B',
    description: 'Powerful model for on-device use cases.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'ministral-3b-latest': {
    id: 'ministral-3b-latest',
    provider: 'mistral',
    displayName: 'Ministral 3B',
    description: 'Most efficient edge model.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  
  // Open Models
  'mistral-small-latest': {
    id: 'mistral-small-latest',
    provider: 'mistral',
    displayName: 'Mistral Small',
    description: 'SOTA. Multimodal. Multilingual. Apache 2.0.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'magistral-small-latest': {
    id: 'magistral-small-latest',
    provider: 'mistral',
    displayName: 'Magistral Small',
    description: 'Thinking model excelling in domain-specific, transparent, and multilingual reasoning.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'devstral-small-2505': {
    id: 'devstral-small-2505',
    provider: 'mistral',
    displayName: 'Devstral',
    description: 'The best open-source model for coding agents.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'mistral-nemo': {
    id: 'mistral-nemo',
    provider: 'mistral',
    displayName: 'Mistral NeMo',
    description: 'State-of-the-art Mistral model trained specifically for code tasks.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'open-mistral-7b': {
    id: 'open-mistral-7b',
    provider: 'mistral',
    displayName: 'Mistral 7B',
    description: 'A 7B transformer model, fast-deployed and easily customisable.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'open-mixtral-8x7b': {
    id: 'open-mixtral-8x7b',
    provider: 'mistral',
    displayName: 'Mixtral 8x7B',
    description: 'A 7B sparse Mixture-of-Experts (SMoE). Uses 12.9B active parameters out of 45B total.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  },
  'open-mixtral-8x22b': {
    id: 'open-mixtral-8x22b',
    provider: 'mistral',
    displayName: 'Mixtral 8x22B',
    description: 'Mixtral 8x22B is currently the most performant open model. A 22B sparse Mixture-of-Experts (SMoE). Uses only 39B active parameters out of 141B.',
    maxTokens: 4096,
    defaultTemperature: 0.7,
    defaultTopP: 1.0
  }
};

export function getInferenceConfig(modelId) {
  const modelConfig = MODELS[modelId];

  if (!modelConfig) {
    throw new Error(`${modelId} is not supported`);
  }
  
  return {
    max_tokens: modelConfig?.maxTokens || 4096,
    temperature: modelConfig?.defaultTemperature || 0.7,
    top_p: modelConfig?.defaultTopP || 1.0
  };
}
