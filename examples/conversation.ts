/**
 * Conversation Example
 * 
 * This example demonstrates a multi-turn conversation with the LLM module.
 * It shows how to:
 * 1. Create an LLM service using the factory
 * 2. Maintain a conversation with multiple back-and-forth exchanges
 * 3. Handle responses across multiple turns
 * 4. Simulate a real conversation flow
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

// Function to send a message and get a response
async function sendMessageAndGetResponse(
  service: LLMService,
  messageStore: SimpleMessageStore,
  userMessage: string
): Promise<string> {
  // Add the user message to the store
  messageStore.addMessage({
    role: 'user',
    content: userMessage
  });
  
  console.log(`\nUser: ${userMessage}`);
  
  // Get the formatted messages
  const messages = service.getFormattedMessages();
  
  // Invoke the model
  const response = await service.invokeModel(messages);
  
  // Handle the response
  if (response.type === 'ASSISTANT_RESPONSE') {
    const assistantResponse = response as AssistantResponse;
    
    // Add the response to the message store
    messageStore.addMessage({
      role: 'assistant',
      content: assistantResponse.content
    });
    
    console.log(`\nAssistant: ${assistantResponse.content}`);
    
    // Log token usage if available
    if (assistantResponse.tokenUsage) {
      console.log(`\n(Token usage: ${assistantResponse.tokenUsage.input} input, ${assistantResponse.tokenUsage.output} output)`);
    }
    
    return assistantResponse.content;
  } else {
    // This would be a tool request, but we're not handling tools in this example
    console.log('\nReceived a tool request, but tools are not implemented in this example.');
    return "I'd need to use a tool to answer that, but tools aren't available in this conversation.";
  }
}

// Main conversation function
async function runConversation() {
  try {
    console.log('Starting conversation example with multiple turns...');
    
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
        content: 'You are a helpful AI assistant specializing in AWS services. Provide concise and accurate responses. Keep your answers focused on the user\'s questions.'
      }
    ]);
    
    // Set the message store for the service
    service.setMessageStore(messageStore);
    
    // First exchange
    console.log('\n--- First Exchange ---');
    await sendMessageAndGetResponse(
      service,
      messageStore,
      "I'm new to AWS and considering using their services for my web application. What's the difference between EC2 and Lambda?"
    );
    
    // Second exchange
    console.log('\n--- Second Exchange ---');
    await sendMessageAndGetResponse(
      service,
      messageStore,
      "That's helpful! For my use case, I need to run a web server that handles occasional traffic spikes. Which would you recommend?"
    );
    
    // Third exchange
    console.log('\n--- Third Exchange ---');
    await sendMessageAndGetResponse(
      service,
      messageStore,
      "What about databases? I need to store user profiles and product information. What AWS database services would work well with my EC2 or Lambda setup?"
    );
    
    // Print the full conversation history
    console.log('\n=== Full Conversation History ===');
    const history = messageStore.getAllMessages();
    
    for (const message of history) {
      if (message.role === 'system') {
        console.log(`[System] ${message.content}`);
      } else if (message.role === 'user') {
        console.log(`\nUser: ${message.content}`);
      } else if (message.role === 'assistant') {
        console.log(`\nAssistant: ${message.content}`);
      }
    }
    
  } catch (error) {
    console.error('Error in conversation example:', error);
  }
}

// Run the conversation example
runConversation().then(() => {
  console.log('\nConversation example completed.');
});
