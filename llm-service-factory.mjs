/**
 * @typedef {import('./types').LLMProvider} LLMProvider
 * @typedef {import('./types').LLMService} LLMService
 * @typedef {import('./types').LLMServiceConfig} LLMServiceConfig
 */

import { BedrockService, OllamaService } from './providers/index.mjs';
import { LLMConfigManager } from './config/index.mjs';

export class LLMServiceFactory {
  /**
   * Create an LLM service based on the provided configuration
   * @param {LLMServiceConfig} config - Configuration for the LLM service
   * @returns {LLMService} An instance of LLMService
   */
  static createService(config) {
    const { provider, modelId, region, endpoint } = config;
    
    // Initialize the configuration manager with any provided config
    LLMConfigManager.getInstance({
      region,
      defaultModelId: modelId
    });
    
    switch (provider) {
      case 'bedrock':
        return new BedrockService(region, modelId);
      case 'ollama':
        return new OllamaService(endpoint || 'http://localhost:11434', modelId);
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}
