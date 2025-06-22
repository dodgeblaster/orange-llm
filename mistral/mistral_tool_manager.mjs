/**
 * Factory function that creates a tool manager for Mistral
 * @returns {Object} An object with tool management methods
 */
export function createToolManager() {
  const tools = [];
   
  const convertToolsToFormat = () => {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.getName(),
        description: tool.getDescription(),
        parameters: tool.getParameters()
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
        tool_choice: 'auto'
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
            tool_call_id: toolCall.toolUseId,
            content: `Error: Failed to parse tool input: ${error.message}`
          });
          continue;
        }
        
        const tool = tools.find(t => t.getName() === toolName);
        
        if (!tool) {
          results.push({
            role: 'tool',
            tool_call_id: toolCall.toolUseId,
            content: `Error: Tool ${toolName} not found`
          });
          continue;
        }
        
        try {
          const result = await tool.execute(toolParams);
          // Convert result to a readable string format instead of JSON
          let contentString;
          if (typeof result === 'object') {
            if (result.calculation) {
              contentString = `Calculation result: ${result.calculation}`;
            } else if (result.result !== undefined) {
              contentString = `Result: ${result.result}`;
            } else {
              contentString = JSON.stringify(result);
            }
          } else {
            contentString = String(result);
          }
          
          results.push({
            role: 'tool',
            tool_call_id: toolCall.toolUseId,
            content: contentString
          });
        } catch (error) {
          results.push({
            role: 'tool',
            tool_call_id: toolCall.toolUseId,
            content: `Error: ${error.message}`
          });
        }
      }
      
      return results;
    }
  };
}
