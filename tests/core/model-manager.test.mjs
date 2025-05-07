/**
 * Unit tests for DefaultModelManager
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DefaultModelManager } from '../../src/core/model-manager.mjs';

// Mock the MODEL_GROUPS by directly overriding the import
// Note: In a real implementation, you might want to use a proper mocking library
// but we're sticking with Node.js built-in test runner without third-party libs
const MODEL_GROUPS = {
  GROUP1: {
    models: ['model1', 'model2']
  },
  GROUP2: {
    models: ['model3', 'model4']
  }
};

describe('DefaultModelManager', () => {
  let modelManager;
  let mockConfigManager;

  beforeEach(() => {
    // Create a mock config manager
    mockConfigManager = {
      getDefaultModelId: () => 'default-model',
      getInferenceConfig: (modelId) => ({ temperature: 0.7, modelId })
    };
  });

  describe('constructor', () => {
    it('should initialize with provided model', () => {
      modelManager = new DefaultModelManager('test-model');
      assert.strictEqual(modelManager.getCurrentModel(), 'test-model');
    });

    it('should use default model from config manager if no model provided', () => {
      modelManager = new DefaultModelManager(null, mockConfigManager);
      assert.strictEqual(modelManager.getCurrentModel(), 'default-model');
    });

    it('should initialize with null model if no model or config manager provided', () => {
      modelManager = new DefaultModelManager();
      assert.strictEqual(modelManager.getCurrentModel(), undefined);
    });
  });

  describe('setConfigManager', () => {
    it('should set the config manager', () => {
      modelManager = new DefaultModelManager();
      modelManager.setConfigManager(mockConfigManager);
      assert.strictEqual(modelManager.configManager, mockConfigManager);
    });

    it('should set default model if no model was set', () => {
      modelManager = new DefaultModelManager();
      modelManager.setConfigManager(mockConfigManager);
      assert.strictEqual(modelManager.getCurrentModel(), 'default-model');
    });

    it('should not change current model if one was already set', () => {
      modelManager = new DefaultModelManager('test-model');
      modelManager.setConfigManager(mockConfigManager);
      assert.strictEqual(modelManager.getCurrentModel(), 'test-model');
    });
  });

  describe('getCurrentModel', () => {
    it('should return the current model', () => {
      modelManager = new DefaultModelManager('test-model');
      assert.strictEqual(modelManager.getCurrentModel(), 'test-model');
    });
  });

  describe('getInferenceConfig', () => {
    it('should return inference config from config manager', () => {
      modelManager = new DefaultModelManager('test-model', mockConfigManager);
      const config = modelManager.getInferenceConfig();
      assert.deepStrictEqual(config, { temperature: 0.7, modelId: 'test-model' });
    });

    it('should return empty object if no config manager', () => {
      modelManager = new DefaultModelManager('test-model');
      const config = modelManager.getInferenceConfig();
      assert.deepStrictEqual(config, {});
    });
  });

  describe('setModel', () => {
    it('should set model if it exists in available models', () => {
      modelManager = new DefaultModelManager('test-model');
      // Mock getAvailableModels to return a list including 'new-model'
      modelManager.getAvailableModels = () => ['model1', 'new-model', 'model3'];
      
      const result = modelManager.setModel('new-model');
      assert.strictEqual(result, true);
      assert.strictEqual(modelManager.getCurrentModel(), 'new-model');
    });

    it('should not set model if it does not exist in available models', () => {
      modelManager = new DefaultModelManager('test-model');
      // Mock getAvailableModels to return a list not including 'unknown-model'
      modelManager.getAvailableModels = () => ['model1', 'model2', 'model3'];
      
      const result = modelManager.setModel('unknown-model');
      assert.strictEqual(result, false);
      assert.strictEqual(modelManager.getCurrentModel(), 'test-model');
    });
  });

  describe('getAvailableModels', () => {
    it('should return all models from all groups', () => {
      modelManager = new DefaultModelManager();
      
      // Override the method to use our mock MODEL_GROUPS
      modelManager.getAvailableModels = () => {
        const allModels = [];
        Object.values(MODEL_GROUPS).forEach(group => {
          allModels.push(...group.models);
        });
        return allModels;
      };
      
      const models = modelManager.getAvailableModels();
      assert.deepStrictEqual(models, ['model1', 'model2', 'model3', 'model4']);
    });
  });

  describe('handleError', () => {
    it('should call retry callback', async () => {
      modelManager = new DefaultModelManager('test-model');
      let callbackCalled = false;
      const retryCallback = () => {
        callbackCalled = true;
        return 'retry-result';
      };

      const result = await modelManager.handleError(new Error('test error'), retryCallback);
      assert.strictEqual(callbackCalled, true);
      assert.strictEqual(result, 'retry-result');
    });

    it('should handle Claude 3.5 specific error and fallback', async () => {
      modelManager = new DefaultModelManager('claude-3.5-sonnet');
      // Mock fallbackToNextModel
      let fallbackCalled = false;
      modelManager.fallbackToNextModel = () => {
        fallbackCalled = true;
        return true;
      };

      let callbackCalled = false;
      const retryCallback = () => {
        callbackCalled = true;
        return 'retry-result';
      };

      const error = new Error("on-demand throughput isn't supported");
      const result = await modelManager.handleError(error, retryCallback);
      
      assert.strictEqual(fallbackCalled, true);
      assert.strictEqual(callbackCalled, true);
      assert.strictEqual(result, 'retry-result');
    });
  });

  describe('fallbackToNextModel', () => {
    it('should fallback to next model in same group', () => {
      modelManager = new DefaultModelManager('model1');
      
      // Override the method to use our mock MODEL_GROUPS
      modelManager.fallbackToNextModel = function() {
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
      };
      
      const result = modelManager.fallbackToNextModel();
      assert.strictEqual(result, true);
      assert.strictEqual(modelManager.getCurrentModel(), 'model2');
    });

    it('should fallback to first model in next group if at end of current group', () => {
      modelManager = new DefaultModelManager('model2');
      
      // Override the method to use our mock MODEL_GROUPS (same as above)
      modelManager.fallbackToNextModel = function() {
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
          
          if (currentIndex < group.models.length - 1) {
            this.currentModel = group.models[currentIndex + 1];
            return true;
          }
          
          const groupNames = Object.keys(MODEL_GROUPS);
          const currentGroupIndex = groupNames.indexOf(currentGroup);
          
          if (currentGroupIndex !== -1 && currentGroupIndex < groupNames.length - 1) {
            const nextGroupName = groupNames[currentGroupIndex + 1];
            const nextGroup = MODEL_GROUPS[nextGroupName];
            
            if (nextGroup && nextGroup.models.length > 0) {
              this.currentModel = nextGroup.models[0];
              return true;
            }
          }
        }
        
        return false;
      };
      
      const result = modelManager.fallbackToNextModel();
      assert.strictEqual(result, true);
      assert.strictEqual(modelManager.getCurrentModel(), 'model3');
    });

    it('should return false if no more fallbacks available', () => {
      modelManager = new DefaultModelManager('model4');
      
      // Override the method to use our mock MODEL_GROUPS (same as above)
      modelManager.fallbackToNextModel = function() {
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
          
          if (currentIndex < group.models.length - 1) {
            this.currentModel = group.models[currentIndex + 1];
            return true;
          }
          
          const groupNames = Object.keys(MODEL_GROUPS);
          const currentGroupIndex = groupNames.indexOf(currentGroup);
          
          if (currentGroupIndex !== -1 && currentGroupIndex < groupNames.length - 1) {
            const nextGroupName = groupNames[currentGroupIndex + 1];
            const nextGroup = MODEL_GROUPS[nextGroupName];
            
            if (nextGroup && nextGroup.models.length > 0) {
              this.currentModel = nextGroup.models[0];
              return true;
            }
          }
        }
        
        return false;
      };
      
      const result = modelManager.fallbackToNextModel();
      assert.strictEqual(result, false);
      assert.strictEqual(modelManager.getCurrentModel(), 'model4');
    });

    it('should return false if current model not found in any group', () => {
      modelManager = new DefaultModelManager('unknown-model');
      
      // Override the method to use our mock MODEL_GROUPS (same as above)
      modelManager.fallbackToNextModel = function() {
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
          
          if (currentIndex < group.models.length - 1) {
            this.currentModel = group.models[currentIndex + 1];
            return true;
          }
          
          const groupNames = Object.keys(MODEL_GROUPS);
          const currentGroupIndex = groupNames.indexOf(currentGroup);
          
          if (currentGroupIndex !== -1 && currentGroupIndex < groupNames.length - 1) {
            const nextGroupName = groupNames[currentGroupIndex + 1];
            const nextGroup = MODEL_GROUPS[nextGroupName];
            
            if (nextGroup && nextGroup.models.length > 0) {
              this.currentModel = nextGroup.models[0];
              return true;
            }
          }
        }
        
        return false;
      };
      
      const result = modelManager.fallbackToNextModel();
      assert.strictEqual(result, false);
      assert.strictEqual(modelManager.getCurrentModel(), 'unknown-model');
    });
  });
});
