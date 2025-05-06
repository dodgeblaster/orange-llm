/**
 * Multi-Provider Example
 * 
 * This example demonstrates how to use the LLM module with multiple providers.
 * It shows how to:
 * 1. Create LLM services for different providers
 * 2. Compare responses from different models
 * 3. Handle provider-specific configurations
 * 
 * Note: This example assumes multiple providers are implemented in the LLMServiceFactory.
 * If only one provider is available, this example would need to be modified.
 */

import { 
  LLMServiceFactory, 
  LLMProvider,
  LLMService,
  AssistantResponse
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
  
  // Clone the message store
  clone(): SimpleMessageStore {
    return new SimpleMessageStore(this.messages.map(m => ({...m})));
  }
}

// Function to create a service and get a response
async function getResponseFromService(
  provider: LLMProvider,
  modelId: string,
  region: string,
  messageStore: SimpleMessageStore
): Promise<{response: AssistantResponse, elapsedTime: number}> {
  try {
    console.log(`\nTrying ${provider} with model ${modelId}...`);
    
    // Create the LLM service
    const service = LLMServiceFactory.createService({
      provider,
      modelId,
      region
    });
    
    // Set the message store for the service
    service.setMessageStore(messageStore);
    
    // Get the formatted messages
    const messages = service.getFormattedMessages();
    
    // Measure response time
    const startTime = Date.now();
    
    // Invoke the model
    const response = await service.invokeModel(messages);
    
    // Calculate elapsed time
    const elapsedTime = Date.now() - startTime;
    
    if (response.type === 'ASSISTANT_RESPONSE') {
      return {
        response: response as AssistantResponse,
        elapsedTime
      };
    } else {
      throw new Error('Received a tool request instead of a response');
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    throw error;
  }
}

// Main function to run the multi-provider example
async function runMultiProviderExample() {
  try {
    console.log('Starting multi-provider example...');
    
    // Create a message store with an initial system message
    const baseMessageStore = new SimpleMessageStore([
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Keep your responses concise and informative.'
      }
    ]);
    
    // Add a user message
    baseMessageStore.addMessage({
      role: 'user',
      content: 'What are the key differences between AWS Lambda and AWS EC2?'
    });
    
    // Define the providers and models to test
    const providers = [
      {
        provider: LLMProvider.BEDROCK,
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        region: 'us-east-1',
        name: 'Claude 3 Sonnet'
      },
      {
        provider: LLMProvider.BEDROCK,
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        region: 'us-east-1',
        name: 'Claude 3 Haiku'
      }
      // Uncomment if Ollama provider is implemented
      // {
      //   provider: LLMProvider.OLLAMA,
      //   modelId: 'llama2',
      //   region: 'local',
      //   name: 'Llama 2'
      // }
    ];
    
    // Get responses from each provider
    const results = [];
    
    for (const config of providers) {
      try {
        // Clone the message store for each provider
        const messageStore = baseMessageStore.clone();
        
        // Get response from this provider
        const result = await getResponseFromService(
          config.provider,
          config.modelId,
          config.region,
          messageStore
        );
        
        results.push({
          name: config.name,
          response: result.response,
          elapsedTime: result.elapsedTime
        });
        
      } catch (error) {
        console.error(`Failed to get response from ${config.name}:`, error);
      }
    }
    
    // Display results
    console.log('\n=== Results ===');
    
    for (const result of results) {
      console.log(`\n--- ${result.name} (${result.elapsedTime}ms) ---`);
      console.log(result.response.content);
      
      if (result.response.tokenUsage) {
        console.log(`\nToken usage: ${result.response.tokenUsage.input} input, ${result.response.tokenUsage.output} output`);
      }
      
      if (result.response.costInfo) {
        console.log(`Cost: ${result.response.costInfo.totalCost}`);
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
