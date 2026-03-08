import { pipeline, env, TextGenerationPipeline } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

class LLMPipeline {
  static task = 'text-generation';
  // Using a very small, quantized model capable of basic instruction following
  static model = 'Xenova/TinyLlama-1.1B-Chat-v1.0'; 
  static instance: Promise<TextGenerationPipeline> | null = null;

  static async getInstance(progressCallback?: (data: any) => void): Promise<TextGenerationPipeline> {
    if (this.instance === null) {
      // @ts-ignore
      this.instance = pipeline(this.task, this.model, { 
        progress_callback: progressCallback,
        dtype: 'q4' // quantized for browser
      }) as Promise<TextGenerationPipeline>;
    }
    return this.instance!;
  }
}

export async function rewriteSentence(sentence: string): Promise<string> {
  try {
    const generator = await LLMPipeline.getInstance();
    
    const prompt = `<|system|>
You are a writing assistant. Rewrite the following sentence to sound more natural and varied while keeping the exact same meaning. Return ONLY the rewritten sentence.
<|user|>
${sentence}
<|assistant|>
`;

    const output = await generator(prompt, {
      max_new_tokens: 50,
      temperature: 0.7,
      repetition_penalty: 1.2,
      do_sample: true,
      return_full_text: false,
    });
    
    // @ts-ignore varying output formats in transformers.js
    let result = Array.isArray(output) ? output[0].generated_text : output.generated_text;
    return result.trim();
  } catch (e) {
    console.error("LLM rewrite failed", e);
    return sentence; // fallback to original
  }
}
