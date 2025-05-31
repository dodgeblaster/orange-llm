import { LLMProvider } from './types.mjs';
import { BedrockService, OllamaService } from './providers/index.mjs';
import { LLMConfigManager } from './config/index.mjs';

/**
 * Factory for creating LLM services
 */
export class LLMServiceFactory {
  /**
   * Create an LLM service based on the provided configuration
   */
  static createService(config) {    
    // Create a configuration manager instance with the provided config
    const configManager = LLMConfigManager.create({
      region: config.region,
      defaultModelId: config.modelId
    });

    if (config.provider === 'bedrock') {
      return new BedrockService(configManager, config.region, config.modelId);
    }

    if (config.provider === 'ollama') {
      const endpoint = config.endpoint || 'http://localhost:11434'
      return new OllamaService(configManager, endpoint, config.modelId);
    }

    throw new Error(`Unknown LLM provider: ${config.provider}`);
  }
}

export { LLMProvider };