# TypeScript to JavaScript Conversion Guide

This document outlines the process of converting a TypeScript project to JavaScript while maintaining type information using JSDoc comments and TypeScript declaration files.

## Conversion Steps

1. **Generate Type Definitions**
   ```bash
   mkdir -p types
   npx tsc --declaration --emitDeclarationOnly --outDir ./types
   ```

2. **Create jsconfig.json**
   ```json
   {
     "compilerOptions": {
       "checkJs": true,
       "module": "NodeNext",
       "target": "ES2020",
       "moduleResolution": "NodeNext",
       "allowSyntheticDefaultImports": true,
       "baseUrl": ".",
       "paths": {
         "*": ["./types/*"]
       }
     },
     "include": ["**/*.mjs"],
     "exclude": ["node_modules", "dist"]
   }
   ```

3. **Update package.json**
   - Change main entry point to `.mjs` file
   - Update types path
   - Update build and test scripts

4. **Convert TypeScript Files to JavaScript**
   - Rename `.ts` files to `.mjs`
   - Add JSDoc comments for type information
   - Update imports to include file extensions
   - Create runtime versions of enums and constants

5. **Update Tests**
   - Convert test files to use `.mjs` extension
   - Update imports to include file extensions

## JSDoc Type Annotations

```javascript
/**
 * @typedef {import('./types').LLMServiceConfig} LLMServiceConfig
 * @typedef {import('./types').LLMService} LLMService
 */

/**
 * Creates an LLM service with the specified configuration
 * @param {LLMServiceConfig} config - Configuration for the LLM service
 * @returns {LLMService} The created LLM service
 */
export function createService(config) {
  // Implementation
}
```

## Benefits of This Approach

1. **Maintain Type Safety**: JSDoc + `.d.ts` files provide type checking in editors
2. **ESM Support**: `.mjs` extension ensures proper ESM handling
3. **Simplified Build Process**: No TypeScript compilation needed
4. **IDE Support**: VSCode and other editors will provide intellisense with JSDoc + jsconfig.json
5. **Gradual Migration**: Can be done file by file if needed

## Potential Challenges

1. **Complex Types**: Some advanced TypeScript features may be harder to represent in JSDoc
2. **Keeping Types in Sync**: Need to ensure `.d.ts` files stay updated with code changes
3. **Testing Updates**: May need to adjust test configuration
