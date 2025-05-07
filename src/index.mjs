/**
 * Main entry point for the AI Chat LLM module
 * @module ai-chat-llm
 */

import { LLMProvider } from './types.mjs';
import { BedrockService, OllamaService } from './providers/index.mjs';
import { LLMConfigManager } from './config/index.mjs';

/**
 * Factory for creating LLM services
 */
export class LLMServiceFactory {
  /**
   * Create an LLM service based on the provided configuration
   * @param {import('./types').LLMServiceConfig} config - Configuration for the LLM service
   * @returns {import('./types').LLMService} An instance of LLMService
   */
  static createService(config) {
    const { provider, modelId, region, endpoint } = config;
    
    // Create a configuration manager instance with the provided config
    const configManager = LLMConfigManager.create({
      region,
      defaultModelId: modelId
    });
    
    switch (provider) {
      case 'bedrock':
        return new BedrockService(configManager, region, modelId);
      case 'ollama':
        return new OllamaService(configManager, endpoint || 'http://localhost:11434', modelId);
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}

// Export types and constants
export { LLMProvider };

// Export core components for advanced usage
export * from './core/index.mjs';
