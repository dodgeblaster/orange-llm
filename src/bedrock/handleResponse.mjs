/**
 * Extract tool calls from the LLM response
 * @param {Object} response - The response from the LLM
 * @returns {Object[]} The extracted tool calls
 */
function extractToolCalls(response) {
  return response.output?.message?.content 
    ? response.output.message.content
        .filter((block) => block.toolUse)
        .map((block) => ({
          name: block.toolUse.name,
          input: block.toolUse.input,
          toolUseId: block.toolUse.toolUseId
        })) 
    : [];
}

/**
 * Extract the text content from the LLM response
 * @param {Object} response - The response from the LLM
 * @returns {string} The extracted text content
 */
function extractContentText(response) {
  return response.output?.message?.content 
    ? response.output.message.content
        .filter((block) => block.text)
        .map((block) => block.text)
        .join('\n') 
    : '';
}

/**
 * Create an AssistantResponse from the LLM response
 * @param {Object} response - The response from the LLM
 * @returns {AssistantResponse} The assistant response
 */
function makeAssistanceResponse(response) {
  return {
    type: 'ASSISTANT_RESPONSE',
    content: extractContentText(response)
  };
}

/**
 * Create an AssistantToolRequest from the LLM response
 * @param {Object} response - The response from the LLM
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
 * Handle a response from the LLM
 * @param {Object} response - The response from the LLM
 * @returns {InvokeResult} The processed response
 */
export function handleResponse(response) {
  if (response.stopReason === 'end_turn') {
    return makeAssistanceResponse(response);
  }

  if (response.stopReason === 'tool_use') {
    return makeAssistantToolRequest(response);
  }

  throw new Error('Unknown stop reason: ' + response.stopReason);
}

