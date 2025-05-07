/**
 * Unit tests for providers index.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as ProvidersExports from '../../src/providers/index.mjs';
import { BedrockService } from '../../src/providers/bedrock-service.mjs';
import { OllamaService } from '../../src/providers/ollama-service.mjs';

describe('Providers index module', () => {
  it('should export BedrockService', () => {
    assert.strictEqual(ProvidersExports.BedrockService, BedrockService);
  });

  it('should export OllamaService', () => {
    assert.strictEqual(ProvidersExports.OllamaService, OllamaService);
  });

  it('should not export any unexpected items', () => {
    const exportedKeys = Object.keys(ProvidersExports);
    assert.strictEqual(exportedKeys.length, 2);
    assert.ok(exportedKeys.includes('BedrockService'));
    assert.ok(exportedKeys.includes('OllamaService'));
  });
});
