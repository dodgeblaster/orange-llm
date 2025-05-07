# Core Module Tests

This directory contains unit tests for the core module components of the AI Chat LLM library.

## Test Files

- `index.test.mjs` - Tests for the core module exports
- `model-manager.test.mjs` - Tests for the DefaultModelManager class
- `response-handler.test.mjs` - Tests for the DefaultResponseHandler class
- `tool-manager.test.mjs` - Tests for the DefaultToolManager class

## Running Tests

To run all tests:

```bash
npm test
```

To run only core module tests:

```bash
node --test tests/core
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

## Mocking

Some tests use Node.js's built-in mocking capabilities to mock dependencies:

```javascript
import { mock } from 'node:test';

mock.module('../../src/config/index.mjs', () => ({
  MODEL_GROUPS: {
    // Mock implementation
  }
}));
```

## Test Coverage

These tests aim to cover all functionality of the core module components, including:

- Constructor behavior
- Public method functionality
- Error handling
- Edge cases
