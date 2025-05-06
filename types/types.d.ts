/**
 * Tool interface definition for LLM module.
 * This is a minimal version of what's needed from the core Tool interface.
 */
export interface Tool {
    getName(): string;
    getDescription(): string;
    getParameters(): object;
    execute(params: any): Promise<any>;
}
/**
 * Minimal interface for MessageStore to avoid direct dependency on core
 */
export interface MessageStoreInterface {
    getAllMessages(): any[];
}
/**
 * Token usage information for cost calculation
 */
export interface TokenUsage {
    input: number;
    output: number;
}
/**
 * Model pricing information for cost calculation
 */
export interface ModelPricing {
    model?: string;
    input: (tokens: number) => string;
    output: (tokens: number) => string;
}
export type AssistantResponse = {
    type: 'ASSISTANT_RESPONSE';
    content: string;
    tokenUsage?: TokenUsage;
    costInfo?: {
        inputCost: string;
        outputCost: string;
        totalCost: string;
    };
};
export type AssistantToolRequest = {
    type: 'ASSISTANT_TOOL_REQUEST';
    content: string;
    toolCalls: {
        name: string;
        input: object;
        toolUseId: string;
    }[];
    tokenUsage?: TokenUsage;
    costInfo?: {
        inputCost: string;
        outputCost: string;
        totalCost: string;
    };
};
export type InvokeResult = AssistantResponse | AssistantToolRequest;
export interface LLMFormatterConfig {
    chatSize?: number;
}
export interface LLMServiceConfig {
    region?: string;
    modelId: string;
    provider: LLMProvider;
}
export declare enum LLMProvider {
    BEDROCK = "bedrock",
    OLLAMA = "ollama"
}
export interface LLMService {
    setMessageStore(messageStore: MessageStoreInterface, config?: LLMFormatterConfig): void;
    getFormattedMessages(): any[];
    registerTools(tools: Tool[]): void;
    getToolManager(): any;
    invokeModel(messages: any[]): Promise<InvokeResult>;
}
export interface ModelManager {
    getCurrentModel(): string;
    getInferenceConfig(): any;
    handleError(error: any, retryCallback: () => Promise<any>): Promise<any>;
    setModel(modelId: string): boolean;
    getAvailableModels(): string[];
}
export interface ToolManager {
    registerTools(tools: Tool[]): void;
    getTools(): Tool[];
    getToolConfig(): any;
    processToolCalls(toolCalls: any[]): Promise<any[]>;
}
export interface ResponseHandler {
    handleResponse(response: any): InvokeResult;
}
