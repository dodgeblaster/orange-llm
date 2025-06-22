import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import {calculateCost} from './bedrock_price.mjs'
import {getInferenceConfig} from './bedrock_inference.mjs'
import {handleResponse} from './bedrock_handleResponse.mjs'
import { ModelManager } from './bedrock_model_manager.mjs';
import { createToolManager } from './bedrock_tool_manager.mjs';

// Session-level token usage tracking
const sessionTokenUsage = {
  input: 0,
  output: 0
};

/**
 * Creates a Bedrock implementation of the LLM service
 * @param {string} [region='us-west-2'] - AWS region
 * @param {string} [modelId='amazon.nova-micro-v1:0'] - Model ID
 * @returns {Object} The Bedrock service interface
 */
export function createBedrockService({
  region,
  modelId
}) {
  const client = new BedrockRuntimeClient({ region });
  const modelManager = new ModelManager(modelId, 'amazon.nova-micro-v1:0');
  const toolManager = createToolManager()
  let currentModelId = modelId;
  let formatterConfig = {};
  let tokenUsage = { input: 0, output: 0 };
  
  /**
   * Convert messages to Bedrock format
   * @param {Array<{role: string, content: string|object}>} messages - The messages to convert
   * @returns {Array<{role: string, content: Array<{text: string}>}>} Converted messages
   * @private
   */
  function convertMessagesToBedrockFormat(messages) {
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
  function extractSystemMessage(messages) {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage ? systemMessage.content : '';
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
   * Prepare the command for Bedrock
   * @param {Array<{role: string, content: string|object}>} messages - The messages to send
   * @returns {Promise<ConverseCommand>} The prepared command
   * @private
   */
  async function prepareCommand(messages) {
    const formattedMessages = convertMessagesToBedrockFormat(messages);
    const systemContent = extractSystemMessage(messages);
    const toolConfig = toolManager.getToolConfig();
    
    // Update the current model ID
    currentModelId = modelManager.getCurrentModel();
    
    return new ConverseCommand({
      modelId: currentModelId,
      messages: formattedMessages,
      system: [{ text: systemContent }],
      toolConfig,
      inferenceConfig: getInferenceConfig(currentModelId)//modelManager.getInferenceConfig()
    });
  }

  /**
  * Get messages formatted for Bedrock API
  * @returns {Array<{role: string, content: string|object}>} Formatted messages
  */
  function getFormattedMessages(allMessages) {   
   let messages = allMessages
     .map(message => ({
       role: message.bedrockType,
       content: message.content
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
      console.log('Registering tools with Bedrock:', tools.map(t => t.getName()));
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

      const messages = getFormattedMessages(allMessages)
      try {
        const command = await prepareCommand(messages);
        const response = await client.send(command);

        const totalTokens = response.usage.totalTokens

        // Track token usage and calculate costs
        const inputTokens = response.usage?.inputTokens || 0;
        const outputTokens = response.usage?.outputTokens || 0;
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
        return await modelManager.handleError(error, () => this.invokeModel(messages));
      }
    }
  };
}

// Export the factory function as BedrockService for backward compatibility
export const BedrockService = createBedrockService;
