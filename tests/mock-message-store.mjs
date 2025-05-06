/**
 * @typedef {import('../types').MessageStoreInterface} MessageStoreInterface
 */

/**
 * Mock implementation of MessageStoreInterface for testing
 * @implements {MessageStoreInterface}
 */
export class MockMessageStore {
  constructor() {
    /** @type {Array<{role: string, content: string, bedrockType: string}>} */
    this.messages = [];
  }

  /**
   * Add a message to the store
   * @param {string} role - The role of the message sender
   * @param {string} content - The content of the message
   * @param {string} bedrockType - The Bedrock-specific role
   */
  addMessage(role, content, bedrockType) {
    this.messages.push({ role, content, bedrockType });
  }

  /**
   * Get all messages in the store
   * @returns {Array<{role: string, content: string, bedrockType: string}>} All messages
   */
  getAllMessages() {
    return this.messages;
  }
}
