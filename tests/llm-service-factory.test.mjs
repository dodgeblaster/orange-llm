import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LLMServiceFactory } from '../llm-service-factory.mjs';
import { LLMProvider } from '../types.mjs';

describe('LLMServiceFactory', () => {
  it('should create a Bedrock service', () => {
    const service = LLMServiceFactory.createService({
      provider: LLMProvider.BEDROCK,
      modelId: 'amazon.nova-micro-v1:0',
      region: 'us-east-1'
    });
    
    assert.ok(service);
    assert.strictEqual(typeof service.invokeModel, 'function');
    assert.strictEqual(typeof service.registerTools, 'function');
    assert.strictEqual(typeof service.setMessageStore, 'function');
  });
  
  it('should throw error for unsupported provider', () => {
    assert.throws(() => {
      LLMServiceFactory.createService({
        provider: 'unsupported',
        modelId: 'some-model'
      });
    }, /Unknown LLM provider/);
  });
  
  it('should throw error for unimplemented provider', () => {
    assert.throws(() => {
      LLMServiceFactory.createService({
        provider: LLMProvider.OLLAMA,
        modelId: 'llama2'
      });
    }, /Ollama provider not yet implemented/);
  });
});
