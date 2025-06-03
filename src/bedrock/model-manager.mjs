
export class ModelManager {
  constructor(initialModel, fallbackModel) {
    this.fallback = fallbackModel
    this.currentModel = initialModel;
    this.errorCount = 0
  }

  getCurrentModel() {
    return this.currentModel;
  }

  setModel(modelId) {
    this.currentModel = modelId;
    return true;
  }
  async handleError(error, retryCallback) {
    this.errorCount++
    console.error(`Error invoking model ${this.currentModel}: ${error.message}`);
    const isFallack = this.currentModel === this.fallback
    const isThrottled = error.message?.includes("on-demand throughput isn't supported")
    if (!isFallack && isThrottled) {
      console.error(`Error: Claude 3.5 Sonnet requires an inference profile. Falling back to next model...`);
      this.fallbackToNextModel();
    }

    if (this.errorCount < 3) {
      return retryCallback()
    }

    return () => {}
  }

  fallbackToNextModel() {
    const isFallack = this.currentModel === this.fallback
    if (!isFallack) {
      this.currentModel(this.fallback)
      return true
    }

    return false
  }
}
