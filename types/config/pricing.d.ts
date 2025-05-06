/**
 * Pricing configuration for LLM services
 * This file centralizes all pricing-related configuration
 */
export interface TokenPricing {
    input: number;
    output: number;
}
export interface ModelPricingConfig {
    modelId: string;
    pricing: TokenPricing;
    displayName?: string;
}
/**
 * Claude model pricing
 */
export declare const CLAUDE_PRICING: Record<string, ModelPricingConfig>;
/**
 * Amazon Nova model pricing
 */
export declare const NOVA_PRICING: Record<string, ModelPricingConfig>;
/**
 * Meta Llama model pricing
 */
export declare const LLAMA_PRICING: Record<string, ModelPricingConfig>;
/**
 * All model pricing configurations
 */
export declare const ALL_MODEL_PRICING: Record<string, ModelPricingConfig>;
/**
 * Get pricing for a specific model ID
 */
export declare function getPricingByModelId(modelId: string): TokenPricing;
/**
 * Calculate cost for tokens
 */
export declare function calculateCost(pricing: TokenPricing, inputTokens: number, outputTokens: number): {
    inputCost: string;
    outputCost: string;
    totalCost: string;
};
