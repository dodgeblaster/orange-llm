import { LLMService, LLMServiceConfig } from './types.js';
export declare class LLMServiceFactory {
    /**
     * Create an LLM service based on the provided configuration
     * @param config - Configuration for the LLM service
     * @returns An instance of LLMService
     */
    static createService(config: LLMServiceConfig): LLMService;
}
