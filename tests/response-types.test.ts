import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Response Types', () => {
  it('should define AssistantResponse type', () => {
    // Read the types.ts file content to check the response types
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for AssistantResponse type definition
    assert.ok(
      typesContent.includes('type AssistantResponse ='), 
      'types.ts should define AssistantResponse type'
    );
    
    // Check for expected properties
    const expectedProperties = [
      'type: \'ASSISTANT_RESPONSE\'',
      'content: string',
      'tokenUsage?',
      'costInfo?'
    ];
    
    for (const prop of expectedProperties) {
      assert.ok(
        typesContent.includes(prop), 
        `AssistantResponse should include ${prop} property`
      );
    }
  });
  
  it('should define AssistantToolRequest type', () => {
    // Read the types.ts file content to check the response types
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for AssistantToolRequest type definition
    assert.ok(
      typesContent.includes('type AssistantToolRequest ='), 
      'types.ts should define AssistantToolRequest type'
    );
    
    // Check for expected properties
    const expectedProperties = [
      'type: \'ASSISTANT_TOOL_REQUEST\'',
      'content: string',
      'toolCalls:',
      'name: string',
      'input: object',
      'toolUseId: string',
      'tokenUsage?',
      'costInfo?'
    ];
    
    for (const prop of expectedProperties) {
      assert.ok(
        typesContent.includes(prop), 
        `AssistantToolRequest should include ${prop} property`
      );
    }
  });
  
  it('should define InvokeResult as a union type', () => {
    // Read the types.ts file content to check the response types
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for InvokeResult type definition
    assert.ok(
      typesContent.includes('type InvokeResult = AssistantResponse | AssistantToolRequest'), 
      'types.ts should define InvokeResult as a union type'
    );
  });
});
