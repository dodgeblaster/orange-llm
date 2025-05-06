/**
 * @typedef {import('./types').ModelManager} ModelManager
 */

import { LLMConfigManager, MODEL_GROUPS } from './config/index.mjs';

/**
 * Default implementation of the ModelManager interface
 * @implements {ModelManager}
 */
export class DefaultModelManager {
  /**
   * @param {string} [initialModel] - The initial model to use
   */
  constructor(initialModel) {
    this.configManager = LLMConfigManager.getInstance();
    this.currentModel = initialModel || this.configManager.getDefaultModelId();
  }

  /**
   * Get the current model ID
   * @returns {string} The current model ID
   */
  getCurrentModel() {
    return this.currentModel;
  }

  /**
   * Get the inference configuration for the current model
   * @returns {object} The inference configuration
   */
  getInferenceConfig() {
    return this.configManager.getInferenceConfig(this.currentModel);
  }

  /**
   * Set the current model
   * @param {string} modelId - The model ID to set as current
   * @returns {boolean} true if the model was found and set, false otherwise
   */
  setModel(modelId) {
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
   * @returns {string[]} An array of all available model IDs
   */
  getAvailableModels() {
    const allModels = [];
    
    // Collect models from all model groups
    Object.values(MODEL_GROUPS).forEach(group => {
      allModels.push(...group.models);
    });
    
    return allModels;
  }

  /**
   * Handle errors by attempting to fall back to alternative models
   * @param {Error} error - The error that occurred
   * @param {Function} retryCallback - Callback to retry the operation
   * @returns {Promise<any>} The result of the retry callback
   */
  async handleError(error, retryCallback) {
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
   * @returns {boolean} true if fallback was successful, false if no more fallbacks available
   * @private
   */
  fallbackToNextModel() {
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
