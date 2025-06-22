# mistral.complete

## Example payload
```json
{
  "model": "mistral-small-latest",
  "temperature": 1.5,
  "top_p": 1,
  "max_tokens": 0,
  "stream": false,
  "stop": "string",
  "random_seed": 0,
  "messages": [
    {
      "role": "user",
      "content": "Who is the best French painter? Answer in one short sentence."
    }
  ],
  "response_format": {
    "type": "text",
    "json_schema": {
      "name": "string",
      "description": "string",
      "schema": {},
      "strict": false
    }
  },
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "string",
        "description": "",
        "strict": false,
        "parameters": {}
      }
    }
  ],
  "tool_choice": "auto",
  "presence_penalty": 0,
  "frequency_penalty": 0,
  "n": 1,
  "prediction": {
    "type": "content",
    "content": ""
  },
  "parallel_tool_calls": true,
  "prompt_mode": "reasoning",
  "safe_prompt": false
}

```

Request Body schema: application/json
required
model
required
string (Model)
ID of the model to use. You can use the List Available Models API to see all of your available models, or see our Model overview for model descriptions.

temperature	
Temperature (number) or Temperature (null) (Temperature)
What sampling temperature to use, we recommend between 0.0 and 0.7. Higher values like 0.7 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend altering this or top_p but not both. The default value varies depending on the model you are targeting. Call the /models endpoint to retrieve the appropriate value.

top_p	
number (Top P) [ 0 .. 1 ]
Default: 1
Nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both.

max_tokens	
Max Tokens (integer) or Max Tokens (null) (Max Tokens)
The maximum number of tokens to generate in the completion. The token count of your prompt plus max_tokens cannot exceed the model's context length.

stream	
boolean (Stream)
Default: false
Whether to stream back partial progress. If set, tokens will be sent as data-only server-side events as they become available, with the stream terminated by a data: [DONE] message. Otherwise, the server will hold the request open until the timeout or until completion, with the response containing the full result as JSON.

stop	
Stop (string) or Array of Stop (strings) (Stop)
Stop generation if this token is detected. Or if one of these tokens is detected when providing an array

random_seed	
Random Seed (integer) or Random Seed (null) (Random Seed)
The seed to use for random sampling. If set, different calls will generate deterministic results.

messages
required
Array of any (Messages)
The prompt(s) to generate completions for, encoded as a list of dict with role and content.

response_format	
object (ResponseFormat)
tools	
Array of Tools (objects) or Tools (null) (Tools)
tool_choice	
ToolChoice (object) or ToolChoiceEnum (string) (Tool Choice)
Default: "auto"
presence_penalty	
number (Presence Penalty) [ -2 .. 2 ]
Default: 0
presence_penalty determines how much the model penalizes the repetition of words or phrases. A higher presence penalty encourages the model to use a wider variety of words and phrases, making the output more diverse and creative.

frequency_penalty	
number (Frequency Penalty) [ -2 .. 2 ]
Default: 0
frequency_penalty penalizes the repetition of words based on their frequency in the generated text. A higher frequency penalty discourages the model from repeating words that have already appeared frequently in the output, promoting diversity and reducing repetition.

n	
N (integer) or N (null) (N)
Number of completions to return for each request, input tokens are only billed once.

prediction	
object (Prediction)
Default: {"type":"content","content":""}
Enable users to specify expected results, optimizing response times by leveraging known or predictable content. This approach is especially effective for updating text documents or code files with minimal changes, reducing latency while maintaining high-quality results.

parallel_tool_calls	
boolean (Parallel Tool Calls)
Default: true
prompt_mode	
MistralPromptMode (string) or null
Allows toggling between the reasoning mode and no system prompt. When set to reasoning the system prompt for reasoning models will be used.

safe_prompt	
boolean
Default: false
Whether to inject a safety prompt before all conversations.

## Example Response

```json
{
  "id": "cmpl-e5cc70bb28c444948073e77776eb30ef",
  "object": "chat.completion",
  "model": "mistral-small-latest",
  "usage": {
    "prompt_tokens": 16,
    "completion_tokens": 34,
    "total_tokens": 50
  },
  "created": 1702256327,
  "choices": [
    {
      "index": 0,
      "message": {
        "content": "string",
        "tool_calls": [
          {
            "id": "null",
            "type": "function",
            "function": {
              "name": "string",
              "arguments": {}
            },
            "index": 0
          }
        ],
        "prefix": false,
        "role": "assistant"
      },
      "finish_reason": "stop"
    }
  ]
}
```