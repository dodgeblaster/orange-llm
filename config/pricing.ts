/**
 * Pricing configuration for LLM services
 * This file centralizes all pricing-related configuration
 */

export interface TokenPricing {
  input: number;  // Cost per 1000 input tokens in USD
  output: number; // Cost per 1000 output tokens in USD
}

export interface ModelPricingConfig {
  modelId: string;
  pricing: TokenPricing;
  displayName?: string;
}

/**
 * Claude model pricing
 */
export const CLAUDE_PRICING: Record<string, ModelPricingConfig> = {
  'claude-3-7-sonnet': {
    modelId: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    displayName: 'Claude 3.7 Sonnet',
    pricing: {
      input: 0.000003,  // $0.003 per 1000 tokens
      output: 0.000015   // $0.015 per 1000 tokens
    }
  },
  'claude-3-5-sonnet': {
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    displayName: 'Claude 3.5 Sonnet',
    pricing: {
      input: 0.000003,  // $0.003 per 1000 tokens
      output: 0.000015   // $0.015 per 1000 tokens
    }
  },
  'claude-3-sonnet': {
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    displayName: 'Claude 3 Sonnet',
    pricing: {
      input: 0.000003,  // $0.003 per 1000 tokens
      output: 0.000015   // $0.015 per 1000 tokens
    }
  }
};

/**
 * Amazon Nova model pricing
 */
export const NOVA_PRICING: Record<string, ModelPricingConfig> = {
  'nova-pro': {
    modelId: 'amazon.nova-pro-v1:0',
    displayName: 'Amazon Nova Pro',
    pricing: {
      input: 0.0000008,  // $0.0008 per 1000 tokens
      output: 0.0000032   // $0.0032 per 1000 tokens
    }
  },
  'nova-lite': {
    modelId: 'amazon.nova-lite-v1:0',
    displayName: 'Amazon Nova Lite',
    pricing: {
      input: 0.00000006,  // $0.00006 per 1000 tokens
      output: 0.00000024   // $0.00024 per 1000 tokens
    }
  },
  'nova-micro': {
    modelId: 'amazon.nova-micro-v1:0',
    displayName: 'Amazon Nova Micro',
    pricing: {
      input: 0.000000035,  // $0.000035 per 1000 tokens
      output: 0.00000014   // $0.00014 per 1000 tokens
    }
  }
};

/**
 * Meta Llama model pricing
 */
export const LLAMA_PRICING: Record<string, ModelPricingConfig> = {
  'llama-3-3': {
    modelId: 'us.meta.llama3-3-70b-instruct-v1:0',
    displayName: 'Llama 3.3 70B',
    pricing: {
      input: 0.00000072,  // $0.00072 per 1000 tokens
      output: 0.00000072   // $0.00072 per 1000 tokens
    }
  }
};

/**
 * All model pricing configurations
 */
export const ALL_MODEL_PRICING: Record<string, ModelPricingConfig> = {
  ...CLAUDE_PRICING,
  ...NOVA_PRICING,
  ...LLAMA_PRICING
};

/**
 * Get pricing for a specific model ID
 */
export function getPricingByModelId(modelId: string): TokenPricing {
  // Find the pricing config that matches the model ID
  const pricingConfig = Object.values(ALL_MODEL_PRICING).find(
    config => config.modelId === modelId
  );
  
  // If found, return the pricing
  if (pricingConfig) {
    return pricingConfig.pricing;
  }
  
  // Default to Nova Micro pricing if no match found
  return NOVA_PRICING['nova-micro'].pricing;
}

/**
 * Calculate cost for tokens
 */
export function calculateCost(pricing: TokenPricing, inputTokens: number, outputTokens: number): {
  inputCost: string;
  outputCost: string;
  totalCost: string;
} {
  const inputCost = (inputTokens * pricing.input).toFixed(6);
  const outputCost = (outputTokens * pricing.output).toFixed(6);
  const totalCost = (parseFloat(inputCost) + parseFloat(outputCost)).toFixed(6);
  
  return {
    inputCost,
    outputCost,
    totalCost
  };
}
