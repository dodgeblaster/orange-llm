# AI Chat LLM Module

This module provides a unified interface for interacting with various LLM providers.

## JavaScript with Type Definitions

This project uses JavaScript (`.mjs` files) with JSDoc comments and TypeScript declaration files (`.d.ts`) to provide type safety without requiring TypeScript compilation.

## Installation

```bash
npm install ai-chat-llm
```

## Usage

```javascript
import { LLMServiceFactory } from 'ai-chat-llm';
import { LLMProvider } from 'ai-chat-llm/types.mjs';

// Create an LLM service
const service = LLMServiceFactory.createService({
  provider: LLMProvider.BEDROCK,
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
  region: 'us-east-1'
});

// Use the service
// ...
```

## Project Structure

```
src/
├── core/                  # Core functionality
│   ├── model-manager.mjs
│   ├── response-handler.mjs
│   ├── tool-manager.mjs
│   └── index.mjs          # Exports all core components
│
├── config/                # Configuration
│   ├── llm-config.mjs
│   ├── models.mjs
│   ├── pricing.mjs
│   └── index.mjs
│
├── providers/             # Provider implementations
│   ├── bedrock-service.mjs
│   ├── ollama-service.mjs
│   └── index.mjs
│
├── types.mjs              # Type definitions
└── index.mjs              # Main entry point (exports factory and types)
```

## No Build Step Required

This library uses native JavaScript (`.mjs`) files that can be imported directly without any build or compilation step. Type information is provided through JSDoc comments and TypeScript declaration files.

## Examples

The `examples` directory contains several examples showing how to use the library:

- `simple-chat.mjs` - Basic chat example
- `tool-usage.mjs` - Using tools with LLMs
- `conversation.mjs` - Multi-turn conversation
- `multi-provider.mjs` - Using multiple LLM providers
- `streaming.mjs` - Simulated streaming responses

Run examples with:

```bash
npm run example:simple
npm run example:tools
npm run example:conversation
npm run example:multi
npm run example:streaming
```

## Testing

This project uses Node.js's built-in test runner for testing. No third-party testing libraries are required.

### Running Tests

```bash
npm test
```

### Test Structure

Tests are located in the `tests` directory and follow the naming convention `*.test.mjs`. The tests focus on verifying the public API exposed in `index.mjs`.

### Writing Tests

Tests use the Node.js built-in test runner with the following structure:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Feature', () => {
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    assert.ok(true);
  });
});
```

## Public API

The public API is exposed through `index.mjs` and includes:

- `LLMServiceFactory` - Factory for creating LLM services

Type definitions are provided in `.d.ts` files and include:
- `LLMService` - Interface for interacting with LLM services
- `Tool` - Interface for defining tools that can be used by LLMs
- Response types (`AssistantResponse`, `AssistantToolRequest`, `InvokeResult`)
- Configuration types (`LLMServiceConfig`, `TokenUsage`, etc.)

## Adding New Tests

To add new tests:

1. Create a new file in the `tests` directory with the `.test.mjs` extension
2. Import the necessary modules and types
3. Write your tests using the Node.js test runner
4. Run the tests with `npm test`
