# Providers Module Tests

This directory contains unit tests for the providers module components of the AI Chat LLM library.

## Test Files

- `index.test.mjs` - Tests for the providers module exports
- `bedrock-service.test.mjs` - Tests for the BedrockService class
- `ollama-service.test.mjs` - Tests for the OllamaService class

## Running Tests

To run all tests:

```bash
npm test
```

To run only providers module tests:

```bash
node --test tests/providers
```

## Test Structure

Each test file follows the Node.js built-in test runner structure:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Component', () => {
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    assert.ok(true);
  });
});
```

## Mocking Strategy

These tests use dependency injection to mock external dependencies:

1. **AWS SDK Mocking**: The BedrockService tests use a mock BedrockRuntimeClient to avoid making actual AWS API calls.

2. **Ollama Client Mocking**: The OllamaService tests use a mock Ollama client to avoid making actual Ollama API calls.

3. **Core Components Mocking**: Both services use mock versions of ModelManager, ToolManager, and ResponseHandler.

## Test Coverage

These tests aim to cover all functionality of the providers module components, including:

- Service initialization
- Message formatting
- Tool registration and formatting
- Model invocation
- Response processing
- Error handling
- Token usage tracking
