import { DefaultToolManager } from '../tool-manager';
import { InvokeResult, LLMFormatterConfig, LLMService, MessageStoreInterface, Tool } from '../types';
export declare class BedrockService implements LLMService {
    private client;
    private modelManager;
    private toolManager;
    private responseHandler;
    private messageStore;
    private formatterConfig;
    private currentModelId;
    private tokenUsage;
    private configManager;
    constructor(region?: string, modelId?: string);
    /**
     * Set the message store for formatting messages
     */
    setMessageStore(messageStore: MessageStoreInterface, config?: LLMFormatterConfig): void;
    /**
     * Get messages formatted for Bedrock API
     */
    getFormattedMessages(): {
        role: string;
        content: string | object;
    }[];
    registerTools(tools: Tool[]): void;
    getToolManager(): DefaultToolManager;
    private convertMessagesToBedrockFormat;
    private extractSystemMessage;
    invokeModel(messages: any[]): Promise<InvokeResult>;
    /**
     * Track token usage and calculate cost information
     * @param inputTokens - Number of input tokens used in the request
     * @param outputTokens - Number of output tokens generated in the response
     * @returns Token usage and cost information
     */
    private trackTokenUsage;
    private prepareCommand;
}
