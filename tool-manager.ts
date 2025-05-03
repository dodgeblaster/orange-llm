import { Tool, ToolManager } from './types';

type ToolExecutionResult = {
  role: 'tool',
  toolUseId: string,
  content: object
}

export class DefaultToolManager implements ToolManager {
  private tools: Tool[] = [];

  registerTools(tools: Tool[]): void {
    // Combine new tools with existing ones, avoiding duplicates
    const existingToolNames = new Set(this.tools.map(t => t.getName()));
    const newTools = tools.filter(t => !existingToolNames.has(t.getName()));
    this.tools.push(...newTools);
    console.log('Current tools in ToolManager:', this.tools.map(t => t.getName()));
  }

  getTools(): Tool[] {
    return this.tools;
  }

  getToolConfig() {
    if (this.tools.length === 0) {
      return undefined;
    }

    return {
      tools: this.convertToolsToFormat(),
      toolChoice: {
        auto: {}
      }
    };
  }

  protected convertToolsToFormat(): any[] {
    return this.tools.map(tool => ({
      toolSpec: {
        name: tool.getName(),
        description: tool.getDescription(),
        inputSchema: {
          json: tool.getParameters()
        }
      }
    }));
  }

  async processToolCalls(toolCalls: any[]): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];
    
    for (const toolCall of toolCalls) {
      const toolName = toolCall.name;
      let toolParams;
      
      try {
        toolParams = typeof toolCall.input === 'object' 
          ? toolCall.input 
          : JSON.parse(toolCall.input);
      } catch (error) {
        results.push({
          role: 'tool' as const,
          toolUseId: toolCall.toolUseId,
          content: { error: `Failed to parse tool input: ${(error as Error).message}` }
        });
        continue;
      }
      
      const tool = this.tools.find(t => t.getName() === toolName);
      
      if (!tool) {
        results.push({
          role: 'tool' as const,
          toolUseId: toolCall.toolUseId,
          content: { error: `Tool ${toolName} not found` }
        });
        continue;
      }
      
      try {
        const result = await tool.execute(toolParams);
        results.push({
          role: 'tool' as const,
          toolUseId: toolCall.toolUseId,
          content: result
        });
      } catch (error: any) {
        results.push({
          role: 'tool' as const,
          toolUseId: toolCall.toolUseId,
          content: { error: error.message }
        });
      }
    }
    
    return results;
  }
}
