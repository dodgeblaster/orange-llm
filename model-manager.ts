import { ModelManager } from './types';
import { LLMConfigManager, MODEL_GROUPS } from './config';

export class DefaultModelManager implements ModelManager {
  private currentModel: string;
  private configManager: LLMConfigManager;

  constructor(initialModel?: string) {
    this.configManager = LLMConfigManager.getInstance();
    this.currentModel = initialModel || this.configManager.getDefaultModelId();
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getInferenceConfig() {
    return this.configManager.getInferenceConfig(this.currentModel);
  }

  /**
   * Set the current model
   * @param modelId - The model ID to set as current
   * @returns true if the model was found and set, false otherwise
   */
  setModel(modelId: string): boolean {
    // Get all available models
    const allModels = this.getAvailableModels();
    
    if (allModels.includes(modelId)) {
      this.currentModel = modelId;
      return true;
    }
    
    return false;
  }

  /**
   * Get all available models
   * @returns An array of all available model IDs
   */
  getAvailableModels(): string[] {
    const allModels: string[] = [];
    
    // Collect models from all model groups
    Object.values(MODEL_GROUPS).forEach(group => {
      allModels.push(...group.models);
    });
    
    return allModels;
  }

  /**
   * Handle errors by attempting to fall back to alternative models
   */
  async handleError(error: any, retryCallback: () => Promise<any>): Promise<any> {
    console.error(`Error invoking model ${this.currentModel}: ${error.message}`);
    
    // Handle specific error for Claude 3.5 requiring an inference profile
    if (error.message?.includes("on-demand throughput isn't supported")) {
      console.error(`Error: Claude 3.5 Sonnet requires an inference profile. Falling back to next model...`);
      this.fallbackToNextModel();
      return retryCallback();
    }
    
    // General fallback logic
    if (this.fallbackToNextModel()) {
      console.log(`Falling back to model: ${this.currentModel}`);
      return retryCallback();
    }

    // If we've exhausted all fallbacks, throw the error
    throw error;
  }

  /**
   * Fall back to the next model in the appropriate chain
   * @returns true if fallback was successful, false if no more fallbacks available
   */
  private fallbackToNextModel(): boolean {
    // Find which group the current model belongs to
    let currentGroup = null;
    let currentIndex = -1;
    
    for (const [groupName, group] of Object.entries(MODEL_GROUPS)) {
      const index = group.models.indexOf(this.currentModel);
      if (index !== -1) {
        currentGroup = groupName;
        currentIndex = index;
        break;
      }
    }
    
    if (currentGroup && currentIndex !== -1) {
      const group = MODEL_GROUPS[currentGroup];
      
      // Try next model in the same group
      if (currentIndex < group.models.length - 1) {
        this.currentModel = group.models[currentIndex + 1];
        return true;
      }
      
      // If we've exhausted the current group, try other groups
      const groupNames = Object.keys(MODEL_GROUPS);
      const currentGroupIndex = groupNames.indexOf(currentGroup);
      
      if (currentGroupIndex !== -1 && currentGroupIndex < groupNames.length - 1) {
        // Try the first model of the next group
        const nextGroupName = groupNames[currentGroupIndex + 1];
        const nextGroup = MODEL_GROUPS[nextGroupName];
        
        if (nextGroup && nextGroup.models.length > 0) {
          this.currentModel = nextGroup.models[0];
          return true;
        }
      }
    }
    
    return false;
  }
}
