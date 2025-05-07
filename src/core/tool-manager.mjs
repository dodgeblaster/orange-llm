/**
 * @typedef {import('../types').Tool} Tool
 * @typedef {import('../types').ToolManager} ToolManager
 * 
 * @typedef {Object} ToolExecutionResult
 * @property {'tool'} role
 * @property {string} toolUseId
 * @property {Object} content
 */

/**
 * Default implementation of the ToolManager interface
 * @implements {ToolManager}
 */
export class DefaultToolManager {
  constructor() {
    /** @type {Tool[]} */
    this.tools = [];
  }

  /**
   * Register tools with the manager
   * @param {Tool[]} tools - The tools to register
   */
  registerTools(tools) {
    // Combine new tools with existing ones, avoiding duplicates
    const existingToolNames = new Set(this.tools.map(t => t.getName()));
    const newTools = tools.filter(t => !existingToolNames.has(t.getName()));
    this.tools.push(...newTools);
    console.log('Current tools in ToolManager:', this.tools.map(t => t.getName()));
  }

  /**
   * Get all registered tools
   * @returns {Tool[]} The registered tools
   */
  getTools() {
    return this.tools;
  }

  /**
   * Get the tool configuration for the LLM
   * @returns {Object|undefined} The tool configuration
   */
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

  /**
   * Convert tools to the format expected by the LLM
   * @returns {Object[]} The formatted tools
   * @protected
   */
  convertToolsToFormat() {
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
      
      const tool = this.tools.find(t => t.getName() === toolName);
      
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
}
