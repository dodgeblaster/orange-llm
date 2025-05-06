/**
 * LLM Module Public API
 * 
 * This file defines the public interface for the LLM module.
 * Only types, classes, and functions that are intended to be used
 * by external modules should be exported from here.
 */

// Public types that form the core API contract
import { 
  LLMProvider,
  LLMService, 
  LLMServiceConfig,
  Tool,
  TokenUsage,
  ModelPricing,
  InvokeResult,
  AssistantResponse,
  AssistantToolRequest
} from './types.js';

// Main factory for creating LLM services
import { LLMServiceFactory } from './llm-service-factory.js';

// Export only the public interface
export {
  // Core types for the public API
  LLMProvider,
  LLMService,
  LLMServiceConfig,
  Tool,
  TokenUsage,
  ModelPricing,
  InvokeResult,
  AssistantResponse,
  AssistantToolRequest,
  
  // Main factory for creating services
  LLMServiceFactory
};

// Note: The following components are considered internal implementation details:
// - response-handler.ts
// - tool-manager.ts
// - model-manager.ts (except where exposed through LLMService)
// - providers/ directory (implementation details)
// - config/ directory (internal configuration)
