import { createLLM } from './index.mjs';

// Example usage of Orange LLM with Mistral provider
async function example() {
  // Initialize the LLM service with Mistral
  const llm = createLLM({
    provider: 'mistral',
    modelId: 'mistral-small-latest'  // Choose your Mistral model
  });

  // Invoke the model with messages
  const result = await llm.invokeModel([
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Tell me about quantum computing in simple terms.'
    }
  ]);

  console.log('Response:', result.content);
  console.log('Token usage:', result.tokenUsage);
  console.log('Cost info:', result.costInfo);
}

// Example with tools
async function exampleWithTools() {
  // Define a simple tool
  class CalculatorTool {
    getName() {
      return 'calculator';
    }
    
    getDescription() {
      return 'Perform basic arithmetic calculations';
    }
    
    getParameters() {
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
            description: 'First number'
          },
          b: {
            type: 'number',
            description: 'Second number'
          }
        },
        required: ['operation', 'a', 'b']
      };
    }
    
    async execute(params) {
      const { operation, a, b } = params;
      
      switch (operation) {
        case 'add':
          return { result: a + b };
        case 'subtract':
          return { result: a - b };
        case 'multiply':
          return { result: a * b };
        case 'divide':
          return { result: b !== 0 ? a / b : 'Error: Division by zero' };
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
  }

  const llm = createLLM({
    provider: 'mistral',
    modelId: 'mistral-small-latest'
  });

  // Register the tool
  llm.registerTools([new CalculatorTool()]);

  // Invoke the model with a message that might trigger tool use
  const result = await llm.invokeModel([
    {
      role: 'user',
      content: 'What is 15 multiplied by 7?'
    }
  ]);

  console.log('Initial response:', result);

  // If the model called a tool, process the tool calls
  if (result.toolCalls && result.toolCalls.length > 0) {
    console.log('Processing tool calls...');
    const toolResults = await llm.processToolCalls(result.toolCalls);
    
    // Send the tool results back to the model
    const finalResult = await llm.invokeModel([
      {
        role: 'user',
        content: 'What is 15 multiplied by 7?'
      },
      result,
      ...toolResults
    ]);
    
    console.log('Final response:', finalResult.content);
  }
}

// Run examples
console.log('=== Basic Example ===');
await example();

console.log('\n=== Tool Example ===');
await exampleWithTools();
