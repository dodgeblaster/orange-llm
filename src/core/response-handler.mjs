/**
 * Default implementation of the ResponseHandler interface
 * @implements {ResponseHandler}
 */
export class DefaultResponseHandler {
  /**
   * Handle a response from the LLM
   * @param {Object} response - The response from the LLM
   * @returns {InvokeResult} The processed response
   */
  handleResponse(response) {
    if (response.stopReason === 'end_turn') {
      return this.makeAssistanceResponse(response);
    }

    if (response.stopReason === 'tool_use') {
      return this.makeAssistantToolRequest(response);
    }

    throw new Error('Unknown stop reason: ' + response.stopReason);
  }

  /**
   * Create an AssistantResponse from the LLM response
   * @param {Object} response - The response from the LLM
   * @returns {AssistantResponse} The assistant response
   * @protected
   */
  makeAssistanceResponse(response) {
    return {
      type: 'ASSISTANT_RESPONSE',
      content: this.extractContentText(response)
    };
  }

  /**
   * Create an AssistantToolRequest from the LLM response
   * @param {Object} response - The response from the LLM
   * @returns {AssistantToolRequest} The assistant tool request
   * @protected
   */
  makeAssistantToolRequest(response) {
    return {
      type: 'ASSISTANT_TOOL_REQUEST',
      content: this.extractContentText(response),
      toolCalls: this.extractToolCalls(response)
    };
  }

  /**
   * Extract the text content from the LLM response
   * @param {Object} response - The response from the LLM
   * @returns {string} The extracted text content
   * @protected
   */
  extractContentText(response) {
    return response.output?.message?.content 
      ? response.output.message.content
          .filter((block) => block.text)
          .map((block) => block.text)
          .join('\n') 
      : '';
  }

  /**
   * Extract tool calls from the LLM response
   * @param {Object} response - The response from the LLM
   * @returns {Object[]} The extracted tool calls
   * @protected
   */
  extractToolCalls(response) {
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
}
