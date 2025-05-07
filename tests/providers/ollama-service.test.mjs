/**
 * Unit tests for OllamaService
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { OllamaService } from '../../src/providers/ollama-service.mjs';
import { LLMConfigManager } from '../../src/config/llm-config.mjs';

// Mock classes for testing
class MockOllamaClient {
  constructor() {
    this.chatRequests = [];
    this.mockResponse = {
      message: {
        role: 'assistant',
        content: 'Mock response from Ollama'
      }
    };
  }

  async chat(request) {
    this.chatRequests.push(request);
    return this.mockResponse;
  }

  setMockResponse(response) {
    this.mockResponse = response;
  }
}

class MockModelManager {
  constructor(modelId = 'llama3.1') {
    this.currentModel = modelId;
    this.inferenceConfig = { temperature: 0.7 };
  }

  getCurrentModel() {
    return this.currentModel;
  }

  getInferenceConfig() {
    return this.inferenceConfig;
  }

  async handleError(error, retryCallback) {
    return retryCallback();
  }
}

class MockToolManager {
  constructor() {
    this.tools = [];
  }

  registerTools(tools) {
    this.tools = tools;
  }

  getTools() {
    return this.tools;
  }
}

class MockResponseHandler {
  constructor() {
    this.lastResponse = null;
  }

  handleResponse(response) {
    this.lastResponse = response;
    return {
      type: 'ASSISTANT_RESPONSE',
      content: 'Mocked content'
    };
  }
}

class MockMessageStore {
  constructor(messages = []) {
    this.messages = messages;
  }

  getAllMessages() {
    return this.messages;
  }
}

class MockTool {
  constructor(name, description, parameters) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getParameters() {
    return this.parameters;
  }

  async execute(params) {
    return { result: `Executed ${this.name}` };
  }
}

describe('OllamaService', () => {
  let configManager;
  let mockOllamaClient;
  let mockModelManager;
  let mockToolManager;
  let mockResponseHandler;
  let ollamaService;

  beforeEach(() => {
    // Create mocks
    configManager = new LLMConfigManager({
      enableTokenTracking: true,
      debug: false
    });
    mockOllamaClient = new MockOllamaClient();
    mockModelManager = new MockModelManager();
    mockToolManager = new MockToolManager();
    mockResponseHandler = new MockResponseHandler();

    // Create service with mocks
    ollamaService = new OllamaService(
      configManager,
      'http://localhost:11434',
      'llama3.1',
      {
        ollamaClient: mockOllamaClient,
        modelManager: mockModelManager,
        toolManager: mockToolManager,
        responseHandler: mockResponseHandler,
        testing: true
      }
    );
  });

  describe('constructor', () => {
    it('should initialize with provided dependencies', () => {
      assert.strictEqual(ollamaService.configManager, configManager);
      assert.strictEqual(ollamaService.ollamaClient, mockOllamaClient);
      assert.strictEqual(ollamaService.modelManager, mockModelManager);
      assert.strictEqual(ollamaService.toolManager, mockToolManager);
      assert.strictEqual(ollamaService.responseHandler, mockResponseHandler);
      assert.strictEqual(ollamaService.currentModelId, 'llama3.1');
      assert.strictEqual(ollamaService.endpoint, 'http://localhost:11434');
    });

    it('should initialize with default dependencies when not provided', () => {
      const service = new OllamaService(configManager, 'http://localhost:11434', 'llama3.1', { testing: true });
      
      assert.strictEqual(service.configManager, configManager);
      assert.ok(service.ollamaClient);
      assert.ok(service.modelManager);
      assert.ok(service.toolManager);
      assert.ok(service.responseHandler);
      assert.strictEqual(service.currentModelId, 'llama3.1');
    });
  });

  describe('setMessageStore', () => {
    it('should set message store and formatter config', () => {
      const messageStore = new MockMessageStore();
      const formatterConfig = { chatSize: 10 };
      
      ollamaService.setMessageStore(messageStore, formatterConfig);
      
      assert.strictEqual(ollamaService.messageStore, messageStore);
      assert.strictEqual(ollamaService.formatterConfig, formatterConfig);
    });
  });

  describe('getFormattedMessages', () => {
    it('should throw error if message store not set', () => {
      assert.throws(
        () => ollamaService.getFormattedMessages(),
        /MessageStore not set/
      );
    });

    it('should format messages correctly', () => {
      const messages = [
        { bedrockType: 'user', content: 'Hello' },
        { bedrockType: 'assistant', content: 'Hi there' }
      ];
      
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      const formattedMessages = ollamaService.getFormattedMessages();
      
      assert.deepStrictEqual(formattedMessages, [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ]);
    });

    it('should limit messages based on chatSize', () => {
      const messages = [
        { bedrockType: 'system', content: 'System message' },
        { bedrockType: 'user', content: 'Message 1' },
        { bedrockType: 'assistant', content: 'Response 1' },
        { bedrockType: 'user', content: 'Message 2' },
        { bedrockType: 'assistant', content: 'Response 2' }
      ];
      
      ollamaService.setMessageStore(new MockMessageStore(messages), { chatSize: 3 });
      
      const formattedMessages = ollamaService.getFormattedMessages();
      
      // Should include system message and last 2 messages
      assert.strictEqual(formattedMessages.length, 3);
      assert.strictEqual(formattedMessages[0].role, 'system');
      assert.strictEqual(formattedMessages[1].role, 'user');
      assert.strictEqual(formattedMessages[1].content, 'Message 2');
      assert.strictEqual(formattedMessages[2].role, 'assistant');
      assert.strictEqual(formattedMessages[2].content, 'Response 2');
    });

    it('should convert non-string content to string', () => {
      const messages = [
        { bedrockType: 'user', content: { foo: 'bar' } }
      ];
      
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      const formattedMessages = ollamaService.getFormattedMessages();
      
      assert.strictEqual(formattedMessages[0].role, 'user');
      assert.strictEqual(formattedMessages[0].content, '{"foo":"bar"}');
    });
  });

  describe('mapRoleToOllama', () => {
    it('should map valid roles correctly', () => {
      assert.strictEqual(ollamaService.mapRoleToOllama('user'), 'user');
      assert.strictEqual(ollamaService.mapRoleToOllama('assistant'), 'assistant');
      assert.strictEqual(ollamaService.mapRoleToOllama('system'), 'system');
    });

    it('should map invalid roles to user', () => {
      assert.strictEqual(ollamaService.mapRoleToOllama('invalid'), 'user');
      assert.strictEqual(ollamaService.mapRoleToOllama(''), 'user');
    });
  });

  describe('registerTools', () => {
    it('should register tools with tool manager', () => {
      const tools = [new MockTool('test-tool', 'A test tool', {})];
      
      ollamaService.registerTools(tools);
      
      assert.deepStrictEqual(ollamaService.toolManager.tools, tools);
    });
  });

  describe('getToolManager', () => {
    it('should return the tool manager', () => {
      assert.strictEqual(ollamaService.getToolManager(), mockToolManager);
    });
  });

  describe('getToolConfig', () => {
    it('should return undefined when no tools are registered', () => {
      mockToolManager.getTools = () => [];
      
      const toolConfig = ollamaService.getToolConfig();
      
      assert.strictEqual(toolConfig, undefined);
    });

    it('should return formatted tools when tools are registered', () => {
      const tool = new MockTool('test-tool', 'A test tool', { type: 'object' });
      mockToolManager.getTools = () => [tool];
      
      const toolConfig = ollamaService.getToolConfig();
      
      assert.deepStrictEqual(toolConfig, [
        {
          type: 'function',
          function: {
            name: 'test-tool',
            description: 'A test tool',
            parameters: { type: 'object' }
          }
        }
      ]);
    });
  });

  describe('invokeModel', () => {
    it('should invoke the model and return formatted response', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      // Set mock response
      mockOllamaClient.setMockResponse({
        message: {
          role: 'assistant',
          content: 'Hello, how can I help you?'
        }
      });
      
      // Mock the calculateCost method
      ollamaService.configManager.calculateCost = () => ({
        inputCost: '0.0000',
        outputCost: '0.0000',
        totalCost: '0.0000'
      });
      
      const result = await ollamaService.invokeModel(messages);
      
      // Verify the request was sent
      assert.strictEqual(mockOllamaClient.chatRequests.length, 1);
      assert.strictEqual(mockOllamaClient.chatRequests[0].model, 'llama3.1');
      assert.strictEqual(mockOllamaClient.chatRequests[0].stream, false);
      
      // Verify the response was processed
      assert.strictEqual(result.type, 'ASSISTANT_RESPONSE');
      assert.strictEqual(result.content, 'Hello, how can I help you?');
      assert.ok(result.tokenUsage);
      assert.ok(result.costInfo);
    });

    it('should include tools in the request when available', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      // Setup tools
      const tool = new MockTool('test-tool', 'A test tool', { type: 'object' });
      mockToolManager.getTools = () => [tool];
      
      // Set mock response
      mockOllamaClient.setMockResponse({
        message: {
          role: 'assistant',
          content: 'I need to use a tool'
        }
      });
      
      await ollamaService.invokeModel(messages);
      
      // Verify tools were included in the request
      assert.strictEqual(mockOllamaClient.chatRequests.length, 1);
      assert.ok(mockOllamaClient.chatRequests[0].tools);
      assert.strictEqual(mockOllamaClient.chatRequests[0].tools.length, 1);
      assert.strictEqual(mockOllamaClient.chatRequests[0].tools[0].function.name, 'test-tool');
    });

    it('should handle tool calls in the response', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      // Set mock response with tool calls
      mockOllamaClient.setMockResponse({
        message: {
          role: 'assistant',
          content: 'I need to use a tool',
          tool_calls: [
            {
              id: 'tool-123',
              function: {
                name: 'test-tool',
                arguments: '{"param":"value"}'
              }
            }
          ]
        }
      });
      
      const result = await ollamaService.invokeModel(messages);
      
      // Verify the response was processed as a tool request
      assert.strictEqual(result.type, 'ASSISTANT_TOOL_REQUEST');
      assert.strictEqual(result.content, 'I need to use a tool');
      assert.strictEqual(result.toolCalls.length, 1);
      assert.strictEqual(result.toolCalls[0].name, 'test-tool');
      assert.deepStrictEqual(result.toolCalls[0].input, { param: 'value' });
      assert.strictEqual(result.toolCalls[0].toolUseId, 'tool-123');
    });

    it('should handle errors through model manager', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      ollamaService.setMessageStore(new MockMessageStore(messages));
      
      // Make the client throw an error
      mockOllamaClient.chat = async () => {
        throw new Error('Test error');
      };
      
      // Mock handleError to track calls
      let handleErrorCalled = false;
      mockModelManager.handleError = async (error, callback) => {
        handleErrorCalled = true;
        return {
          type: 'ASSISTANT_RESPONSE',
          content: 'Error handled response'
        };
      };
      
      const result = await ollamaService.invokeModel(messages);
      
      assert.strictEqual(handleErrorCalled, true);
      assert.strictEqual(result.type, 'ASSISTANT_RESPONSE');
      assert.strictEqual(result.content, 'Error handled response');
    });
  });

  describe('processOllamaResponse', () => {
    it('should process standard text response', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'This is a standard response'
        }
      };
      
      const tokenUsageData = {
        requestTokens: { input: 10, output: 20 },
        costInfo: { inputCost: '0.0000', outputCost: '0.0000', totalCost: '0.0000' }
      };
      
      const result = ollamaService.processOllamaResponse(response, tokenUsageData);
      
      assert.strictEqual(result.type, 'ASSISTANT_RESPONSE');
      assert.strictEqual(result.content, 'This is a standard response');
      assert.deepStrictEqual(result.tokenUsage, { input: 10, output: 20 });
      assert.deepStrictEqual(result.costInfo, { inputCost: '0.0000', outputCost: '0.0000', totalCost: '0.0000' });
    });

    it('should process tool call response', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'I need to use a tool',
          tool_calls: [
            {
              id: 'tool-123',
              function: {
                name: 'test-tool',
                arguments: '{"param":"value"}'
              }
            }
          ]
        }
      };
      
      const tokenUsageData = {
        requestTokens: { input: 10, output: 20 },
        costInfo: { inputCost: '0.0000', outputCost: '0.0000', totalCost: '0.0000' }
      };
      
      const result = ollamaService.processOllamaResponse(response, tokenUsageData);
      
      assert.strictEqual(result.type, 'ASSISTANT_TOOL_REQUEST');
      assert.strictEqual(result.content, 'I need to use a tool');
      assert.strictEqual(result.toolCalls.length, 1);
      assert.strictEqual(result.toolCalls[0].name, 'test-tool');
      assert.deepStrictEqual(result.toolCalls[0].input, { param: 'value' });
      assert.strictEqual(result.toolCalls[0].toolUseId, 'tool-123');
    });

    it('should handle malformed tool arguments', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'I need to use a tool',
          tool_calls: [
            {
              id: 'tool-123',
              function: {
                name: 'test-tool',
                arguments: 'invalid-json'
              }
            }
          ]
        }
      };
      
      const tokenUsageData = {
        requestTokens: { input: 10, output: 20 },
        costInfo: { inputCost: '0.0000', outputCost: '0.0000', totalCost: '0.0000' }
      };
      
      const result = ollamaService.processOllamaResponse(response, tokenUsageData);
      
      assert.strictEqual(result.type, 'ASSISTANT_TOOL_REQUEST');
      assert.strictEqual(result.toolCalls.length, 1);
      assert.strictEqual(result.toolCalls[0].name, 'test-tool');
      assert.deepStrictEqual(result.toolCalls[0].input, {});
    });
  });

  describe('convertToolsToOllamaFormat', () => {
    it('should convert tools to Ollama format', () => {
      const tools = [
        new MockTool('tool1', 'Tool 1 description', { type: 'object' }),
        new MockTool('tool2', 'Tool 2 description', { type: 'object', properties: {} })
      ];
      
      mockToolManager.getTools = () => tools;
      
      const formattedTools = ollamaService.convertToolsToOllamaFormat();
      
      assert.strictEqual(formattedTools.length, 2);
      assert.strictEqual(formattedTools[0].type, 'function');
      assert.strictEqual(formattedTools[0].function.name, 'tool1');
      assert.strictEqual(formattedTools[0].function.description, 'Tool 1 description');
      assert.deepStrictEqual(formattedTools[0].function.parameters, { type: 'object' });
      
      assert.strictEqual(formattedTools[1].type, 'function');
      assert.strictEqual(formattedTools[1].function.name, 'tool2');
      assert.strictEqual(formattedTools[1].function.description, 'Tool 2 description');
      assert.deepStrictEqual(formattedTools[1].function.parameters, { type: 'object', properties: {} });
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate token count based on text length', () => {
      assert.strictEqual(ollamaService.estimateTokenCount('Hello'), 2);
      assert.strictEqual(ollamaService.estimateTokenCount('This is a longer text that should have more tokens'), 13);
      assert.strictEqual(ollamaService.estimateTokenCount(''), 0);
    });
  });

  describe('trackTokenUsage', () => {
    it('should track token usage and calculate costs', () => {
      // Mock the calculateCost method
      ollamaService.configManager.calculateCost = () => ({
        inputCost: '0.0000',
        outputCost: '0.0000',
        totalCost: '0.0000'
      });
      
      const result = ollamaService.trackTokenUsage(10, 20);
      
      assert.deepStrictEqual(result.requestTokens, { input: 10, output: 20 });
      assert.deepStrictEqual(result.costInfo, {
        inputCost: '0.0000',
        outputCost: '0.0000',
        totalCost: '0.0000'
      });
      
      // Check that the service's token usage was updated
      assert.strictEqual(ollamaService.tokenUsage.input, 10);
      assert.strictEqual(ollamaService.tokenUsage.output, 20);
    });

    it('should return zeros when token tracking is disabled', () => {
      // Disable token tracking
      ollamaService.configManager.isTokenTrackingEnabled = () => false;
      
      const result = ollamaService.trackTokenUsage(10, 20);
      
      assert.deepStrictEqual(result.requestTokens, { input: 0, output: 0 });
      assert.deepStrictEqual(result.costInfo, {
        inputCost: '0.00',
        outputCost: '0.00',
        totalCost: '0.00'
      });
    });
  });
});
