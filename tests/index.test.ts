import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Public API (index.ts)', () => {
  it('should export the expected types and classes', () => {
    // Read the index.ts file content
    const indexPath = path.join(process.cwd(), 'index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for expected exports
    assert.ok(indexContent.includes('export {'), 'index.ts should have exports');
    
    // Check for specific exports
    const expectedExports = [
      'LLMProvider',
      'LLMService',
      'LLMServiceConfig',
      'Tool',
      'TokenUsage',
      'ModelPricing',
      'InvokeResult',
      'AssistantResponse',
      'AssistantToolRequest',
      'LLMServiceFactory'
    ];
    
    for (const exportName of expectedExports) {
      assert.ok(
        indexContent.includes(exportName), 
        `index.ts should export ${exportName}`
      );
    }
  });
  
  it('should not export internal implementation details', () => {
    // Read the index.ts file content
    const indexPath = path.join(process.cwd(), 'index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check that internal details are not exported
    const internalComponents = [
      'response-handler',
      'tool-manager',
      'model-manager',
      'providers/',
      'config/'
    ];
    
    // Look for comments indicating these are internal
    for (const component of internalComponents) {
      assert.ok(
        !indexContent.includes(`export * from './${component}'`), 
        `index.ts should not export internal component ${component}`
      );
    }
    
    // Check for a comment indicating internal implementation details
    assert.ok(
      indexContent.includes('internal implementation'), 
      'index.ts should document internal implementation details'
    );
  });
});
