/**
 * @typedef {import('../types').LLMService} LLMService
 * @typedef {import('../types').MessageStoreInterface} MessageStoreInterface
 * @typedef {import('../types').Tool} Tool
 * @typedef {import('../types').InvokeResult} InvokeResult
 * @typedef {import('../types').LLMFormatterConfig} LLMFormatterConfig
 */

import { DefaultToolManager } from '../tool-manager.mjs';

/**
 * Mock implementation of LLMService for testing
 * @implements {LLMService}
 */
export class MockLLMService {
  constructor() {
    /** @type {MessageStoreInterface|null} */
    this.messageStore = null;
    
    /** @type {LLMFormatterConfig} */
    this.formatterConfig = {};
    
    this.toolManager = new DefaultToolManager();
    this.invokeModelCalled = false;
    this.lastMessages = [];
  }

  /**
   * Set the message store
   * @param {MessageStoreInterface} messageStore - The message store
   * @param {LLMFormatterConfig} [config={}] - Configuration for the formatter
   */
  setMessageStore(messageStore, config = {}) {
    this.messageStore = messageStore;
    this.formatterConfig = config;
  }

  /**
   * Get formatted messages
   * @returns {Array<{role: string, content: string}>} The formatted messages
   */
  getFormattedMessages() {
    if (!this.messageStore) {
      throw new Error('MessageStore not set');
    }
    return this.messageStore.getAllMessages();
  }

  /**
   * Register tools
   * @param {Tool[]} tools - The tools to register
   */
  registerTools(tools) {
    this.toolManager.registerTools(tools);
  }

  /**
   * Get the tool manager
   * @returns {DefaultToolManager} The tool manager
   */
  getToolManager() {
    return this.toolManager;
  }

  /**
   * Mock implementation of invokeModel
   * @param {Array<{role: string, content: string}>} messages - The messages to process
   * @returns {Promise<InvokeResult>} A mock response
   */
  async invokeModel(messages) {
    this.invokeModelCalled = true;
    this.lastMessages = messages;
    
    return {
      type: 'ASSISTANT_RESPONSE',
      content: 'This is a mock response'
    };
  }
}
