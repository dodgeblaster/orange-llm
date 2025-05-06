# LLM Module Examples

This directory contains examples demonstrating how to use the LLM module in different scenarios.

## Examples

### Simple Chat (`simple-chat.ts`)

A basic example showing how to:
- Create an LLM service
- Set up a message store
- Send messages to the LLM
- Handle responses

To run this example:

```bash
npx ts-node examples/simple-chat.ts
```

### Conversation (`conversation.ts`)

A multi-turn conversation example showing how to:
- Maintain a conversation with multiple back-and-forth exchanges
- Handle responses across multiple turns
- Simulate a real conversation flow

To run this example:

```bash
npx ts-node examples/conversation.ts
```

### Tool Usage (`tool-usage.ts`)

A more advanced example demonstrating:
- Creating and registering tools
- Handling tool requests from the LLM
- Processing tool results
- Continuing the conversation with tool outputs

To run this example:

```bash
npx ts-node examples/tool-usage.ts
```

### Streaming (`streaming.ts`)

An example showing how to handle streaming responses:
- Set up streaming for responses
- Process chunks of the response as they arrive
- Handle the complete response

To run this example:

```bash
npx ts-node examples/streaming.ts
```

### Multi-Provider (`multi-provider.ts`)

An example demonstrating how to use multiple LLM providers:
- Create LLM services for different providers
- Compare responses from different models
- Handle provider-specific configurations

To run this example:

```bash
npx ts-node examples/multi-provider.ts
```

## Prerequisites

Before running these examples:

1. Make sure you have AWS credentials configured with access to Amazon Bedrock
2. Install the required dependencies:

```bash
npm install
```

## Configuration

The examples use Amazon Bedrock with Claude 3 Sonnet by default. You can modify the provider and model in the examples to use different LLM services.

## Notes

- These examples are for demonstration purposes and may need adjustments for production use
- Error handling is minimal for clarity
- The weather tool in the tool-usage example uses mock data instead of calling a real API
- The streaming example assumes the LLM service supports streaming (check the actual implementation)
