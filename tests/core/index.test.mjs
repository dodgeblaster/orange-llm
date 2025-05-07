/**
 * Unit tests for core index module
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as CoreExports from '../../src/core/index.mjs';
import { DefaultModelManager } from '../../src/core/model-manager.mjs';
import { DefaultToolManager } from '../../src/core/tool-manager.mjs';
import { DefaultResponseHandler } from '../../src/core/response-handler.mjs';

describe('Core index module', () => {
  it('should export DefaultModelManager', () => {
    assert.strictEqual(CoreExports.DefaultModelManager, DefaultModelManager);
  });

  it('should export DefaultToolManager', () => {
    assert.strictEqual(CoreExports.DefaultToolManager, DefaultToolManager);
  });

  it('should export DefaultResponseHandler', () => {
    assert.strictEqual(CoreExports.DefaultResponseHandler, DefaultResponseHandler);
  });

  it('should not export any unexpected items', () => {
    const exportedKeys = Object.keys(CoreExports);
    assert.strictEqual(exportedKeys.length, 3);
    assert.ok(exportedKeys.includes('DefaultModelManager'));
    assert.ok(exportedKeys.includes('DefaultToolManager'));
    assert.ok(exportedKeys.includes('DefaultResponseHandler'));
  });
});
