import { AssistantResponse, AssistantToolRequest, InvokeResult, ResponseHandler } from './types';
export declare class DefaultResponseHandler implements ResponseHandler {
    handleResponse(response: any): InvokeResult;
    protected makeAssistanceResponse(response: any): AssistantResponse;
    protected makeAssistantToolRequest(response: any): AssistantToolRequest;
    protected extractContentText(response: any): string;
    protected extractToolCalls(response: any): any[];
}
