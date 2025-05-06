import { 
  LLMService, 
  MessageStoreInterface, 
  Tool, 
  LLMFormatterConfig,
  InvokeResult
} from '../index.js';

/**
 * A mock implementation of LLMService for testing
 */
export class MockLLMService implements LLMService {
  private messageStore: MessageStoreInterface | null = null;
  private tools: Tool[] = [];
  private mockResponse: InvokeResult | null = null;
  private shouldThrowError = false;
  private errorMessage = '';

  constructor() {}

  setMessageStore(messageStore: MessageStoreInterface, config?: LLMFormatterConfig): void {
    this.messageStore = messageStore;
  }

  getFormattedMessages(): any[] {
    return this.messageStore?.getAllMessages() || [];
  }

  registerTools(tools: Tool[]): void {
    this.tools = tools;
  }

  getToolManager(): any {
    return {
      getTools: () => this.tools,
      processToolCalls: async () => []
    };
  }

  async invokeModel(messages: any[]): Promise<InvokeResult> {
    if (this.shouldThrowError) {
      throw new Error(this.errorMessage);
    }
    
    if (this.mockResponse) {
      return this.mockResponse;
    }
    
    return {
      type: 'ASSISTANT_RESPONSE',
      content: 'This is a mock response',
      tokenUsage: {
        input: 10,
        output: 5
      }
    };
  }

  // Methods for test control
  setMockResponse(response: InvokeResult): void {
    this.mockResponse = response;
  }

  setError(shouldThrow: boolean, message = 'Mock error'): void {
    this.shouldThrowError = shouldThrow;
    this.errorMessage = message;
  }
}
