# Config Module Tests

This directory contains unit tests for the config module components of the AI Chat LLM library.

## Test Files

- `index.test.mjs` - Tests for the config module exports
- `models.test.mjs` - Tests for the models configuration
- `pricing.test.mjs` - Tests for the pricing configuration
- `llm-config.test.mjs` - Tests for the LLMConfigManager class

## Running Tests

To run all tests:

```bash
npm test
```

To run only config module tests:

```bash
node --test tests/config
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

## Test Coverage

These tests aim to cover all functionality of the config module components, including:

- Model configuration validation
- Pricing calculation
- Configuration management
- Default values
- Edge cases
