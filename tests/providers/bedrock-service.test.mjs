/**
 * Unit tests for BedrockService
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BedrockService } from '../../src/providers/bedrock-service.mjs';
import { LLMConfigManager } from '../../src/config/llm-config.mjs';

// Mock classes for testing
class MockBedrockClient {
  constructor() {
    this.sentCommands = [];
    this.mockResponse = {
      stopReason: 'end_turn',
      usage: {
        inputTokens: 100,
        outputTokens: 50
      },
      output: {
        message: {
          content: [
            { text: 'Mock response' }
          ]
        }
      }
    };
  }

  async send(command) {
    this.sentCommands.push(command);
    return this.mockResponse;
  }

  setMockResponse(response) {
    this.mockResponse = response;
  }
}

class MockModelManager {
  constructor(modelId = 'test-model') {
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

  getToolConfig() {
    return undefined;
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

describe('BedrockService', () => {
  let configManager;
  let mockClient;
  let mockModelManager;
  let mockToolManager;
  let mockResponseHandler;
  let bedrockService;

  beforeEach(() => {
    // Create mocks
    configManager = new LLMConfigManager({
      enableTokenTracking: true,
      debug: false
    });
    mockClient = new MockBedrockClient();
    mockModelManager = new MockModelManager();
    mockToolManager = new MockToolManager();
    mockResponseHandler = new MockResponseHandler();

    // Create service with mocks
    bedrockService = new BedrockService(
      configManager,
      'us-east-1',
      'test-model',
      {
        client: mockClient,
        modelManager: mockModelManager,
        toolManager: mockToolManager,
        responseHandler: mockResponseHandler,
        testing: true
      }
    );
  });

  describe('constructor', () => {
    it('should initialize with provided dependencies', () => {
      assert.strictEqual(bedrockService.configManager, configManager);
      assert.strictEqual(bedrockService.client, mockClient);
      assert.strictEqual(bedrockService.modelManager, mockModelManager);
      assert.strictEqual(bedrockService.toolManager, mockToolManager);
      assert.strictEqual(bedrockService.responseHandler, mockResponseHandler);
      assert.strictEqual(bedrockService.currentModelId, 'test-model');
    });

    it('should initialize with default dependencies when not provided', () => {
      const service = new BedrockService(configManager, 'us-east-1', 'test-model', { testing: true });
      
      assert.strictEqual(service.configManager, configManager);
      assert.ok(service.client);
      assert.ok(service.modelManager);
      assert.ok(service.toolManager);
      assert.ok(service.responseHandler);
      assert.strictEqual(service.currentModelId, 'test-model');
    });
  });

  describe('setMessageStore', () => {
    it('should set message store and formatter config', () => {
      const messageStore = new MockMessageStore();
      const formatterConfig = { chatSize: 10 };
      
      bedrockService.setMessageStore(messageStore, formatterConfig);
      
      assert.strictEqual(bedrockService.messageStore, messageStore);
      assert.strictEqual(bedrockService.formatterConfig, formatterConfig);
    });
  });

  describe('getFormattedMessages', () => {
    it('should throw error if message store not set', () => {
      assert.throws(
        () => bedrockService.getFormattedMessages(),
        /MessageStore not set/
      );
    });

    it('should format messages correctly', () => {
      const messages = [
        { bedrockType: 'user', content: 'Hello' },
        { bedrockType: 'assistant', content: 'Hi there' }
      ];
      
      bedrockService.setMessageStore(new MockMessageStore(messages));
      
      const formattedMessages = bedrockService.getFormattedMessages();
      
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
      
      bedrockService.setMessageStore(new MockMessageStore(messages), { chatSize: 3 });
      
      const formattedMessages = bedrockService.getFormattedMessages();
      
      // Should include system message and last 2 messages
      assert.strictEqual(formattedMessages.length, 3);
      assert.strictEqual(formattedMessages[0].role, 'system');
      assert.strictEqual(formattedMessages[1].role, 'user');
      assert.strictEqual(formattedMessages[1].content, 'Message 2');
      assert.strictEqual(formattedMessages[2].role, 'assistant');
      assert.strictEqual(formattedMessages[2].content, 'Response 2');
    });
  });

  describe('registerTools', () => {
    it('should register tools with tool manager', () => {
      const tools = [{ getName: () => 'test-tool' }];
      
      bedrockService.registerTools(tools);
      
      assert.deepStrictEqual(bedrockService.toolManager.tools, tools);
    });
  });

  describe('getToolManager', () => {
    it('should return the tool manager', () => {
      assert.strictEqual(bedrockService.getToolManager(), mockToolManager);
    });
  });

  describe('convertMessagesToBedrockFormat', () => {
    it('should convert messages to Bedrock format', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' }
      ];
      
      const converted = bedrockService.convertMessagesToBedrockFormat(messages);
      
      assert.deepStrictEqual(converted, [
        { role: 'user', content: [{ text: 'Hello' }] },
        { role: 'assistant', content: [{ text: 'Hi there' }] }
      ]);
    });

    it('should filter out empty messages', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: '' },
        { role: 'user', content: '  ' }
      ];
      
      const converted = bedrockService.convertMessagesToBedrockFormat(messages);
      
      assert.strictEqual(converted.length, 1);
      assert.deepStrictEqual(converted[0], { role: 'user', content: [{ text: 'Hello' }] });
    });

    it('should handle non-string content', () => {
      const messages = [
        { role: 'user', content: { custom: 'content' } }
      ];
      
      const converted = bedrockService.convertMessagesToBedrockFormat(messages);
      
      assert.deepStrictEqual(converted, [
        { role: 'user', content: { custom: 'content' } }
      ]);
    });
  });

  describe('extractSystemMessage', () => {
    it('should extract system message content', () => {
      const messages = [
        { role: 'system', content: 'System instruction' },
        { role: 'user', content: 'Hello' }
      ];
      
      const systemMessage = bedrockService.extractSystemMessage(messages);
      
      assert.strictEqual(systemMessage, 'System instruction');
    });

    it('should return empty string if no system message', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' }
      ];
      
      const systemMessage = bedrockService.extractSystemMessage(messages);
      
      assert.strictEqual(systemMessage, '');
    });
  });

  describe('invokeModel', () => {
    it('should invoke the model and return formatted response', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      bedrockService.setMessageStore(new MockMessageStore(messages));
      
      // Set mock response
      mockClient.setMockResponse({
        stopReason: 'end_turn',
        usage: {
          inputTokens: 10,
          outputTokens: 20
        },
        output: {
          message: {
            content: [
              { text: 'Hello, how can I help you?' }
            ]
          }
        }
      });
      
      // Mock the calculateCost method
      bedrockService.configManager.calculateCost = () => ({
        inputCost: '0.0001',
        outputCost: '0.0002',
        totalCost: '0.0003'
      });
      
      const result = await bedrockService.invokeModel(messages);
      
      // Verify the command was sent
      assert.strictEqual(mockClient.sentCommands.length, 1);
      
      // Verify the response was processed
      assert.strictEqual(result.type, 'ASSISTANT_RESPONSE');
      assert.strictEqual(result.content, 'Mocked content');
      assert.deepStrictEqual(result.tokenUsage, { input: 10, output: 20 });
      assert.deepStrictEqual(result.costInfo, {
        inputCost: '0.0001',
        outputCost: '0.0002',
        totalCost: '0.0003'
      });
    });

    it('should handle errors through model manager', async () => {
      // Setup message store
      const messages = [
        { bedrockType: 'user', content: 'Hello' }
      ];
      bedrockService.setMessageStore(new MockMessageStore(messages));
      
      // Make the client throw an error
      mockClient.send = async () => {
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
      
      const result = await bedrockService.invokeModel(messages);
      
      assert.strictEqual(handleErrorCalled, true);
      assert.strictEqual(result.type, 'ASSISTANT_RESPONSE');
      assert.strictEqual(result.content, 'Error handled response');
    });
  });

  describe('trackTokenUsage', () => {
    it('should track token usage and calculate costs', () => {
      // Mock the calculateCost method
      bedrockService.configManager.calculateCost = () => ({
        inputCost: '0.0001',
        outputCost: '0.0002',
        totalCost: '0.0003'
      });
      
      const result = bedrockService.trackTokenUsage(10, 20);
      
      assert.deepStrictEqual(result.requestTokens, { input: 10, output: 20 });
      assert.deepStrictEqual(result.costInfo, {
        inputCost: '0.0001',
        outputCost: '0.0002',
        totalCost: '0.0003'
      });
      
      // Check that the service's token usage was updated
      assert.strictEqual(bedrockService.tokenUsage.input, 10);
      assert.strictEqual(bedrockService.tokenUsage.output, 20);
    });

    it('should return zeros when token tracking is disabled', () => {
      // Disable token tracking
      bedrockService.configManager.isTokenTrackingEnabled = () => false;
      
      const result = bedrockService.trackTokenUsage(10, 20);
      
      assert.deepStrictEqual(result.requestTokens, { input: 0, output: 0 });
      assert.deepStrictEqual(result.costInfo, {
        inputCost: '0.00',
        outputCost: '0.00',
        totalCost: '0.00'
      });
    });
  });

  describe('prepareCommand', () => {
    it('should prepare command with correct parameters', async () => {
      const messages = [
        { role: 'system', content: 'System instruction' },
        { role: 'user', content: 'Hello' }
      ];
      
      // Mock the tool config
      mockToolManager.getToolConfig = () => ({
        tools: [{ name: 'test-tool' }],
        toolChoice: { auto: {} }
      });
      
      // Mock the inference config
      mockModelManager.getInferenceConfig = () => ({
        temperature: 0.7,
        maxTokens: 2048
      });
      
      const command = await bedrockService.prepareCommand(messages);
      
      assert.strictEqual(command.input.modelId, 'test-model');
      assert.deepStrictEqual(command.input.system, [{ text: 'System instruction' }]);
      assert.deepStrictEqual(command.input.toolConfig, {
        tools: [{ name: 'test-tool' }],
        toolChoice: { auto: {} }
      });
      assert.deepStrictEqual(command.input.inferenceConfig, {
        temperature: 0.7,
        maxTokens: 2048
      });
    });
  });
});
