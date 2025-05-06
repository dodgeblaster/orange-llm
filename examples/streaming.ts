/**
 * Streaming Example
 * 
 * This example demonstrates how to use the LLM module with streaming responses.
 * It shows how to:
 * 1. Create an LLM service using the factory
 * 2. Set up streaming for responses
 * 3. Process chunks of the response as they arrive
 * 
 * Note: This example assumes the LLMService interface has streaming capabilities.
 * If the actual implementation doesn't support streaming, this example would need
 * to be modified accordingly.
 */

import { 
  LLMServiceFactory, 
  LLMProvider,
  LLMService
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

// Main function to run the streaming example
async function runStreamingExample() {
  try {
    console.log('Starting streaming example...');
    
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
        content: 'You are a helpful AI assistant. Provide detailed, step-by-step explanations.'
      }
    ]);
    
    // Set the message store for the service
    service.setMessageStore(messageStore);
    
    // Add a user message that will generate a longer response
    messageStore.addMessage({
      role: 'user',
      content: 'Explain how AWS Lambda works and provide a simple example of when to use it.'
    });
    
    // Get the formatted messages
    const messages = service.getFormattedMessages();
    
    console.log('Sending message to LLM with streaming enabled...');
    
    // Note: This is a hypothetical streaming method that might be available
    // in the actual implementation. The real method name and signature may differ.
    if ('invokeModelWithStreaming' in service) {
      // @ts-ignore - This is just for the example
      await service.invokeModelWithStreaming(messages, {
        onChunk: (chunk: any) => {
          // Process each chunk as it arrives
          if (chunk.type === 'content') {
            process.stdout.write(chunk.content);
          }
        },
        onComplete: (finalResponse: any) => {
          // Handle the complete response
          console.log('\n\nStreaming completed.');
          
          // Add the complete response to the message store
          messageStore.addMessage({
            role: 'assistant',
            content: finalResponse.content
          });
          
          // Log token usage if available
          if (finalResponse.tokenUsage) {
            console.log('\nToken Usage:');
            console.log(`Input tokens: ${finalResponse.tokenUsage.input}`);
            console.log(`Output tokens: ${finalResponse.tokenUsage.output}`);
            console.log(`Total tokens: ${finalResponse.tokenUsage.input + finalResponse.tokenUsage.output}`);
          }
        }
      });
    } else {
      console.log('Streaming is not supported by this LLM service implementation.');
      console.log('Falling back to non-streaming invocation...');
      
      // Fall back to regular invocation
      const response = await service.invokeModel(messages);
      console.log('\nAssistant Response:');
      console.log(response.content);
    }
    
  } catch (error) {
    console.error('Error in streaming example:', error);
  }
}

// Run the streaming example
runStreamingExample().then(() => {
  console.log('\nStreaming example completed.');
});
