/**
 * Unit tests for DefaultToolManager
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DefaultToolManager } from '../../src/core/tool-manager.mjs';

// Mock tool class for testing
class MockTool {
  constructor(name, description, parameters, executeImpl) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.executeImpl = executeImpl || (async (params) => ({ result: `Executed ${name}` }));
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getParameters() {
    return this.parameters;
  }

  async execute(params) {
    return this.executeImpl(params);
  }
}

describe('DefaultToolManager', () => {
  let toolManager;

  beforeEach(() => {
    toolManager = new DefaultToolManager();
  });

  describe('constructor', () => {
    it('should initialize with empty tools array', () => {
      assert.deepStrictEqual(toolManager.tools, []);
    });
  });

  describe('registerTools', () => {
    it('should register tools', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1, tool2]);
      
      assert.strictEqual(toolManager.tools.length, 2);
      assert.strictEqual(toolManager.tools[0], tool1);
      assert.strictEqual(toolManager.tools[1], tool2);
    });

    it('should not register duplicate tools', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool1Duplicate = new MockTool('tool1', 'Test Tool 1 Duplicate', { type: 'object' });
      
      toolManager.registerTools([tool1]);
      toolManager.registerTools([tool1Duplicate]);
      
      assert.strictEqual(toolManager.tools.length, 1);
      assert.strictEqual(toolManager.tools[0], tool1);
    });

    it('should append new tools to existing ones', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1]);
      toolManager.registerTools([tool2]);
      
      assert.strictEqual(toolManager.tools.length, 2);
      assert.strictEqual(toolManager.tools[0], tool1);
      assert.strictEqual(toolManager.tools[1], tool2);
    });
  });

  describe('getTools', () => {
    it('should return all registered tools', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1, tool2]);
      
      const tools = toolManager.getTools();
      assert.strictEqual(tools.length, 2);
      assert.strictEqual(tools[0], tool1);
      assert.strictEqual(tools[1], tool2);
    });

    it('should return empty array if no tools registered', () => {
      const tools = toolManager.getTools();
      assert.deepStrictEqual(tools, []);
    });
  });

  describe('getToolConfig', () => {
    it('should return undefined if no tools registered', () => {
      const config = toolManager.getToolConfig();
      assert.strictEqual(config, undefined);
    });

    it('should return proper tool configuration for registered tools', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1, tool2]);
      
      const config = toolManager.getToolConfig();
      assert.deepStrictEqual(config, {
        tools: [
          {
            toolSpec: {
              name: 'tool1',
              description: 'Test Tool 1',
              inputSchema: {
                json: { type: 'object' }
              }
            }
          },
          {
            toolSpec: {
              name: 'tool2',
              description: 'Test Tool 2',
              inputSchema: {
                json: { type: 'object' }
              }
            }
          }
        ],
        toolChoice: {
          auto: {}
        }
      });
    });
  });

  describe('convertToolsToFormat', () => {
    it('should convert tools to the expected format', () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1, tool2]);
      
      const formattedTools = toolManager.convertToolsToFormat();
      assert.deepStrictEqual(formattedTools, [
        {
          toolSpec: {
            name: 'tool1',
            description: 'Test Tool 1',
            inputSchema: {
              json: { type: 'object' }
            }
          }
        },
        {
          toolSpec: {
            name: 'tool2',
            description: 'Test Tool 2',
            inputSchema: {
              json: { type: 'object' }
            }
          }
        }
      ]);
    });
  });

  describe('processToolCalls', () => {
    it('should process tool calls successfully', async () => {
      const executeImpl = async (params) => ({ result: `Executed with ${params.input}` });
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' }, executeImpl);
      
      toolManager.registerTools([tool1]);
      
      const toolCalls = [
        {
          name: 'tool1',
          input: { input: 'test-value' },
          toolUseId: 'call-1'
        }
      ];
      
      const results = await toolManager.processToolCalls(toolCalls);
      
      assert.deepStrictEqual(results, [
        {
          role: 'tool',
          toolUseId: 'call-1',
          content: { result: 'Executed with test-value' }
        }
      ]);
    });

    it('should handle tool not found', async () => {
      const toolCalls = [
        {
          name: 'non-existent-tool',
          input: { input: 'test-value' },
          toolUseId: 'call-1'
        }
      ];
      
      const results = await toolManager.processToolCalls(toolCalls);
      
      assert.deepStrictEqual(results, [
        {
          role: 'tool',
          toolUseId: 'call-1',
          content: { error: 'Tool non-existent-tool not found' }
        }
      ]);
    });

    it('should handle tool execution errors', async () => {
      const executeImpl = async () => {
        throw new Error('Execution failed');
      };
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' }, executeImpl);
      
      toolManager.registerTools([tool1]);
      
      const toolCalls = [
        {
          name: 'tool1',
          input: { input: 'test-value' },
          toolUseId: 'call-1'
        }
      ];
      
      const results = await toolManager.processToolCalls(toolCalls);
      
      assert.deepStrictEqual(results, [
        {
          role: 'tool',
          toolUseId: 'call-1',
          content: { error: 'Execution failed' }
        }
      ]);
    });

    it('should handle input parsing errors', async () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      
      toolManager.registerTools([tool1]);
      
      const toolCalls = [
        {
          name: 'tool1',
          input: '{invalid-json}',
          toolUseId: 'call-1'
        }
      ];
      
      const results = await toolManager.processToolCalls(toolCalls);
      
      assert.deepStrictEqual(results[0].role, 'tool');
      assert.strictEqual(results[0].toolUseId, 'call-1');
      assert.ok(results[0].content.error.includes('Failed to parse tool input'));
    });

    it('should process multiple tool calls', async () => {
      const tool1 = new MockTool('tool1', 'Test Tool 1', { type: 'object' });
      const tool2 = new MockTool('tool2', 'Test Tool 2', { type: 'object' });
      
      toolManager.registerTools([tool1, tool2]);
      
      const toolCalls = [
        {
          name: 'tool1',
          input: { input: 'test1' },
          toolUseId: 'call-1'
        },
        {
          name: 'tool2',
          input: { input: 'test2' },
          toolUseId: 'call-2'
        }
      ];
      
      const results = await toolManager.processToolCalls(toolCalls);
      
      assert.strictEqual(results.length, 2);
      assert.strictEqual(results[0].toolUseId, 'call-1');
      assert.strictEqual(results[1].toolUseId, 'call-2');
    });
  });
});
