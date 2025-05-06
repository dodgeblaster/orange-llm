/**
 * @typedef {import('../types').LLMFormatterConfig} LLMFormatterConfig
 * @typedef {import('../types').LLMService} LLMService
 * @typedef {import('../types').MessageStoreInterface} MessageStoreInterface
 * @typedef {import('../types').TokenUsage} TokenUsage
 * @typedef {import('../types').Tool} Tool
 * @typedef {import('../types').InvokeResult} InvokeResult
 */

import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DefaultModelManager } from '../model-manager.mjs';
import { DefaultToolManager } from '../tool-manager.mjs';
import { DefaultResponseHandler } from '../response-handler.mjs';
import { LLMConfigManager } from '../config/index.mjs';

// Session-level token usage tracking
/** @type {TokenUsage} */
const sessionTokenUsage = {
  input: 0,
  output: 0
};

/**
 * Bedrock implementation of the LLM service
 * @implements {LLMService}
 */
export class BedrockService {
  /**
   * @param {string} [region='us-west-2'] - AWS region
   * @param {string} [modelId='amazon.nova-micro-v1:0'] - Model ID
   */
  constructor(
    region = 'us-west-2',
    modelId = 'amazon.nova-micro-v1:0'
  ) {
    // Get configuration manager instance
    this.configManager = LLMConfigManager.getInstance();
    
    // Initialize client with hardcoded region that was working before
    this.client = new BedrockRuntimeClient({ region: 'us-east-1' });
    
    // Initialize managers with the provided model ID directly
    this.modelManager = new DefaultModelManager(modelId);
    this.toolManager = new DefaultToolManager();
    this.responseHandler = new DefaultResponseHandler();
    this.currentModelId = modelId;
    
    /** @type {MessageStoreInterface|null} */
    this.messageStore = null;
    
    /** @type {LLMFormatterConfig} */
    this.formatterConfig = {};
    
    /** @type {TokenUsage} */
    this.tokenUsage = { input: 0, output: 0 };
    
    console.log(`Initialized Bedrock service with model: ${modelId}`);
  }
  
  /**
   * Set the message store for formatting messages
   * @param {MessageStoreInterface} messageStore - The message store
   * @param {LLMFormatterConfig} [config={}] - Configuration for the formatter
   */
  setMessageStore(messageStore, config = {}) {
    this.messageStore = messageStore;
    this.formatterConfig = config;
  }
  
  /**
   * Get messages formatted for Bedrock API
   * @returns {Array<{role: string, content: string|object}>} Formatted messages
   */
  getFormattedMessages() {
    if (!this.messageStore) {
      throw new Error('MessageStore not set. Call setMessageStore() first.');
    }
    
    let messages = this.messageStore.getAllMessages()
      .map(message => ({
        role: message.bedrockType,
        content: message.content
      }));

    if (this.formatterConfig.chatSize && messages.length > this.formatterConfig.chatSize) {
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      
      const recentMessages = nonSystemMessages.slice(
        -(this.formatterConfig.chatSize - systemMessages.length)
      );
      
      messages = [...systemMessages, ...recentMessages];
    }
    
    return messages;
  }
  
  /**
   * Register tools with the service
   * @param {Tool[]} tools - The tools to register
   */
  registerTools(tools) {
    console.log('Registering tools with Bedrock:', tools.map(t => t.getName()));
    this.toolManager.registerTools(tools);
  }

  /**
   * Get the tool manager
   * @returns {DefaultToolManager} The tool manager
   */
  getToolManager() {
    return this.toolManager;
  }

  /**
   * Convert messages to Bedrock format
   * @param {Array<{role: string, content: string|object}>} messages - The messages to convert
   * @returns {Array<{role: string, content: Array<{text: string}>}>} Converted messages
   * @private
   */
  convertMessagesToBedrockFormat(messages) {
    return messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => {
        if (typeof msg.content !== 'string') {
          return {
            role: msg.role,
            content: msg.content
          };
        }

        const content = msg.content || '';
        if (!content.trim()) {
          return null;
        }
        
        return {
          role: msg.role,
          content: [
            {
              text: content
            }
          ]
        };
      })
      .filter(Boolean);
  }
  
  /**
   * Extract system message from messages
   * @param {Array<{role: string, content: string}>} messages - The messages
   * @returns {string} The system message content
   * @private
   */
  extractSystemMessage(messages) {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage ? systemMessage.content : '';
  }
  
  /**
   * Invoke the model with messages
   * @param {Array<{role: string, content: string|object}>} messages - The messages to send
   * @returns {Promise<InvokeResult>} The result of the invocation
   */
  async invokeModel(messages) {
    try {
      const command = await this.prepareCommand(messages);
      const response = await this.client.send(command);

      // Track token usage and calculate costs
      const inputTokens = response.usage?.inputTokens || 0;
      const outputTokens = response.usage?.outputTokens || 0;
      const tokenUsageData = this.trackTokenUsage(inputTokens, outputTokens);
      
      // Get the base response from the response handler
      const baseResponse = this.responseHandler.handleResponse(response);
      
      // Add token usage and cost information to the response
      return {
        ...baseResponse,
        tokenUsage: tokenUsageData.requestTokens,
        costInfo: tokenUsageData.costInfo
      };
    } catch (error) {
      return await this.modelManager.handleError(error, () => this.invokeModel(messages));
    }
  }
  
  /**
   * Track token usage and calculate cost information
   * @param {number} inputTokens - Number of input tokens used in the request
   * @param {number} outputTokens - Number of output tokens generated in the response
   * @returns {{requestTokens: TokenUsage, sessionTokens: TokenUsage, costInfo: {inputCost: string, outputCost: string, totalCost: string}}}
   * @private
   */
  trackTokenUsage(inputTokens, outputTokens) {
    // Skip tracking if disabled in config
    if (!this.configManager.isTokenTrackingEnabled()) {
      return {
        requestTokens: { input: 0, output: 0 },
        sessionTokens: { input: 0, output: 0 },
        costInfo: { inputCost: '0.00', outputCost: '0.00', totalCost: '0.00' }
      };
    }
    
    // Update request-specific token counts
    this.tokenUsage.input += inputTokens;
    this.tokenUsage.output += outputTokens;
    
    // Update session-level token counts
    sessionTokenUsage.input += inputTokens;
    sessionTokenUsage.output += outputTokens;
    
    // Calculate costs using the configuration manager
    const costInfo = this.configManager.calculateCost(
      this.currentModelId,
      inputTokens,
      outputTokens
    );
    
    // Return token usage and cost information
    return {
      requestTokens: {
        input: inputTokens,
        output: outputTokens
      },
      sessionTokens: {
        input: this.tokenUsage.input,
        output: this.tokenUsage.output
      },
      costInfo
    };
  }
  
  /**
   * Prepare the command for Bedrock
   * @param {Array<{role: string, content: string|object}>} messages - The messages to send
   * @returns {Promise<ConverseCommand>} The prepared command
   * @private
   */
  async prepareCommand(messages) {
    const formattedMessages = this.convertMessagesToBedrockFormat(messages);
    const systemContent = this.extractSystemMessage(messages);
    const toolConfig = this.toolManager.getToolConfig();
    
    // Update the current model ID
    this.currentModelId = this.modelManager.getCurrentModel();
    
    return new ConverseCommand({
      modelId: this.currentModelId,
      messages: formattedMessages,
      system: [{ text: systemContent }],
      toolConfig,
      inferenceConfig: this.modelManager.getInferenceConfig()
    });
  }
}
