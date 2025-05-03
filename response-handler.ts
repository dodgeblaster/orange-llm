import { AssistantResponse, AssistantToolRequest, InvokeResult, ResponseHandler } from './types';

export class DefaultResponseHandler implements ResponseHandler {
  handleResponse(response: any): InvokeResult {
    if (response.stopReason === 'end_turn') {
      return this.makeAssistanceResponse(response);
    }

    if (response.stopReason === 'tool_use') {
      return this.makeAssistantToolRequest(response);
    }

    throw new Error('Unknown stop reason: ' + response.stopReason);
  }

  protected makeAssistanceResponse(response: any): AssistantResponse {
    return {
      type: 'ASSISTANT_RESPONSE',
      content: this.extractContentText(response)
    };
  }

  protected makeAssistantToolRequest(response: any): AssistantToolRequest {
    return {
      type: 'ASSISTANT_TOOL_REQUEST',
      content: this.extractContentText(response),
      toolCalls: this.extractToolCalls(response)
    };
  }

  protected extractContentText(response: any): string {
    return response.output?.message?.content 
      ? response.output.message.content
          .filter((block: any) => block.text)
          .map((block: any) => block.text)
          .join('\n') 
      : '';
  }

  protected extractToolCalls(response: any): any[] {
    return response.output?.message?.content 
      ? response.output.message.content
          .filter((block: any) => block.toolUse)
          .map((block: any) => ({
            name: block.toolUse.name,
            input: block.toolUse.input,
            toolUseId: block.toolUse.toolUseId
          })) 
      : [];
  }
}
