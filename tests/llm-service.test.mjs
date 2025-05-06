import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MockLLMService } from './mock-llm-service.mjs';
import { MockMessageStore } from './mock-message-store.mjs';
import { MockTool } from './mock-tool.mjs';

describe('LLMService Interface', () => {
  it('should set and use message store', () => {
    const service = new MockLLMService();
    const messageStore = new MockMessageStore();
    
    messageStore.addMessage('user', 'Hello', 'user');
    
    service.setMessageStore(messageStore);
    const messages = service.getFormattedMessages();
    
    assert.strictEqual(messages.length, 1);
    assert.strictEqual(messages[0].content, 'Hello');
  });
  
  it('should register and retrieve tools', async () => {
    const service = new MockLLMService();
    const tool = new MockTool(
      'test-tool',
      'A test tool',
      {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    );
    
    service.registerTools([tool]);
    const toolManager = service.getToolManager();
    const tools = toolManager.getTools();
    
    assert.strictEqual(tools.length, 1);
    assert.strictEqual(tools[0].getName(), 'test-tool');
  });
  
  it('should invoke model with messages', async () => {
    const service = new MockLLMService();
    const messageStore = new MockMessageStore();
    
    messageStore.addMessage('user', 'Hello', 'user');
    service.setMessageStore(messageStore);
    
    const response = await service.invokeModel(service.getFormattedMessages());
    
    assert.strictEqual(service.invokeModelCalled, true);
    assert.strictEqual(response.type, 'ASSISTANT_RESPONSE');
    assert.strictEqual(response.content, 'This is a mock response');
  });
  
  it('should handle tool configuration', () => {
    const service = new MockLLMService();
    const tool = new MockTool(
      'test-tool',
      'A test tool',
      {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    );
    
    service.registerTools([tool]);
    const toolManager = service.getToolManager();
    const toolConfig = toolManager.getToolConfig();
    
    assert.ok(toolConfig);
    assert.strictEqual(toolConfig.tools.length, 1);
    assert.strictEqual(toolConfig.tools[0].toolSpec.name, 'test-tool');
  });
});
