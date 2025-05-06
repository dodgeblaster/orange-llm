/**
 * Streaming Example
 * 
 * This example demonstrates how to use the LLM module with streaming responses.
 * Note: This is a placeholder example as the current implementation doesn't support streaming.
 * 
 * @typedef {import('../types').LLMService} LLMService
 */

import { LLMServiceFactory } from '../index.mjs';
import { LLMProvider } from '../types.mjs';

/**
 * Simple message store implementation
 */
class SimpleMessageStore {
  /**
   * @param {Array<any>} [initialMessages=[]] - Initial messages to populate the store
   */
  constructor(initialMessages = []) {
    /** @type {Array<any>} */
    this.messages = [...initialMessages];
  }
  
  /**
   * Get all messages in the store
   * @returns {Array<any>} All messages
   */
  getAllMessages() {
    return this.messages;
  }
  
  /**
   * Add a message to the store
   * @param {any} message - The message to add
   */
  addMessage(message) {
    this.messages.push(message);
  }
}

/**
 * Main function to run the example
 */
async function runStreamingExample() {
  try {
    console.log('Starting streaming example...');
    console.log('Note: This is a placeholder example as the current implementation doesn\'t support streaming.');
    
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
      content: 'Write a short story about a robot learning to paint.'
    });
    
    // Get the formatted messages
    const messages = service.getFormattedMessages();
    
    console.log('Sending message to LLM...');
    console.log('In a streaming implementation, we would see the response appear word by word.');
    
    // Invoke the model (non-streaming in current implementation)
    const response = await service.invokeModel(messages);
    
    // Simulate streaming by printing character by character
    if (response.type === 'ASSISTANT_RESPONSE') {
      console.log('\nSimulating streaming response:');
      
      const content = response.content;
      for (let i = 0; i < content.length; i++) {
        process.stdout.write(content[i]);
        // Add a small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log('\n\nStreaming complete.');
      
      // Log token usage if available
      if (response.tokenUsage) {
        console.log('\nToken Usage:');
        console.log(`Input tokens: ${response.tokenUsage.input}`);
        console.log(`Output tokens: ${response.tokenUsage.output}`);
      }
    } else {
      console.log('Received a tool request, which is unexpected in this example.');
    }
    
  } catch (error) {
    console.error('Error in streaming example:', error);
  }
}

// Run the streaming example
runStreamingExample().then(() => {
  console.log('\nStreaming example completed.');
});
