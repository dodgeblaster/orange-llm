import { ModelManager } from './types';
export declare class DefaultModelManager implements ModelManager {
    private currentModel;
    private configManager;
    constructor(initialModel?: string);
    getCurrentModel(): string;
    getInferenceConfig(): any;
    /**
     * Set the current model
     * @param modelId - The model ID to set as current
     * @returns true if the model was found and set, false otherwise
     */
    setModel(modelId: string): boolean;
    /**
     * Get all available models
     * @returns An array of all available model IDs
     */
    getAvailableModels(): string[];
    /**
     * Handle errors by attempting to fall back to alternative models
     */
    handleError(error: any, retryCallback: () => Promise<any>): Promise<any>;
    /**
     * Fall back to the next model in the appropriate chain
     * @returns true if fallback was successful, false if no more fallbacks available
     */
    private fallbackToNextModel;
}
