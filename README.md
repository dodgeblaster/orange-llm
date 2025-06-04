# Orange LLM

A lightweight JavaScript library for interacting with AWS Bedrock LLM models. Orange LLM provides a simplified interface for working with AWS Bedrock's AI models, handling message formatting, token usage tracking, and tool integration.

## Features

- Simple interface for AWS Bedrock models
- Token usage tracking and cost calculation
- Tool/function calling support
- Error handling with model fallback capability
- Support for system messages and conversation context

## Installation

```bash
npm install orange-llm
```

## Prerequisites

- AWS account with access to Bedrock models
- AWS credentials configured in your environment
- Node.js environment

## Quick Start

```javascript
import { createLLM } from 'orange-llm';

// Initialize the LLM service with AWS Bedrock
const llm = createLLM({
  provider: 'bedrock',
  region: 'us-west-2',  // Specify your AWS region
  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0'  // Choose your model
});

// Invoke the model with messages
const result = await llm.invokeModel([
  {
    bedrockType: 'system',
    content: 'You are a helpful assistant.'
  },
  {
    bedrockType: 'user',
    content: 'Tell me about quantum computing.'
  }
]);

console.log(result.content);
console.log('Token usage:', result.tokenUsage);
console.log('Cost info:', result.costInfo);
```

## Working with Tools

Orange LLM supports function calling through AWS Bedrock's tool interface:

```javascript
// Define a tool
class WeatherTool {
  getName() {
    return 'get_weather';
  }
  
  getDescription() {
    return 'Get the current weather for a location';
  }
  
  getParameters() {
    return {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g., San Francisco, CA'
        }
      },
      required: ['location']
    };
  }
  
  async execute(params) {
    // Implement actual weather fetching logic
    return {
      temperature: 72,
      condition: 'sunny',
      location: params.location
    };
  }
}

// Register the tool with the LLM service
llm.registerTools([new WeatherTool()]);

// Invoke the model with a message that might trigger tool use
const result = await llm.invokeModel([
  {
    bedrockType: 'user',
    content: 'What\'s the weather like in Seattle?'
  }
]);

// If the model called a tool, process the tool calls
if (result.toolCalls && result.toolCalls.length > 0) {
  const toolResults = await llm.processToolCalls(result.toolCalls);
  
  // Send the tool results back to the model
  const finalResult = await llm.invokeModel([
    {
      bedrockType: 'user',
      content: 'What\'s the weather like in Seattle?'
    },
    result,
    ...toolResults
  ]);
  
  console.log(finalResult.content);
}
```

## Error Handling and Model Fallback

Orange LLM includes built-in error handling with model fallback capability:

```javascript
// The library will automatically handle errors and fall back to alternative models if needed
// For example, if Claude 3.5 Sonnet requires an inference profile, it will fall back to the specified fallback model
```

## Token Usage and Cost Tracking

Orange LLM automatically tracks token usage and calculates costs:

```javascript
const result = await llm.invokeModel([/* messages */]);

console.log('Input tokens:', result.tokenUsage.input);
console.log('Output tokens:', result.tokenUsage.output);
console.log('Input cost:', result.costInfo.inputCost);
console.log('Output cost:', result.costInfo.outputCost);
console.log('Total cost:', result.costInfo.totalCost);
```

## API Reference

### createLLM(options)

Creates a new LLM service instance.

- **options.provider** - The LLM provider (currently only 'bedrock' is supported)
- **options.region** - AWS region for Bedrock
- **options.modelId** - Bedrock model ID to use

Returns an LLM service object with the following methods:

### llm.invokeModel(messages)

Invokes the model with the provided messages.

- **messages** - Array of message objects with the following properties:
  - **bedrockType** - Message role ('system', 'user', or 'assistant')
  - **content** - Message content (string)

Returns a response object with:
- **content** - The model's response text
- **tokenUsage** - Token usage information
- **costInfo** - Cost calculation information
- **toolCalls** - Any tool calls requested by the model (if applicable)

### llm.registerTools(tools)

Registers tools for function calling.

- **tools** - Array of tool objects that implement:
  - **getName()** - Returns the tool name
  - **getDescription()** - Returns the tool description
  - **getParameters()** - Returns the JSON schema for the tool parameters
  - **execute(params)** - Executes the tool with the given parameters

### llm.processToolCalls(toolCalls)

Processes tool calls from the model.

- **toolCalls** - Array of tool call objects from the model response

Returns an array of tool execution results.

## License

MIT
