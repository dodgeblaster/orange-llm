/**
 * Conversation Example
 * 
 * This example demonstrates how to use the LLM module for a multi-turn conversation.
 * It shows how to:
 * 1. Create an LLM service using the factory
 * 2. Set up a message store for conversation history
 * 3. Send multiple messages in a conversation
 * 4. Handle responses
 * 
 * @typedef {import('../types').LLMService} LLMService
 * @typedef {import('../types').AssistantResponse} AssistantResponse
 */

import { LLMServiceFactory } from '../index.mjs';
import { LLMProvider } from '../types.mjs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

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
 * Main conversation function
 */
async function runConversation() {
  try {
    console.log('Starting conversation example...');
    
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
    
    // Create readline interface for user input
    const rl = readline.createInterface({ input, output });
    
    console.log('\nConversation started. Type "exit" to end the conversation.');
    
    // Start conversation loop
    let userInput = await rl.question('\nYou: ');
    
    while (userInput.toLowerCase() !== 'exit') {
      // Add user message to store
      messageStore.addMessage({
        role: 'user',
        content: userInput
      });
      
      // Get formatted messages
      const messages = service.getFormattedMessages();
      
      console.log('\nThinking...');
      
      // Invoke the model
      const response = await service.invokeModel(messages);
      
      // Handle the response
      if (response.type === 'ASSISTANT_RESPONSE') {
        /** @type {AssistantResponse} */
        const assistantResponse = response;
        console.log(`\nAssistant: ${assistantResponse.content}`);
        
        // Add the response to the message store
        messageStore.addMessage({
          role: 'assistant',
          content: assistantResponse.content
        });
        
        // Log token usage if available
        if (assistantResponse.tokenUsage) {
          const inputTokens = assistantResponse.tokenUsage.input;
          const outputTokens = assistantResponse.tokenUsage.output;
          console.log(`\n(Token usage: ${inputTokens} input, ${outputTokens} output)`);
        }
      } else {
        console.log('\nReceived a tool request, but tools are not implemented in this example.');
      }
      
      // Get next user input
      userInput = await rl.question('\nYou: ');
    }
    
    rl.close();
    console.log('\nConversation ended.');
    
  } catch (error) {
    console.error('Error in conversation example:', error);
  }
}

// Run the conversation example
runConversation().then(() => {
  console.log('\nConversation example completed.');
});
