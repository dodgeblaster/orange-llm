# Orange LLM

This module provides a unified interface for interacting with various LLM providers.

## JavaScript with Type Definitions

This project uses JavaScript (`.mjs` files) with JSDoc comments and TypeScript declaration files (`.d.ts`) to provide type safety without requiring TypeScript compilation.

## Installation

```bash
npm install orange-llm
```

## Usage

```javascript
import { createLLM } from 'orange-llm';

// Create an LLM service
const llm = createLLM({
  provider: 'bedrock',
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  region: 'us-east-1'
});
```
