import { Mistral } from '@mistralai/mistralai';
import { calculateCost } from './mistral_price.mjs';
import { getInferenceConfig } from './mistral_inference.mjs';
import { handleResponse } from './mistral_handleResponse.mjs';
import { ModelManager } from './mistral_model_manager.mjs';
import { createToolManager } from './mistral_tool_manager.mjs';

// Session-level token usage tracking
const sessionTokenUsage = {
  input: 0,
  output: 0
};

/**
 * Creates a Miy
 * tral implementation of the LLM service
 * @param {string} [modelId='mistral-small-latest'] - Model ID
 * @returns {Object} The Mistral service interface
 */
export function createMistralService({
  modelId = 'mistral-small-latest'
}) {
  const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
  });
  
  const modelManager = new ModelManager(modelId, 'mistral-small-latest');
  const toolManager = createToolManager();
  let currentModelId = modelId;
  let formatterConfig = {};
  let tokenUsage = { input: 0, output: 0 };
  
  /**
   * Convert messages to Mistral format
   * @param {Array<{role: string, content: string|object}>} messages - The messages to convert
   * @returns {Array<{role: string, content: string}>} Converted messages
   * @private
   */
  function convertMessagesToMistralFormat(messages) {
    const convertedMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system' || msg.role === 'tool')
      .map(msg => {
        // Handle tool messages
        if (msg.role === 'tool') {
          return {
            role: 'tool',
            content: msg.content,
            tool_call_id: msg.tool_call_id
          };
        }
        
        // Handle assistant messages with tool calls
        if (msg.role === 'assistant' && msg.toolCalls) {
          return {
            role: 'assistant',
            content: msg.content || '',
            tool_calls: msg.toolCalls.map(tc => ({
              id: tc.toolUseId,
              type: 'function',
              function: {
                name: tc.name,
                arguments: tc.input
              }
            }))
          };
        }
        
        // Handle regular messages
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        
        // Skip messages with empty content ONLY if they don't have tool calls
        if ((!content || !content.trim()) && !msg.toolCalls) {
          return null;
        }
        
        return {
          role: msg.role,
          content: content || ''
        };
      })
      .filter(Boolean);
    
    return convertedMessages;
  }
  
  /**
   * Track token usage and calculate cost information
   * @param {number} inputTokens - Number of input tokens used in the request
   * @param {number} outputTokens - Number of output tokens generated in the response
   * @returns {{requestTokens: TokenUsage, sessionTokens: TokenUsage, costInfo: {inputCost: string, outputCost: string, totalCost: string}}}
   * @private
   */
  function trackTokenUsage(inputTokens, outputTokens) {    
    // Update request-specific token counts
    tokenUsage.input += inputTokens;
    tokenUsage.output += outputTokens;
    
    // Update session-level token counts
    sessionTokenUsage.input += inputTokens;
    sessionTokenUsage.output += outputTokens;
    
    // Calculate costs using the configuration manager
    const costInfo = calculateCost(
      currentModelId,
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
        input: tokenUsage.input,
        output: tokenUsage.output
      },
      costInfo
    };
  }
  
  /**
   * Prepare the request payload for Mistral
   * @param {Array<{role: string, content: string|object}>} messages - The messages to send
   * @returns {Object} The prepared request payload
   * @private
   */
  async function prepareRequest(messages) {
    const formattedMessages = convertMessagesToMistralFormat(messages);
    const inferenceConfig = getInferenceConfig(currentModelId);
    
    // Update the current model ID
    currentModelId = modelManager.getCurrentModel();
    
    const request = {
      model: currentModelId,
      messages: formattedMessages,
      ...inferenceConfig
    };

    // Only add tool configuration if there are no tool messages in the conversation
    // (i.e., this is not a follow-up request after tool execution)
    const hasToolMessages = messages.some(msg => msg.role === 'tool');
    if (!hasToolMessages) {
      const toolConfig = toolManager.getToolConfig();
      if (toolConfig) {
        request.tools = toolConfig.tools;
        request.tool_choice = toolConfig.tool_choice;
      }
    }

    return request;
  }

  /**
  * Get messages formatted for Mistral API
  * @returns {Array<{role: string, content: string|object}>} Formatted messages
  */
  function getFormattedMessages(allMessages) {   
   let messages = allMessages
     .map(message => ({
       role: message.bedrockType,
       content: message.content,
       toolCalls: message.toolCalls, // Preserve toolCalls
       tool_call_id: message.tool_call_id // Preserve tool_call_id
     }));

   if (formatterConfig.chatSize && messages.length > formatterConfig.chatSize) {
     const systemMessages = messages.filter(msg => msg.role === 'system');
     const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
     
     const recentMessages = nonSystemMessages.slice(
       -(formatterConfig.chatSize - systemMessages.length)
     );
     
     messages = [...systemMessages, ...recentMessages];
   }
   
   return messages;
 }

  // Return the public interface
  return {
    /**
     * Register tools with the service
     * @param {Tool[]} tools - The tools to register
     */
    registerTools(tools) {
      console.log('Registering tools with Mistral:', tools.map(t => t.getName()));
      toolManager.registerTools(tools);
    },

    processToolCalls: async (toolCalls) => {
      return toolManager.processToolCalls(toolCalls)
    },
    
    /**
     * Invoke the model with messages
     * @param {Array<{role: string, content: string|object}>} messages - The messages to send
     * @returns {Promise<InvokeResult>} The result of the invocation
     */
    async invokeModel(allMessages) {
      const messages = getFormattedMessages(allMessages);
      
      try {
        const request = await prepareRequest(messages);
        console.log('Mistral API request:', JSON.stringify(request, null, 2));
        
        const response = await client.chat.complete(request);
        console.log('Mistral API response:', JSON.stringify(response, null, 2));

        const totalTokens = response.usage?.totalTokens || 0;

        // Track token usage and calculate costs
        const inputTokens = response.usage?.promptTokens || 0;
        const outputTokens = response.usage?.completionTokens || 0;
        const tokenUsageData = trackTokenUsage(inputTokens, outputTokens);
        
        // Get the base response from the response handler
        const baseResponse = handleResponse(response);
        
        // Add token usage and cost information to the response
        return {
          ...baseResponse,
          totalTokens: totalTokens,
          tokenUsage: tokenUsageData.requestTokens,
          costInfo: tokenUsageData.costInfo
        };
      } catch (error) {
        console.error('Mistral API error:', error);
        return await modelManager.handleError(error, () => this.invokeModel(messages));
      }
    }
  };
}

// Export the factory function as MistralService for backward compatibility
export const MistralService = createMistralService;
