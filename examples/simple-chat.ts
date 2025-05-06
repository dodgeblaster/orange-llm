/**
 * Simple Chat Example
 * 
 * This example demonstrates how to use the LLM module to create a simple chat application.
 * It shows how to:
 * 1. Create an LLM service using the factory
 * 2. Set up a message store
 * 3. Send messages to the LLM
 * 4. Handle responses
 */

import { 
  LLMServiceFactory, 
  LLMProvider, 
  LLMService,
  AssistantResponse,
  AssistantToolRequest
} from '../index.js';

// Simple message store implementation
class SimpleMessageStore {
  private messages: any[] = [];
  
  constructor(initialMessages: any[] = []) {
    this.messages = [...initialMessages];
  }
  
  getAllMessages(): any[] {
    return this.messages;
  }
  
  addMessage(message: any): void {
    this.messages.push(message);
  }
}

// Main chat function
async function runChat() {
  try {
    console.log('Starting simple chat example...');
    
    // Create the LLM service
    const service = LLMServiceFactory.createService({
      provider: LLMProvider.BEDROCK,
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      region: 'us-east-1'
    });
    
    // Create a message store with an initial system message
    const messageStore = new SimpleMessageStore([
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide concise and accurate responses.'
      }
    ]);
    
    // Set the message store for the service
    service.setMessageStore(messageStore);
    
    // Add a user message
    messageStore.addMessage({
      role: 'user',
      content: 'Hello! Can you tell me about the benefits of using AWS Lambda?'
    });
    
    // Get the formatted messages
    const messages = service.getFormattedMessages();
    
    console.log('Sending message to LLM...');
    
    // Invoke the model
    const response = await service.invokeModel(messages);
    
    // Handle the response
    if (response.type === 'ASSISTANT_RESPONSE') {
      const assistantResponse = response as AssistantResponse;
      console.log('\nAssistant Response:');
      console.log(assistantResponse.content);
      
      // Add the response to the message store
      messageStore.addMessage({
        role: 'assistant',
        content: assistantResponse.content
      });
      
      // Log token usage if available
      if (assistantResponse.tokenUsage) {
        console.log('\nToken Usage:');
        console.log(`Input tokens: ${assistantResponse.tokenUsage.input}`);
        console.log(`Output tokens: ${assistantResponse.tokenUsage.output}`);
        console.log(`Total tokens: ${assistantResponse.tokenUsage.input + assistantResponse.tokenUsage.output}`);
      }
      
      // Log cost information if available
      if (assistantResponse.costInfo) {
        console.log('\nCost Information:');
        console.log(`Input cost: ${assistantResponse.costInfo.inputCost}`);
        console.log(`Output cost: ${assistantResponse.costInfo.outputCost}`);
        console.log(`Total cost: ${assistantResponse.costInfo.totalCost}`);
      }
    } else {
      // This would be a tool request, but we're not handling tools in this example
      console.log('Received a tool request, but tools are not implemented in this example.');
    }
    
  } catch (error) {
    console.error('Error in chat example:', error);
  }
}

// Run the chat example
runChat().then(() => {
  console.log('\nChat example completed.');
});
