/**
 * Tool Usage Example
 * 
 * This example demonstrates how to use the LLM module with tools.
 * It shows how to:
 * 1. Create an LLM service using the factory
 * 2. Define and register tools
 * 3. Handle tool requests from the LLM
 * 4. Process tool results and continue the conversation
 */

import { 
  LLMServiceFactory, 
  LLMProvider, 
  LLMService,
  Tool,
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

// Calculator tool implementation
class CalculatorTool implements Tool {
  getName(): string {
    return 'calculator';
  }
  
  getDescription(): string {
    return 'Performs basic arithmetic operations: add, subtract, multiply, divide';
  }
  
  getParameters(): object {
    return {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The arithmetic operation to perform'
        },
        a: {
          type: 'number',
          description: 'First operand'
        },
        b: {
          type: 'number',
          description: 'Second operand'
        }
      },
      required: ['operation', 'a', 'b']
    };
  }
  
  async execute(params: any): Promise<any> {
    const { operation, a, b } = params;
    
    let result: number;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero is not allowed');
        }
        result = a / b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
    
    return {
      result,
      operation,
      a,
      b
    };
  }
}

// Weather tool implementation (mock)
class WeatherTool implements Tool {
  getName(): string {
    return 'weather';
  }
  
  getDescription(): string {
    return 'Get the current weather for a location';
  }
  
  getParameters(): object {
    return {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or location'
        }
      },
      required: ['location']
    };
  }
  
  async execute(params: any): Promise<any> {
    const { location } = params;
    
    // This is a mock implementation - in a real app, you would call a weather API
    const weatherData = {
      location,
      temperature: Math.round(15 + Math.random() * 15), // Random temperature between 15-30°C
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
      humidity: Math.round(50 + Math.random() * 40), // Random humidity between 50-90%
      windSpeed: Math.round(5 + Math.random() * 20) // Random wind speed between 5-25 km/h
    };
    
    return weatherData;
  }
}

// Process tool calls and add results to the message store
async function processToolCalls(
  service: LLMService, 
  messageStore: SimpleMessageStore, 
  toolRequest: AssistantToolRequest
): Promise<void> {
  console.log('\nProcessing tool calls...');
  
  // Get the tool manager from the service
  const toolManager = service.getToolManager();
  
  // Process the tool calls
  const toolResults = await toolManager.processToolCalls(toolRequest.toolCalls);
  
  // Add the tool results to the message store
  for (let i = 0; i < toolRequest.toolCalls.length; i++) {
    const toolCall = toolRequest.toolCalls[i];
    const result = toolResults[i];
    
    messageStore.addMessage({
      role: 'tool',
      toolUseId: toolCall.toolUseId,
      name: toolCall.name,
      content: JSON.stringify(result)
    });
    
    console.log(`\nTool: ${toolCall.name}`);
    console.log('Result:', result);
  }
}

// Main function to run the example
async function runToolExample() {
  try {
    console.log('Starting tool usage example...');
    
    // Create the LLM service
    const service = LLMServiceFactory.createService({
      provider: LLMProvider.BEDROCK,
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      region: 'us-east-1'
    });
    
    // Create and register tools
    const calculatorTool = new CalculatorTool();
    const weatherTool = new WeatherTool();
    service.registerTools([calculatorTool, weatherTool]);
    
    // Create a message store with an initial system message
    const messageStore = new SimpleMessageStore([
      {
        role: 'system',
        content: 'You are a helpful AI assistant with access to tools. Use the calculator tool for math operations and the weather tool to check weather conditions.'
      }
    ]);
    
    // Set the message store for the service
    service.setMessageStore(messageStore);
    
    // Add a user message that will likely trigger tool usage
    messageStore.addMessage({
      role: 'user',
      content: 'What is 1342 * 738? Also, what\'s the weather like in Seattle?'
    });
    
    // Get the formatted messages
    const messages = service.getFormattedMessages();
    
    console.log('Sending message to LLM...');
    
    // Invoke the model
    let response = await service.invokeModel(messages);
    
    // Handle the response
    if (response.type === 'ASSISTANT_TOOL_REQUEST') {
      // Process tool calls
      await processToolCalls(service, messageStore, response);
      
      // Get updated messages
      const updatedMessages = service.getFormattedMessages();
      
      // Invoke the model again with the tool results
      console.log('\nSending tool results back to LLM...');
      response = await service.invokeModel(updatedMessages);
    }
    
    // Now we should have a final response
    if (response.type === 'ASSISTANT_RESPONSE') {
      console.log('\nFinal Assistant Response:');
      console.log(response.content);
      
      // Add the response to the message store
      messageStore.addMessage({
        role: 'assistant',
        content: response.content
      });
      
      // Log token usage if available
      if (response.tokenUsage) {
        console.log('\nToken Usage:');
        console.log(`Input tokens: ${response.tokenUsage.input}`);
        console.log(`Output tokens: ${response.tokenUsage.output}`);
        console.log(`Total tokens: ${response.tokenUsage.input + response.tokenUsage.output}`);
      }
    } else {
      console.log('\nReceived another tool request, but we\'ll stop the example here.');
    }
    
  } catch (error) {
    console.error('Error in tool example:', error);
  }
}

// Run the tool example
runToolExample().then(() => {
  console.log('\nTool example completed.');
});
