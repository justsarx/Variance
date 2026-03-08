import { pipeline, env, FeatureExtractionPipeline } from '@xenova/transformers';

// Configuration to force ONNX to use generic WASM instead of heavy native binaries in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Supabase/gte-small'; // very fast, lightweight embedding model
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progressCallback?: (data: any) => void): Promise<FeatureExtractionPipeline> {
    if (this.instance === null) {
      // @ts-ignore - typing mismatch in some versions of xenova
      this.instance = pipeline(this.task, this.model, { 
        progress_callback: progressCallback 
      }) as Promise<FeatureExtractionPipeline>;
    }
    return this.instance!;
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  const extractor = await EmbeddingPipeline.getInstance();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
