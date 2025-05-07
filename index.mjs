/**
 * LLM Module Public API
 * 
 * This file defines the public interface for the LLM module.
 * Only types, classes, and functions that are intended to be used
 * by external modules should be exported from here.
 */

// Import the factory for creating LLM services
import { LLMServiceFactory } from './src/index.mjs';

/**
 * Re-export all types from the types.d.ts file
 * @typedef {import('./types').LLMProvider} LLMProvider
 * @typedef {import('./types').LLMService} LLMService
 * @typedef {import('./types').LLMServiceConfig} LLMServiceConfig
 * @typedef {import('./types').Tool} Tool
 * @typedef {import('./types').TokenUsage} TokenUsage
 * @typedef {import('./types').ModelPricing} ModelPricing
 * @typedef {import('./types').InvokeResult} InvokeResult
 * @typedef {import('./types').AssistantResponse} AssistantResponse
 * @typedef {import('./types').AssistantToolRequest} AssistantToolRequest
 */

// Export the factory
export { LLMServiceFactory };

// Note: The following components are considered internal implementation details:
// - response-handler.mjs
// - tool-manager.mjs
// - model-manager.mjs (except where exposed through LLMService)
// - providers/ directory (implementation details)
// - config/ directory (internal configuration)
