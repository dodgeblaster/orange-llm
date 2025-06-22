/**
 * Extract tool calls from the Mistral response
 * @param {Object} response - The response from Mistral
 * @returns {Object[]} The extracted tool calls
 */
function extractToolCalls(response) {
  const choice = response.choices?.[0];
  if (!choice?.message?.toolCalls) {
    return [];
  }

  return choice.message.toolCalls.map((toolCall) => ({
    name: toolCall.function.name,
    input: toolCall.function.arguments,
    toolUseId: toolCall.id
  }));
}

/**
 * Extract the text content from the Mistral response
 * @param {Object} response - The response from Mistral
 * @returns {string} The extracted text content
 */
function extractContentText(response) {
  const choice = response.choices?.[0];
  return choice?.message?.content || '';
}

/**
 * Create an AssistantResponse from the Mistral response
 * @param {Object} response - The response from Mistral
 * @returns {AssistantResponse} The assistant response
 */
function makeAssistanceResponse(response) {
  return {
    type: 'ASSISTANT_RESPONSE',
    content: extractContentText(response)
  };
}

/**
 * Create an AssistantToolRequest from the Mistral response
 * @param {Object} response - The response from Mistral
 * @returns {AssistantToolRequest} The assistant tool request
 */
function makeAssistantToolRequest(response) {
  return {
    type: 'ASSISTANT_TOOL_REQUEST',
    content: extractContentText(response),
    toolCalls: extractToolCalls(response)
  };
}

/**
 * Handle a response from Mistral
 * @param {Object} response - The response from Mistral
 * @returns {InvokeResult} The processed response
 */
export function handleResponse(response) {
  const choice = response.choices?.[0];
  const finishReason = choice?.finishReason;

  if (finishReason === 'stop' || finishReason === 'length') {
    return makeAssistanceResponse(response);
  }

  if (finishReason === 'tool_calls') {
    return makeAssistantToolRequest(response);
  }

  // Default to assistant response for other finish reasons
  return makeAssistanceResponse(response);
}
