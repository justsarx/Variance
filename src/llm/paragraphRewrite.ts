import type { ProgressCallback } from '../models/modelManager';
import { modelManager } from '../models/modelManager';

export async function rewriteParagraph(paragraphText: string, modelId: string, progressCallback?: ProgressCallback): Promise<string> {
  try {
    const generator = await modelManager.loadModel(modelId, progressCallback);
    
    // Designed for instruct-tuned models
    const prompt = `<|system|>
You are an expert ghostwriter. Rewrite the following paragraph so that it reads naturally with human-like pacing, engaging sentence structure, and varied lengths while preserving the exact semantic meaning. Do NOT sound formulaic or overly polished. Return ONLY the rewritten paragraph text. Do not include introductory or concluding remarks.
<|user|>
${paragraphText}
<|assistant|>
`;

    // Depending on model, max_new_tokens needs to comfortably fit a paragraph
    const output = await generator(prompt, {
      max_new_tokens: 250, 
      temperature: 0.75,
      repetition_penalty: 1.15,
      do_sample: true,
      return_full_text: false,
    });
    
    // @ts-ignore varying output formats in transformers.js
    let result = Array.isArray(output) ? output[0].generated_text : output.generated_text;
    return result.trim();
  } catch (e) {
    console.error("LLM rewrite failed on paragraph level", e);
    return paragraphText; // fallback to original on failure
  }
}
