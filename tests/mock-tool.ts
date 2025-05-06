import { Tool } from '../index.js';

/**
 * A mock implementation of Tool for testing
 */
export class MockTool implements Tool {
  private name: string;
  private description: string;
  private parameters: object;
  private mockResult: any;

  constructor(name: string, description: string, parameters: object, mockResult: any = {}) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.mockResult = mockResult;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getParameters(): object {
    return this.parameters;
  }

  async execute(params: any): Promise<any> {
    return this.mockResult;
  }

  setMockResult(result: any): void {
    this.mockResult = result;
  }
}
