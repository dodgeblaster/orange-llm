/**
 * Unit tests for models.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CLAUDE_MODELS,
  NOVA_MODELS,
  LLAMA_MODELS,
  OLLAMA_MODELS,
  MODEL_GROUPS,
  ALL_MODELS,
  DEFAULT_MODEL,
  getModelConfigById,
  getInferenceConfig
} from '../../src/config/models.mjs';

describe('Models Configuration', () => {
  describe('Model Collections', () => {
    it('should export CLAUDE_MODELS with correct structure', () => {
      assert.ok(CLAUDE_MODELS);
      assert.strictEqual(typeof CLAUDE_MODELS, 'object');
      
      // Check a specific model
      const claudeModel = CLAUDE_MODELS['claude-3-sonnet'];
      assert.ok(claudeModel);
      assert.strictEqual(claudeModel.provider, 'bedrock');
      assert.strictEqual(claudeModel.id, 'anthropic.claude-3-sonnet-20240229-v1:0');
      assert.ok(claudeModel.displayName);
      assert.ok(claudeModel.description);
    });

    it('should export NOVA_MODELS with correct structure', () => {
      assert.ok(NOVA_MODELS);
      assert.strictEqual(typeof NOVA_MODELS, 'object');
      
      // Check a specific model
      const novaModel = NOVA_MODELS['nova-micro'];
      assert.ok(novaModel);
      assert.strictEqual(novaModel.provider, 'bedrock');
      assert.strictEqual(novaModel.id, 'amazon.nova-micro-v1:0');
      assert.ok(novaModel.displayName);
      assert.ok(novaModel.description);
    });

    it('should export LLAMA_MODELS with correct structure', () => {
      assert.ok(LLAMA_MODELS);
      assert.strictEqual(typeof LLAMA_MODELS, 'object');
      
      // Check a specific model
      const llamaModel = LLAMA_MODELS['llama-3-3'];
      assert.ok(llamaModel);
      assert.strictEqual(llamaModel.provider, 'bedrock');
      assert.strictEqual(llamaModel.id, 'us.meta.llama3-3-70b-instruct-v1:0');
      assert.ok(llamaModel.displayName);
      assert.ok(llamaModel.description);
    });

    it('should export OLLAMA_MODELS with correct structure', () => {
      assert.ok(OLLAMA_MODELS);
      assert.strictEqual(typeof OLLAMA_MODELS, 'object');
      
      // Check a specific model
      const ollamaModel = OLLAMA_MODELS['llama3.1'];
      assert.ok(ollamaModel);
      assert.strictEqual(ollamaModel.provider, 'ollama');
      assert.strictEqual(ollamaModel.id, 'llama3.1');
      assert.ok(ollamaModel.displayName);
      assert.ok(ollamaModel.description);
    });

    it('should export ALL_MODELS containing all models', () => {
      assert.ok(ALL_MODELS);
      
      // Check that ALL_MODELS contains all models from other collections
      const claudeKeys = Object.keys(CLAUDE_MODELS);
      const novaKeys = Object.keys(NOVA_MODELS);
      const llamaKeys = Object.keys(LLAMA_MODELS);
      const ollamaKeys = Object.keys(OLLAMA_MODELS);
      
      claudeKeys.forEach(key => {
        assert.ok(ALL_MODELS[key], `ALL_MODELS should contain Claude model ${key}`);
      });
      
      novaKeys.forEach(key => {
        assert.ok(ALL_MODELS[key], `ALL_MODELS should contain Nova model ${key}`);
      });
      
      llamaKeys.forEach(key => {
        assert.ok(ALL_MODELS[key], `ALL_MODELS should contain Llama model ${key}`);
      });
      
      ollamaKeys.forEach(key => {
        assert.ok(ALL_MODELS[key], `ALL_MODELS should contain Ollama model ${key}`);
      });
    });
  });

  describe('MODEL_GROUPS', () => {
    it('should export MODEL_GROUPS with correct structure', () => {
      assert.ok(MODEL_GROUPS);
      assert.strictEqual(typeof MODEL_GROUPS, 'object');
      
      // Check specific groups
      assert.ok(MODEL_GROUPS.claude);
      assert.ok(MODEL_GROUPS.nova);
      assert.ok(MODEL_GROUPS.llama);
      assert.ok(MODEL_GROUPS.ollama);
      
      // Check that each group has the required properties
      Object.values(MODEL_GROUPS).forEach(group => {
        assert.ok(group.name);
        assert.ok(Array.isArray(group.models));
        assert.ok(group.description);
      });
    });

    it('should have correct models in each group', () => {
      // Claude group should contain Claude models
      const claudeIds = Object.values(CLAUDE_MODELS).map(model => model.id);
      assert.deepStrictEqual(MODEL_GROUPS.claude.models, claudeIds);
      
      // Nova group should contain Nova models
      const novaIds = Object.values(NOVA_MODELS).map(model => model.id);
      assert.deepStrictEqual(MODEL_GROUPS.nova.models, novaIds);
      
      // Llama group should contain Llama models
      const llamaIds = Object.values(LLAMA_MODELS).map(model => model.id);
      assert.deepStrictEqual(MODEL_GROUPS.llama.models, llamaIds);
      
      // Ollama group should contain Ollama models
      const ollamaIds = Object.values(OLLAMA_MODELS).map(model => model.id);
      assert.deepStrictEqual(MODEL_GROUPS.ollama.models, ollamaIds);
    });
  });

  describe('DEFAULT_MODEL', () => {
    it('should export DEFAULT_MODEL as a string', () => {
      assert.strictEqual(typeof DEFAULT_MODEL, 'string');
      assert.ok(DEFAULT_MODEL.length > 0);
    });

    it('should match a model ID from NOVA_MODELS', () => {
      assert.strictEqual(DEFAULT_MODEL, NOVA_MODELS['nova-micro'].id);
    });
  });

  describe('getModelConfigById', () => {
    it('should return model config for valid model ID', () => {
      const claudeId = CLAUDE_MODELS['claude-3-sonnet'].id;
      const modelConfig = getModelConfigById(claudeId);
      
      assert.ok(modelConfig);
      assert.strictEqual(modelConfig.id, claudeId);
      assert.strictEqual(modelConfig.provider, 'bedrock');
      assert.ok(modelConfig.displayName);
    });

    it('should return undefined for invalid model ID', () => {
      const modelConfig = getModelConfigById('non-existent-model');
      assert.strictEqual(modelConfig, undefined);
    });
  });

  describe('getInferenceConfig', () => {
    it('should return inference config for valid model ID', () => {
      const claudeId = CLAUDE_MODELS['claude-3-sonnet'].id;
      const inferenceConfig = getInferenceConfig(claudeId);
      
      assert.ok(inferenceConfig);
      assert.strictEqual(typeof inferenceConfig.maxTokens, 'number');
      assert.strictEqual(typeof inferenceConfig.temperature, 'number');
      assert.strictEqual(typeof inferenceConfig.topP, 'number');
    });

    it('should return default inference config for invalid model ID', () => {
      const inferenceConfig = getInferenceConfig('non-existent-model');
      
      assert.ok(inferenceConfig);
      assert.strictEqual(inferenceConfig.maxTokens, 2048);
      assert.strictEqual(inferenceConfig.temperature, 0.7);
      assert.strictEqual(inferenceConfig.topP, 0.9);
    });
  });
});
