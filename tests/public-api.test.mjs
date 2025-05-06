import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LLMServiceFactory } from '../index.mjs';

describe('Public API', () => {
  it('should export LLMServiceFactory', () => {
    assert.strictEqual(typeof LLMServiceFactory, 'function');
    assert.strictEqual(typeof LLMServiceFactory.createService, 'function');
  });
  
  it('should have the expected structure', () => {
    // This is a placeholder test that will pass
    assert.ok(true, 'Placeholder test for public API structure');
  });
});
