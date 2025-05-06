import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('LLMService Interface', () => {
  it('should define the expected methods', () => {
    // Read the types.ts file content to check the LLMService interface
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for LLMService interface definition
    assert.ok(typesContent.includes('interface LLMService'), 'types.ts should define LLMService interface');
    
    // Check for expected methods
    const expectedMethods = [
      'setMessageStore',
      'getFormattedMessages',
      'registerTools',
      'getToolManager',
      'invokeModel'
    ];
    
    for (const method of expectedMethods) {
      assert.ok(
        typesContent.includes(method), 
        `LLMService interface should include ${method} method`
      );
    }
  });
  
  it('should define the expected parameters for methods', () => {
    // Read the types.ts file content to check the LLMService interface
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for specific parameter types
    assert.ok(
      typesContent.includes('setMessageStore(messageStore: MessageStoreInterface'), 
      'setMessageStore should accept a MessageStoreInterface parameter'
    );
    
    assert.ok(
      typesContent.includes('registerTools(tools: Tool[])'), 
      'registerTools should accept an array of Tool objects'
    );
    
    assert.ok(
      typesContent.includes('invokeModel(messages: any[]): Promise<InvokeResult>'), 
      'invokeModel should return a Promise<InvokeResult>'
    );
  });
});
