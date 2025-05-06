import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Public API (index.mjs)', () => {
  it('should export the expected classes', () => {
    // Read the index.mjs file content
    const indexPath = path.join(process.cwd(), 'index.mjs');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for expected exports
    assert.ok(indexContent.includes('export {'), 'index.mjs should have exports');
    
    // Check for specific exports
    const expectedExports = [
      'LLMServiceFactory'
    ];
    
    for (const exportName of expectedExports) {
      assert.ok(
        indexContent.includes(exportName), 
        `index.mjs should export ${exportName}`
      );
    }
  });
  
  it('should include JSDoc type definitions', () => {
    // Read the index.mjs file content
    const indexPath = path.join(process.cwd(), 'index.mjs');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for JSDoc type definitions
    const expectedTypes = [
      '@typedef',
      'LLMProvider',
      'LLMService',
      'LLMServiceConfig',
      'Tool',
      'TokenUsage',
      'ModelPricing',
      'InvokeResult',
      'AssistantResponse',
      'AssistantToolRequest'
    ];
    
    for (const typeName of expectedTypes) {
      assert.ok(
        indexContent.includes(typeName), 
        `index.mjs should include JSDoc type definition for ${typeName}`
      );
    }
  });
  
  it('should not export internal implementation details', () => {
    // Read the index.mjs file content
    const indexPath = path.join(process.cwd(), 'index.mjs');
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
        !indexContent.includes(`export * from './${component}`), 
        `index.mjs should not export internal component ${component}`
      );
    }
    
    // Check for a comment indicating internal implementation details
    assert.ok(
      indexContent.includes('internal implementation'), 
      'index.mjs should document internal implementation details'
    );
  });
});
