import { Tool, ToolManager } from './types';
type ToolExecutionResult = {
    role: 'tool';
    toolUseId: string;
    content: object;
};
export declare class DefaultToolManager implements ToolManager {
    private tools;
    registerTools(tools: Tool[]): void;
    getTools(): Tool[];
    getToolConfig(): {
        tools: any[];
        toolChoice: {
            auto: {};
        };
    } | undefined;
    protected convertToolsToFormat(): any[];
    processToolCalls(toolCalls: any[]): Promise<ToolExecutionResult[]>;
}
export {};
