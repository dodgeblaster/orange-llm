/**
 * Unit tests for llm-config.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LLMConfigManager } from '../../src/config/llm-config.mjs';
import { DEFAULT_MODEL } from '../../src/config/models.mjs';

describe('LLMConfigManager', () => {
  describe('constructor', () => {
    it('should initialize with default config when no config provided', () => {
      const configManager = new LLMConfigManager();
      const config = configManager.getConfig();
      
      assert.strictEqual(config.region, 'us-east-1');
      assert.strictEqual(config.defaultModelId, DEFAULT_MODEL);
      assert.strictEqual(config.inferenceDefaults.maxTokens, 2048);
      assert.strictEqual(config.inferenceDefaults.temperature, 0.7);
      assert.strictEqual(config.inferenceDefaults.topP, 0.9);
      assert.strictEqual(config.enableTokenTracking, true);
      assert.strictEqual(config.debug, false);
    });

    it('should merge provided config with defaults', () => {
      const configManager = new LLMConfigManager({
        region: 'us-west-2',
        debug: true,
        inferenceDefaults: {
          temperature: 0.5
        }
      });
      
      const config = configManager.getConfig();
      
      assert.strictEqual(config.region, 'us-west-2');
      assert.strictEqual(config.defaultModelId, DEFAULT_MODEL);
      assert.strictEqual(config.inferenceDefaults.maxTokens, 2048);
      assert.strictEqual(config.inferenceDefaults.temperature, 0.5);
      assert.strictEqual(config.inferenceDefaults.topP, 0.9);
      assert.strictEqual(config.enableTokenTracking, true);
      assert.strictEqual(config.debug, true);
    });
  });

  describe('static create', () => {
    it('should create a new instance with the given config', () => {
      const configManager = LLMConfigManager.create({
        region: 'eu-west-1'
      });
      
      assert.ok(configManager instanceof LLMConfigManager);
      assert.strictEqual(configManager.getRegion(), 'eu-west-1');
    });
  });

  describe('updateConfig', () => {
    it('should update the configuration', () => {
      const configManager = new LLMConfigManager();
      
      configManager.updateConfig({
        region: 'ap-southeast-1',
        debug: true
      });
      
      const config = configManager.getConfig();
      assert.strictEqual(config.region, 'ap-southeast-1');
      assert.strictEqual(config.debug, true);
    });

    it('should merge inference defaults', () => {
      const configManager = new LLMConfigManager();
      
      configManager.updateConfig({
        inferenceDefaults: {
          temperature: 0.3
        }
      });
      
      const config = configManager.getConfig();
      assert.strictEqual(config.inferenceDefaults.temperature, 0.3);
      assert.strictEqual(config.inferenceDefaults.maxTokens, 2048);
      assert.strictEqual(config.inferenceDefaults.topP, 0.9);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const configManager = new LLMConfigManager();
      const config1 = configManager.getConfig();
      
      // Modify the returned config
      config1.region = 'modified';
      
      // Get the config again
      const config2 = configManager.getConfig();
      
      // The original config should not be modified
      assert.strictEqual(config2.region, 'us-east-1');
    });
  });

  describe('getRegion', () => {
    it('should return the configured region', () => {
      const configManager = new LLMConfigManager({
        region: 'us-west-1'
      });
      
      assert.strictEqual(configManager.getRegion(), 'us-west-1');
    });

    it('should return default region if not configured', () => {
      const configManager = new LLMConfigManager({
        region: undefined
      });
      
      assert.strictEqual(configManager.getRegion(), 'us-east-1');
    });
  });

  describe('getDefaultModelId', () => {
    it('should return the configured default model ID', () => {
      const configManager = new LLMConfigManager({
        defaultModelId: 'custom-model'
      });
      
      assert.strictEqual(configManager.getDefaultModelId(), 'custom-model');
    });

    it('should return the system default model ID if not configured', () => {
      const configManager = new LLMConfigManager();
      
      assert.strictEqual(configManager.getDefaultModelId(), DEFAULT_MODEL);
    });
  });

  describe('getModelConfig', () => {
    it('should return model config for valid model ID', () => {
      const configManager = new LLMConfigManager();
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      
      const modelConfig = configManager.getModelConfig(modelId);
      
      assert.ok(modelConfig);
      assert.strictEqual(modelConfig.id, modelId);
      assert.strictEqual(modelConfig.provider, 'bedrock');
    });

    it('should return undefined for invalid model ID', () => {
      const configManager = new LLMConfigManager();
      
      const modelConfig = configManager.getModelConfig('non-existent-model');
      
      assert.strictEqual(modelConfig, undefined);
    });
  });

  describe('getInferenceConfig', () => {
    it('should return inference config for specified model', () => {
      const configManager = new LLMConfigManager();
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      
      const inferenceConfig = configManager.getInferenceConfig(modelId);
      
      assert.ok(inferenceConfig);
      assert.strictEqual(typeof inferenceConfig.maxTokens, 'number');
      assert.strictEqual(typeof inferenceConfig.temperature, 'number');
      assert.strictEqual(typeof inferenceConfig.topP, 'number');
    });

    it('should return inference config for default model if no model specified', () => {
      const configManager = new LLMConfigManager({
        defaultModelId: 'anthropic.claude-3-sonnet-20240229-v1:0'
      });
      
      const inferenceConfig = configManager.getInferenceConfig();
      
      assert.ok(inferenceConfig);
      assert.strictEqual(typeof inferenceConfig.maxTokens, 'number');
      assert.strictEqual(typeof inferenceConfig.temperature, 'number');
      assert.strictEqual(typeof inferenceConfig.topP, 'number');
    });

    it('should merge model inference config with defaults', () => {
      const configManager = new LLMConfigManager({
        inferenceDefaults: {
          maxTokens: 1024,
          temperature: 0.5,
          topP: 0.8
        }
      });
      
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      const inferenceConfig = configManager.getInferenceConfig(modelId);
      
      // The model config has maxTokens: 4096, but our default is 1024
      // The model config has defaultTemperature: 0.7, but our default is 0.5
      // The model config has defaultTopP: 0.9, but our default is 0.8
      
      // Model config should override our defaults
      assert.strictEqual(inferenceConfig.maxTokens, 4096);
      assert.strictEqual(inferenceConfig.temperature, 0.7);
      assert.strictEqual(inferenceConfig.topP, 0.9);
    });
  });

  describe('getModelPricing', () => {
    it('should return pricing for valid model ID', () => {
      const configManager = new LLMConfigManager();
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      
      const pricing = configManager.getModelPricing(modelId);
      
      assert.ok(pricing);
      assert.strictEqual(typeof pricing.input, 'function');
      assert.strictEqual(typeof pricing.output, 'function');
    });

    it('should return default pricing for Ollama model', () => {
      const configManager = new LLMConfigManager();
      const modelId = 'llama3.1';
      
      const pricing = configManager.getModelPricing(modelId);
      
      assert.ok(pricing);
      assert.strictEqual(pricing.input(1000), '0.0000');
      assert.strictEqual(pricing.output(1000), '0.0000');
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for valid model ID', () => {
      const configManager = new LLMConfigManager();
      const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
      
      const cost = configManager.calculateCost(modelId, 1000, 500);
      
      assert.ok(cost);
      assert.strictEqual(cost.inputCost, '0.0080');
      assert.strictEqual(cost.outputCost, '0.0120');
      assert.strictEqual(cost.totalCost, '0.0200');
    });
  });

  describe('isTokenTrackingEnabled', () => {
    it('should return true when token tracking is enabled', () => {
      const configManager = new LLMConfigManager({
        enableTokenTracking: true
      });
      
      assert.strictEqual(configManager.isTokenTrackingEnabled(), true);
    });

    it('should return false when token tracking is disabled', () => {
      const configManager = new LLMConfigManager({
        enableTokenTracking: false
      });
      
      assert.strictEqual(configManager.isTokenTrackingEnabled(), false);
    });
  });

  describe('isDebugEnabled', () => {
    it('should return true when debug is enabled', () => {
      const configManager = new LLMConfigManager({
        debug: true
      });
      
      assert.strictEqual(configManager.isDebugEnabled(), true);
    });

    it('should return false when debug is disabled', () => {
      const configManager = new LLMConfigManager({
        debug: false
      });
      
      assert.strictEqual(configManager.isDebugEnabled(), false);
    });
  });
});
