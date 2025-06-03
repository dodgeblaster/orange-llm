/**
 * Factory function that creates a tool manager
 * @returns {Object} An object with tool management methods
 */
export function createToolManager() {
  const tools = [];
   
  const convertToolsToFormat = () => {
    return tools.map(tool => ({
      toolSpec: {
        name: tool.getName(),
        description: tool.getDescription(),
        inputSchema: {
          json: tool.getParameters()
        }
      }
    }));
  };

  // Return public API
  return {
    /**
     * Register tools with the manager
     * @param {Tool[]} newTools - The tools to register
     */
    registerTools(newTools) {
      // Combine new tools with existing ones, avoiding duplicates
      const existingToolNames = new Set(tools.map(t => t.getName()));
      const filteredTools = newTools.filter(t => !existingToolNames.has(t.getName()));
      tools.push(...filteredTools);
    },

    /**
     * Get all registered tools
     * @returns {Tool[]} The registered tools
     */
    getTools() {
      return tools;
    },

    /**
     * Get the tool configuration for the LLM
     * @returns {Object|undefined} The tool configuration
     */
    getToolConfig() {
      if (tools.length === 0) {
        return undefined;
      }

      return {
        tools: convertToolsToFormat(),
        toolChoice: {
          auto: {}
        }
      };
    },

    /**
     * Process tool calls from the LLM
     * @param {Object[]} toolCalls - The tool calls to process
     * @returns {Promise<ToolExecutionResult[]>} The results of the tool executions
     */
    async processToolCalls(toolCalls) {
      /** @type {ToolExecutionResult[]} */
      const results = [];
      
      for (const toolCall of toolCalls) {
        const toolName = toolCall.name;
        let toolParams;
        
        try {
          toolParams = typeof toolCall.input === 'object' 
            ? toolCall.input 
            : JSON.parse(toolCall.input);
        } catch (error) {
          results.push({
            role: 'tool',
            toolUseId: toolCall.toolUseId,
            content: { error: `Failed to parse tool input: ${error.message}` }
          });
          continue;
        }
        
        const tool = tools.find(t => t.getName() === toolName);
        
        if (!tool) {
          results.push({
            role: 'tool',
            toolUseId: toolCall.toolUseId,
            content: { error: `Tool ${toolName} not found` }
          });
          continue;
        }
        
        try {
          const result = await tool.execute(toolParams);
          results.push({
            role: 'tool',
            toolUseId: toolCall.toolUseId,
            content: result
          });
        } catch (error) {
          results.push({
            role: 'tool',
            toolUseId: toolCall.toolUseId,
            content: { error: error.message }
          });
        }
      }
      
      return results;
    }
  };
}
