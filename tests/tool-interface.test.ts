import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Tool Interface', () => {
  it('should define the expected methods', () => {
    // Read the types.ts file content to check the Tool interface
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for Tool interface definition
    assert.ok(typesContent.includes('interface Tool'), 'types.ts should define Tool interface');
    
    // Check for expected methods
    const expectedMethods = [
      'getName',
      'getDescription',
      'getParameters',
      'execute'
    ];
    
    for (const method of expectedMethods) {
      assert.ok(
        typesContent.includes(method), 
        `Tool interface should include ${method} method`
      );
    }
  });
  
  it('should define the expected return types for methods', () => {
    // Read the types.ts file content to check the Tool interface
    const typesPath = path.join(process.cwd(), 'types.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check for specific return types
    assert.ok(
      typesContent.includes('getName(): string'), 
      'getName should return a string'
    );
    
    assert.ok(
      typesContent.includes('getDescription(): string'), 
      'getDescription should return a string'
    );
    
    assert.ok(
      typesContent.includes('getParameters(): object'), 
      'getParameters should return an object'
    );
    
    assert.ok(
      typesContent.includes('execute(params: any): Promise<any>'), 
      'execute should return a Promise<any>'
    );
  });
});
