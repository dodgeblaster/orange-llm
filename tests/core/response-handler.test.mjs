/**
 * Unit tests for DefaultResponseHandler
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DefaultResponseHandler } from '../../src/core/response-handler.mjs';

describe('DefaultResponseHandler', () => {
  let responseHandler;

  describe('constructor', () => {
    it('should initialize correctly', () => {
      responseHandler = new DefaultResponseHandler();
      assert.ok(responseHandler instanceof DefaultResponseHandler);
    });
  });

  describe('handleResponse', () => {
    it('should handle end_turn response', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        stopReason: 'end_turn',
        output: {
          message: {
            content: [
              { text: 'Hello' },
              { text: 'World' }
            ]
          }
        }
      };
      
      const result = responseHandler.handleResponse(mockResponse);
      
      assert.deepStrictEqual(result, {
        type: 'ASSISTANT_RESPONSE',
        content: 'Hello\nWorld'
      });
    });

    it('should handle tool_use response', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        stopReason: 'tool_use',
        output: {
          message: {
            content: [
              { text: 'I need to use a tool' },
              { 
                toolUse: {
                  name: 'calculator',
                  input: { expression: '2+2' },
                  toolUseId: 'tool-123'
                }
              }
            ]
          }
        }
      };
      
      const result = responseHandler.handleResponse(mockResponse);
      
      assert.deepStrictEqual(result, {
        type: 'ASSISTANT_TOOL_REQUEST',
        content: 'I need to use a tool',
        toolCalls: [
          {
            name: 'calculator',
            input: { expression: '2+2' },
            toolUseId: 'tool-123'
          }
        ]
      });
    });

    it('should throw error for unknown stop reason', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        stopReason: 'unknown_reason'
      };
      
      assert.throws(
        () => responseHandler.handleResponse(mockResponse),
        /Unknown stop reason: unknown_reason/
      );
    });
  });

  describe('makeAssistanceResponse', () => {
    it('should create an AssistantResponse with content', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'Hello' },
              { text: 'World' }
            ]
          }
        }
      };
      
      const result = responseHandler.makeAssistanceResponse(mockResponse);
      
      assert.deepStrictEqual(result, {
        type: 'ASSISTANT_RESPONSE',
        content: 'Hello\nWorld'
      });
    });
  });

  describe('makeAssistantToolRequest', () => {
    it('should create an AssistantToolRequest with content and tool calls', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'I need to use a tool' },
              { 
                toolUse: {
                  name: 'calculator',
                  input: { expression: '2+2' },
                  toolUseId: 'tool-123'
                }
              }
            ]
          }
        }
      };
      
      const result = responseHandler.makeAssistantToolRequest(mockResponse);
      
      assert.deepStrictEqual(result, {
        type: 'ASSISTANT_TOOL_REQUEST',
        content: 'I need to use a tool',
        toolCalls: [
          {
            name: 'calculator',
            input: { expression: '2+2' },
            toolUseId: 'tool-123'
          }
        ]
      });
    });
  });

  describe('extractContentText', () => {
    it('should extract text content from response', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'Hello' },
              { text: 'World' }
            ]
          }
        }
      };
      
      const result = responseHandler.extractContentText(mockResponse);
      assert.strictEqual(result, 'Hello\nWorld');
    });

    it('should return empty string if no content', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {};
      const result = responseHandler.extractContentText(mockResponse);
      assert.strictEqual(result, '');
    });

    it('should filter out non-text blocks', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'Hello' },
              { toolUse: { name: 'tool1' } },
              { text: 'World' }
            ]
          }
        }
      };
      
      const result = responseHandler.extractContentText(mockResponse);
      assert.strictEqual(result, 'Hello\nWorld');
    });
  });

  describe('extractToolCalls', () => {
    it('should extract tool calls from response', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'Using tools' },
              { 
                toolUse: {
                  name: 'calculator',
                  input: { expression: '2+2' },
                  toolUseId: 'tool-123'
                }
              },
              { 
                toolUse: {
                  name: 'weather',
                  input: { location: 'Seattle' },
                  toolUseId: 'tool-456'
                }
              }
            ]
          }
        }
      };
      
      const result = responseHandler.extractToolCalls(mockResponse);
      
      assert.deepStrictEqual(result, [
        {
          name: 'calculator',
          input: { expression: '2+2' },
          toolUseId: 'tool-123'
        },
        {
          name: 'weather',
          input: { location: 'Seattle' },
          toolUseId: 'tool-456'
        }
      ]);
    });

    it('should return empty array if no tool calls', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {
        output: {
          message: {
            content: [
              { text: 'Just text, no tools' }
            ]
          }
        }
      };
      
      const result = responseHandler.extractToolCalls(mockResponse);
      assert.deepStrictEqual(result, []);
    });

    it('should return empty array if no content', () => {
      responseHandler = new DefaultResponseHandler();
      
      const mockResponse = {};
      const result = responseHandler.extractToolCalls(mockResponse);
      assert.deepStrictEqual(result, []);
    });
  });
});
