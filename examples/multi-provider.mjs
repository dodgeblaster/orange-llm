/**
 * Multi-Provider Example
 * 
 * This example demonstrates how to use the LLM module with multiple providers.
 * It shows how to:
 * 1. Create LLM services for different providers
 * 2. Send the same prompt to multiple services
 * 3. Compare responses
 * 
 * @typedef {import('../types').LLMService} LLMService
 * @typedef {import('../types').AssistantResponse} AssistantResponse
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
 * Create a service with a message store
 * @param {string} provider - The provider to use
 * @param {string} modelId - The model ID to use
 * @param {string} systemPrompt - The system prompt
 * @returns {{service: LLMService, messageStore: SimpleMessageStore}} The service and message store
 */
function createServiceWithStore(provider, modelId, systemPrompt) {
  // Create the LLM service
  const service = LLMServiceFactory.createService({
    provider,
    modelId,
    region: 'us-east-1'
  });
  
  // Create a message store with the system prompt
  const messageStore = new SimpleMessageStore([
    {
      role: 'system',
      content: systemPrompt
    }
  ]);
  
  // Set the message store for the service
  service.setMessageStore(messageStore);
  
  return { service, messageStore };
}

/**
 * Main function to run the example
 */
async function runMultiProviderExample() {
  try {
    console.log('Starting multi-provider example...');
    
    // Define the models to compare
    const models = [
      {
        provider: LLMProvider.BEDROCK,
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        name: 'Claude 3 Sonnet'
      },
      {
        provider: LLMProvider.BEDROCK,
        modelId: 'amazon.nova-lite-v1:0',
        name: 'Amazon Nova Lite'
      }
    ];
    
    // Create services for each model
    const services = models.map(model => {
      console.log(`Creating service for ${model.name}...`);
      return {
        ...model,
        ...createServiceWithStore(
          model.provider,
          model.modelId,
          'You are a helpful AI assistant. Provide concise and accurate responses.'
        )
      };
    });
    
    // Define the prompt to send to all services
    const prompt = 'Explain the concept of serverless computing in 3 sentences.';
    console.log(`\nPrompt: "${prompt}"`);
    
    // Send the prompt to all services and collect responses
    const responses = [];
    
    for (const service of services) {
      console.log(`\nSending prompt to ${service.name}...`);
      
      // Add the user message
      service.messageStore.addMessage({
        role: 'user',
        content: prompt
      });
      
      // Get formatted messages
      const messages = service.service.getFormattedMessages();
      
      // Invoke the model
      const response = await service.service.invokeModel(messages);
      
      // Handle the response
      if (response.type === 'ASSISTANT_RESPONSE') {
        /** @type {AssistantResponse} */
        const assistantResponse = response;
        
        responses.push({
          model: service.name,
          content: assistantResponse.content,
          tokenUsage: assistantResponse.tokenUsage,
          costInfo: assistantResponse.costInfo
        });
      } else {
        console.log(`Received a tool request from ${service.name}, which is unexpected.`);
      }
    }
    
    // Display the responses
    console.log('\n=== Responses ===');
    
    for (const response of responses) {
      console.log(`\n--- ${response.model} ---`);
      console.log(response.content);
      
      if (response.tokenUsage) {
        console.log(`\nToken Usage: ${response.tokenUsage.input} input, ${response.tokenUsage.output} output`);
      }
      
      if (response.costInfo) {
        console.log(`Cost: $${response.costInfo.totalCost}`);
      }
    }
    
  } catch (error) {
    console.error('Error in multi-provider example:', error);
  }
}

// Run the multi-provider example
runMultiProviderExample().then(() => {
  console.log('\nMulti-provider example completed.');
});
