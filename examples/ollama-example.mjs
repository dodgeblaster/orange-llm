/**
 * Example of using the Ollama provider with the LLM service
 */

import { LLMServiceFactory } from '../index.mjs';
import { LLMProvider } from '../types.mjs';

// Simple message store for the example
class SimpleMessageStore {
  constructor() {
    this.messages = [];
  }
  
  addMessage(role, content) {
    this.messages.push({
      bedrockType: role,
      content
    });
  }
  
  getAllMessages() {
    return this.messages;
  }
}

async function main() {
  try {
    // Create an Ollama service
    const service = LLMServiceFactory.createService({
      provider: LLMProvider.OLLAMA,
      modelId: 'llama3.1',
      endpoint: 'http://localhost:11434'
    });
    
    // Create a message store
    const messageStore = new SimpleMessageStore();
    
    // Set the message store on the service
    service.setMessageStore(messageStore);
    
    // Add a system message
    messageStore.addMessage('system', 'You are a helpful assistant.');
    
    // Add a user message
    messageStore.addMessage('user', 'What are the benefits of using local LLMs with Ollama?');
    
    console.log('Sending request to Ollama...');
    
    // Invoke the model
    const response = await service.invokeModel(messageStore.getAllMessages());
    
    console.log('\nResponse:');
    console.log(response.content);
    
    // Display token usage
    if (response.tokenUsage) {
      console.log('\nToken Usage:');
      console.log(`Input tokens: ${response.tokenUsage.input}`);
      console.log(`Output tokens: ${response.tokenUsage.output}`);
    }
    
    // Display cost information
    if (response.costInfo) {
      console.log('\nCost Information:');
      console.log(`Input cost: $${response.costInfo.inputCost}`);
      console.log(`Output cost: $${response.costInfo.outputCost}`);
      console.log(`Total cost: $${response.costInfo.totalCost}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
