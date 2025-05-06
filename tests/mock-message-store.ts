/**
 * A mock implementation of MessageStoreInterface for testing
 */
export class MockMessageStore {
  private messages: any[] = [];

  constructor(initialMessages: any[] = []) {
    this.messages = [...initialMessages];
  }

  getAllMessages(): any[] {
    return this.messages;
  }

  addMessage(message: any): void {
    this.messages.push(message);
  }

  clearMessages(): void {
    this.messages = [];
  }
}
