import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { DefaultModelManager } from '../model-manager';
import { DefaultToolManager } from '../tool-manager';
import { DefaultResponseHandler } from '../response-handler';
import { InvokeResult, LLMFormatterConfig, LLMService, MessageStoreInterface, TokenUsage, Tool } from '../types';
import { LLMConfigManager } from '../config';

// Session-level token usage tracking
const sessionTokenUsage: TokenUsage = {
  input: 0,
  output: 0
};

export class BedrockService implements LLMService {
  private client: BedrockRuntimeClient;
  private modelManager: DefaultModelManager;
  private toolManager: DefaultToolManager;
  private responseHandler: DefaultResponseHandler;
  private messageStore: MessageStoreInterface | null = null;
  private formatterConfig: LLMFormatterConfig = {};
  private currentModelId: string;
  private tokenUsage: TokenUsage = { input: 0, output: 0 };
  private configManager: LLMConfigManager;
  
  constructor(
    region: string = 'us-west-2',
    modelId: string = 'amazon.nova-micro-v1:0'
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
    
    console.log(`Initialized Bedrock service with model: ${modelId}`);
  }
  
  /**
   * Set the message store for formatting messages
   */
  setMessageStore(messageStore: MessageStoreInterface, config: LLMFormatterConfig = {}): void {
    this.messageStore = messageStore;
    this.formatterConfig = config;
  }
  
  /**
   * Get messages formatted for Bedrock API
   */
  getFormattedMessages(): { role: string, content: string | object }[] {
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
  
  registerTools(tools: Tool[]): void {
    console.log('Registering tools with Bedrock:', tools.map(t => t.getName()));
    this.toolManager.registerTools(tools);
  }

  getToolManager(): DefaultToolManager {
    return this.toolManager;
  }

  private convertMessagesToBedrockFormat(messages: any[]): any[] {
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
  
  private extractSystemMessage(messages: any[]): string {
    const systemMessage = messages.find(msg => msg.role === 'system');
    return systemMessage ? systemMessage.content : '';
  }
  
  async invokeModel(messages: any[]): Promise<InvokeResult> {
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
    } catch (error: any) {
      return await this.modelManager.handleError(error, () => this.invokeModel(messages));
    }
  }
  
  /**
   * Track token usage and calculate cost information
   * @param inputTokens - Number of input tokens used in the request
   * @param outputTokens - Number of output tokens generated in the response
   * @returns Token usage and cost information
   */
  private trackTokenUsage(inputTokens: number, outputTokens: number): {
    requestTokens: TokenUsage,
    sessionTokens: TokenUsage,
    costInfo: {
      inputCost: string,
      outputCost: string,
      totalCost: string
    }
  } {
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
  
  private async prepareCommand(messages: any[]): Promise<ConverseCommand> {
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
