import { LLMProvider, LLMService, LLMServiceConfig } from './types';
import { BedrockService } from './providers';
import { LLMConfigManager } from './config';

export class LLMServiceFactory {
  /**
   * Create an LLM service based on the provided configuration
   * @param config - Configuration for the LLM service
   * @returns An instance of LLMService
   */
  static createService(config: LLMServiceConfig): LLMService {
    const { provider, modelId, region } = config;
    
    // Initialize the configuration manager with any provided config
    LLMConfigManager.getInstance({
      region,
      defaultModelId: modelId
    });
    
    switch (provider) {
      case LLMProvider.BEDROCK:
        return new BedrockService(region, modelId);
      case LLMProvider.OLLAMA:
        throw new Error('Ollama provider not yet implemented');
      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }
}
