/**
 * @typedef {import('../types').Tool} Tool
 */

/**
 * Mock implementation of Tool for testing
 * @implements {Tool}
 */
export class MockTool {
  /**
   * @param {string} name - The name of the tool
   * @param {string} description - The description of the tool
   * @param {Object} parameters - The parameters schema for the tool
   * @param {Function} [executeFn] - Optional function to override the default execute behavior
   */
  constructor(name, description, parameters, executeFn) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.executeFn = executeFn || (async (params) => ({ result: `Executed ${name} with ${JSON.stringify(params)}` }));
    this.executeCount = 0;
    this.lastParams = null;
  }

  /**
   * Get the name of the tool
   * @returns {string} The tool name
   */
  getName() {
    return this.name;
  }

  /**
   * Get the description of the tool
   * @returns {string} The tool description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get the parameters schema for the tool
   * @returns {Object} The parameters schema
   */
  getParameters() {
    return this.parameters;
  }

  /**
   * Execute the tool with the given parameters
   * @param {Object} params - The parameters to execute with
   * @returns {Promise<Object>} The result of execution
   */
  async execute(params) {
    this.executeCount++;
    this.lastParams = params;
    return this.executeFn(params);
  }
}
