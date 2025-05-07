/**
 * Unit tests for config index.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as ConfigExports from '../../src/config/index.mjs';

describe('Config index module', () => {
  it('should export model-related exports', () => {
    // Check for model exports
    assert.ok(ConfigExports.CLAUDE_MODELS);
    assert.ok(ConfigExports.NOVA_MODELS);
    assert.ok(ConfigExports.LLAMA_MODELS);
    assert.ok(ConfigExports.OLLAMA_MODELS);
    assert.ok(ConfigExports.MODEL_GROUPS);
    assert.ok(ConfigExports.ALL_MODELS);
    assert.ok(ConfigExports.DEFAULT_MODEL);
    assert.strictEqual(typeof ConfigExports.getModelConfigById, 'function');
    assert.strictEqual(typeof ConfigExports.getInferenceConfig, 'function');
  });

  it('should export pricing-related exports', () => {
    // Check for pricing exports
    assert.ok(ConfigExports.CLAUDE_PRICING);
    assert.ok(ConfigExports.NOVA_PRICING);
    assert.ok(ConfigExports.LLAMA_PRICING);
    assert.ok(ConfigExports.OLLAMA_PRICING);
    assert.ok(ConfigExports.ALL_PRICING);
    assert.strictEqual(typeof ConfigExports.getModelPricing, 'function');
    assert.strictEqual(typeof ConfigExports.calculateCost, 'function');
  });

  it('should export LLMConfigManager', () => {
    // Check for LLMConfigManager
    assert.strictEqual(typeof ConfigExports.LLMConfigManager, 'function');
    
    // Verify it's a constructor
    const instance = new ConfigExports.LLMConfigManager();
    assert.ok(instance);
    assert.strictEqual(typeof instance.getConfig, 'function');
  });
});
