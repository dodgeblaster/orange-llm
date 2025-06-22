export class ModelManager {
  constructor(initialModel, fallbackModel) {
    this.fallback = fallbackModel;
    this.currentModel = initialModel;
    this.errorCount = 0;
  }

  getCurrentModel() {
    return this.currentModel;
  }

  setModel(modelId) {
    this.currentModel = modelId;
    return true;
  }

  async handleError(error, retryCallback) {
    this.errorCount++;
    console.error(`Error invoking model ${this.currentModel}: ${error.message}`);
    
    const isFallback = this.currentModel === this.fallback;
    const isRateLimited = error.message?.includes("rate limit") || error.message?.includes("quota");
    const isModelUnavailable = error.message?.includes("model") && error.message?.includes("unavailable");
    
    if (!isFallback && (isRateLimited || isModelUnavailable)) {
      console.error(`Error: ${this.currentModel} is unavailable. Falling back to ${this.fallback}...`);
      this.fallbackToNextModel();
    }

    if (this.errorCount < 3) {
      return retryCallback();
    }

    throw error;
  }

  fallbackToNextModel() {
    const isFallback = this.currentModel === this.fallback;
    if (!isFallback) {
      this.currentModel = this.fallback;
      return true;
    }

    return false;
  }
}
