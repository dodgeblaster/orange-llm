# Ollama JavaScript Library

The Ollama JavaScript library provides the easiest way to integrate your JavaScript project with [Ollama](https://github.com/jmorganca/ollama).

## Getting Started

```
npm i ollama
```

## Usage

```javascript
import ollama from 'ollama'

const response = await ollama.chat({
  model: 'llama3.1',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})
console.log(response.message.content)
```

### Browser Usage
To use the library without node, import the browser module.
```javascript
import ollama from 'ollama/browser'
```

## Streaming responses

Response streaming can be enabled by setting `stream: true`, modifying function calls to return an `AsyncGenerator` where each part is an object in the stream.

```javascript
import ollama from 'ollama'

const message = { role: 'user', content: 'Why is the sky blue?' }
const response = await ollama.chat({ model: 'llama3.1', messages: [message], stream: true })
for await (const part of response) {
  process.stdout.write(part.message.content)
}
```

## API

The Ollama JavaScript library's API is designed around the [Ollama REST API](https://github.com/jmorganca/ollama/blob/main/docs/api.md)

### chat

```javascript
ollama.chat(request)
```

- `request` `<Object>`: The request object containing chat parameters.

  - `model` `<string>` The name of the model to use for the chat.
  - `messages` `<Message[]>`: Array of message objects representing the chat history.
    - `role` `<string>`: The role of the message sender ('user', 'system', or 'assistant').
    - `content` `<string>`: The content of the message.
    - `images` `<Uint8Array[] | string[]>`: (Optional) Images to be included in the message, either as Uint8Array or base64 encoded strings.
  - `format` `<string>`: (Optional) Set the expected format of the response (`json`).
  - `stream` `<boolean>`: (Optional) When true an `AsyncGenerator` is returned.
  - `keep_alive` `<string | number>`: (Optional) How long to keep the model loaded. A number (seconds) or a string with a duration unit suffix ("300ms", "1.5h", "2h45m", etc.)
  - `tools` `<Tool[]>`: (Optional) A list of tool calls the model may make.
  - `options` `<Options>`: (Optional) Options to configure the runtime.

- Returns: `<ChatResponse>`