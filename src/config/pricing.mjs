/**
 * Pricing configuration for LLM services
 * This file centralizes all pricing-related configuration
 * 
 * @typedef {import('../types').ModelPricing} ModelPricing
 */

/**
 * Format a price to a string with 4 decimal places
 * @param {number} price - The price to format
 * @returns {string} The formatted price
 */
function formatPrice(price) {
  return price.toFixed(4);
}

/**
 * Claude model pricing
 * @type {Record<string, ModelPricing>}
 */
export const CLAUDE_PRICING = {
  'us.anthropic.claude-3-7-sonnet-20250219-v1:0': {
    input: (tokens) => formatPrice(tokens * 0.000015),
    output: (tokens) => formatPrice(tokens * 0.000075)
  },
  'anthropic.claude-3-5-sonnet-20241022-v2:0': {
    input: (tokens) => formatPrice(tokens * 0.000010),
    output: (tokens) => formatPrice(tokens * 0.000050)
  },
  'anthropic.claude-3-sonnet-20240229-v1:0': {
    input: (tokens) => formatPrice(tokens * 0.000008),
    output: (tokens) => formatPrice(tokens * 0.000024)
  }
};

/**
 * Nova model pricing
 * @type {Record<string, ModelPricing>}
 */
export const NOVA_PRICING = {
  'us.amazon.nova-premier-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.0025),
    output: (tokens) => formatPrice((tokens / 1000) * 0.0125)
  },
  'amazon.nova-pro-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.0008),
    output: (tokens) => formatPrice((tokens / 1000) * 0.0032)
  },
  'amazon.nova-lite-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.00006),
    output: (tokens) => formatPrice((tokens / 1000) * 0.00024)
  },
  'amazon.nova-micro-v1:0': {
    input: (tokens) => formatPrice((tokens / 1000) * 0.000035),
    output: (tokens) => formatPrice((tokens / 1000) * 0.00014)
  }
};

/**
 * Llama model pricing
 * @type {Record<string, ModelPricing>}
 */
export const LLAMA_PRICING = {
  'us.meta.llama3-3-70b-instruct-v1:0': {
    input: (tokens) => formatPrice(tokens * 0.000007),
    output: (tokens) => formatPrice(tokens * 0.000009)
  }
};

/**
 * Ollama model pricing (free/local)
 * @type {Record<string, ModelPricing>}
 */
export const OLLAMA_PRICING = {
  // Default pricing for all Ollama models (free)
  'default': {
    input: () => '0.0000',
    output: () => '0.0000'
  }
};

/**
 * All model pricing
 * @type {Record<string, ModelPricing>}
 */
export const ALL_PRICING = {
  ...CLAUDE_PRICING,
  ...NOVA_PRICING,
  ...LLAMA_PRICING
};

/**
 * Get pricing for a model
 * @param {string} modelId - The model ID to get pricing for
 * @returns {ModelPricing} The pricing information
 */
export function getModelPricing(modelId) {
  // For Ollama models, return the default free pricing
  if (modelId.indexOf('.') === -1) {
    return OLLAMA_PRICING.default;
  }
  
  // For other models, look up in the pricing table
  return ALL_PRICING[modelId] || {
    input: () => '0.0000',
    output: () => '0.0000'
  };
}

/**
 * Calculate cost for a model usage
 * @param {string} modelId - The model ID
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {{inputCost: string, outputCost: string, totalCost: string}} Cost information
 */
export function calculateCost(modelId, inputTokens, outputTokens) {
  const pricing = getModelPricing(modelId);
  
  const inputCost = pricing.input(inputTokens);
  const outputCost = pricing.output(outputTokens);
  const totalCost = formatPrice(parseFloat(inputCost) + parseFloat(outputCost));
  
  return {
    inputCost,
    outputCost,
    totalCost
  };
}
