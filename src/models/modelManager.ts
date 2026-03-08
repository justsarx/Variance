import { pipeline, env, TextGenerationPipeline } from '@xenova/transformers';
import { getModelById } from './modelRegistry';

// Force IndexedDB browser caching
env.allowLocalModels = false;
env.useBrowserCache = true;

// Define a callback type for UI tracking
export type ProgressCallback = (data: { status: string; name: string; file: string; progress?: number; loaded?: number; total?: number }) => void;

class LLMManager {
  static activeModelId: string | null = null;
  static instance: Promise<TextGenerationPipeline> | null = null;

  static async loadModel(modelId: string, progressCallback?: ProgressCallback): Promise<TextGenerationPipeline> {
    const config = getModelById(modelId);
    if (!config) throw new Error(`Model ${modelId} not found in registry`);

    if (this.activeModelId === modelId && this.instance) {
      return this.instance;
    }

    // Flush old instance if switching models
    this.instance = null;
    this.activeModelId = modelId;

    // We assume the device has WebGPU or fallback down to WASM internally
    // @ts-ignore
    this.instance = pipeline('text-generation', config.hf_repo, {
      progress_callback: progressCallback
    }) as Promise<TextGenerationPipeline>;

    return this.instance!;
  }

  static async getActiveInstance(): Promise<TextGenerationPipeline | null> {
    if (!this.instance) return null;
    return this.instance;
  }
}

export const modelManager = LLMManager;
