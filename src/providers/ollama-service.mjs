import ollama from 'ollama';
import { DefaultModelManager, DefaultToolManager, DefaultResponseHandler } from '../core/index.mjs';

// Session-level token usage tracking
const sessionTokenUsage = {
  input: 0,
  output: 0
};

/**
 * Ollama implementation of the LLM service
 * @implements {LLMService}
 */
export class OllamaService {
  /**
   * @param {LLMConfigManager} configManager - Configuration manager instance
   * @param {string} [endpoint='http://localhost:11434'] - Ollama API endpoint
   * @param {string} [modelId='llama3.1'] - Model ID
   * @param {object} [options={}] - Additional options
   * @param {object} [options.ollamaClient] - Custom Ollama client for testing
   * @param {DefaultModelManager} [options.modelManager] - Custom model manager for testing
   * @param {DefaultToolManager} [options.toolManager] - Custom tool manager for testing
   * @param {DefaultResponseHandler} [options.responseHandler] - Custom response handler for testing
   * @param {boolean} [options.testing=false] - Whether running in test mode
   */
  constructor(
    configManager,
    endpoint = 'http://localhost:11434',
    modelId = 'llama3.1',
    options = {}
  ) {
    // Store the configuration manager instance
    this.configManager = configManager;
    
    // Set the Ollama API endpoint
    this.endpoint = endpoint;
    
    // Initialize managers with provided instances or create new ones
    this.modelManager = options.modelManager || new DefaultModelManager(modelId, configManager);
    this.toolManager = options.toolManager || new DefaultToolManager();
    this.responseHandler = options.responseHandler || new DefaultResponseHandler();
    this.currentModelId = modelId;
    
    // Store the Ollama client (or use the default)
    this.ollamaClient = options.ollamaClient || ollama;
    
    /** @type {MessageStoreInterface|null} */
    this.messageStore = null;
    
    /** @type {LLMFormatterConfig} */
    this.formatterConfig = {};
    
    this.tokenUsage = { input: 0, output: 0 };
    
    // Configure Ollama with the endpoint
    if (endpoint && endpoint !== 'http://localhost:11434' && !options.testing) {
      // Set the Ollama API base URL if it's not the default
      process.env.OLLAMA_HOST = endpoint;
    }
    
    // Only log in non-test environments
    if (!options.testing) {
      console.log(`Initialized Ollama service with model: ${modelId} at endpoint: ${endpoint}`);
    }
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
   * Get messages formatted for Ollama API
   * @returns {Array<{role: string, content: string}>} Formatted messages
   */
  getFormattedMessages() {
    if (!this.messageStore) {
      throw new Error('MessageStore not set. Call setMessageStore() first.');
    }
    
    let messages = this.messageStore.getAllMessages()
      .map(message => {
        const role = this.mapRoleToOllama(message.bedrockType);
        
        // Ensure content is a string
        let content = message.content;
        if (typeof content !== 'string') {
          // If content is an array or object, convert to string
          content = JSON.stringify(content);
        }
        
        return { role, content };
      });

    if (this.formatterConfig.chatSize && messages.length > this.formatterConfig.chatSize) {
      const systemMessages = messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
      
      const recentMessages = nonSystemMessages.slice(
        -(this.formatterConfig.chatSize - systemMessages.length)
      );
      
      messages = [...systemMessages, ...recentMessages];
    }
    
    // Log the formatted messages for debugging
    //console.log('Formatted messages for Ollama:', JSON.stringify(messages, null, 2));
    
    return messages;
  }
  
  /**
   * Map internal role types to Ollama role types
   * @param {string} role - The internal role type
   * @returns {string} The Ollama role type
   * @private
   */
  mapRoleToOllama(role) {
    // Ollama supports 'user', 'assistant', and 'system' roles
    const validRoles = ['user', 'assistant', 'system'];
    return validRoles.includes(role) ? role : 'user';
  }
  
  /**
   * Register tools with the service
   * @param {Tool[]} tools - The tools to register
   */
  registerTools(tools) {
    //console.log('Registering tools with Ollama:', tools.map(t => t.getName()));
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
   * Get the tool configuration for Ollama
   * This is different from the Bedrock format
   * @returns {Array<{name: string, description: string, parameters: object}>|undefined} 
   */
  getToolConfig() {
    const tools = this.toolManager.getTools();
    if (tools.length === 0) {
      return undefined;
    }
    
    return this.convertToolsToOllamaFormat();
  }
  
  /**
   * Invoke the model with messages
   * @param {Array<{role: string, content: string}>} messages - The messages to send
   * @returns {Promise<InvokeResult>} The result of the invocation
   */
  async invokeModel(messages) {
    try {
      const formattedMessages = this.getFormattedMessages();
      const tools = this.getToolConfig();
      
      // Update the current model ID
      this.currentModelId = this.modelManager.getCurrentModel();
      
      // Prepare the request for Ollama
      const request = {
        model: this.currentModelId,
        messages: formattedMessages,
        stream: false
      };
      
      // Add tools if available
      if (tools && tools.length > 0) {
        request.tools = tools;
      }
      
      // Call Ollama API using the client (which could be a mock in tests)
      const response = await this.ollamaClient.chat(request);
      
      // Estimate token usage (Ollama doesn't provide this directly)
      const inputTokens = this.estimateTokenCount(JSON.stringify(formattedMessages));
      const outputTokens = this.estimateTokenCount(response.message.content);
      
      // Track token usage and calculate costs
      const tokenUsageData = this.trackTokenUsage(inputTokens, outputTokens);
      
      // Process the response
      const result = this.processOllamaResponse(response, tokenUsageData);
      
      return result;
    } catch (error) {
      return await this.modelManager.handleError(error, () => this.invokeModel(messages));
    }
  }
  
  /**
   * Process the Ollama response into the standard format
   * @param {object} response - The Ollama response
   * @param {object} tokenUsageData - Token usage data
   * @returns {InvokeResult} The standardized response
   * @private
   */
  processOllamaResponse(response, tokenUsageData) {
    // Check if the response contains tool calls
    if (response.message.tool_calls && response.message.tool_calls.length > 0) {
      return {
        type: 'ASSISTANT_TOOL_REQUEST',
        content: response.message.content || '',
        toolCalls: response.message.tool_calls.map(tool => {
          // Get the function name
          const name = tool.function?.name || tool.name;
          
          // Parse arguments safely
          let input = {};
          try {
            // Check if arguments is a string that needs parsing
            if (tool.function?.arguments && typeof tool.function.arguments === 'string') {
              input = JSON.parse(tool.function.arguments);
            } 
            // Check if arguments is already an object
            else if (tool.function?.arguments && typeof tool.function.arguments === 'object') {
              input = tool.function.arguments;
            }
            // Check if parameters is provided (old format)
            else if (tool.parameters) {
              input = tool.parameters;
            }
          } catch (error) {
            //console.error(`Error parsing tool arguments: ${error.message}`);
            //console.log('Raw arguments:', tool.function?.arguments);
          }
          
          return {
            name,
            input,
            toolUseId: tool.id || `tool-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
          };
        }),
        tokenUsage: tokenUsageData.requestTokens,
        costInfo: tokenUsageData.costInfo
      };
    }
    
    // Standard text response
    return {
      type: 'ASSISTANT_RESPONSE',
      content: response.message.content,
      tokenUsage: tokenUsageData.requestTokens,
      costInfo: tokenUsageData.costInfo
    };
  }
  
  /**
   * Convert tools to Ollama format
   * @returns {Array<{type: string, function: {name: string, description: string, parameters: object}}>} Tools in Ollama format
   * @private
   */
  convertToolsToOllamaFormat() {
    return this.toolManager.getTools().map(tool => ({
      type: 'function',
      function: {
        name: tool.getName(),
        description: tool.getDescription(),
        parameters: tool.getParameters()
      }
    }));
  }
  
  /**
   * Estimate token count from text
   * This is a simple estimation as Ollama doesn't provide token counts
   * @param {string} text - The text to estimate tokens for
   * @returns {number} Estimated token count
   * @private
   */
  estimateTokenCount(text) {
    // Simple estimation: ~4 characters per token on average
    return Math.ceil(text.length / 4);
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
}
