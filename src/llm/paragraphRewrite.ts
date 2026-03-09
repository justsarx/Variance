import type { ProgressCallback } from '../models/modelManager';
import { modelManager } from '../models/modelManager';

export async function rewriteParagraph(
  paragraphText: string, 
  modelId: string, 
  varianceLevel: number = 50,
  progressCallback?: ProgressCallback
): Promise<string> {
  try {
    const generator = await modelManager.loadModel(modelId, progressCallback);
    
    // Dynamic Prompting based on Variance Level
    let styleInstructions = "reads naturally with human-like pacing, engaging sentence structure, and varied lengths";
    
    if (varianceLevel > 75) {
      styleInstructions = "reads with highly dynamic, bursty, and informal pacing. Use varied sentence lengths (extremely short mixed with long, conversational run-on structures). Do not sound polished or robotic. Sound like a real person writing off the cuff.";
    } else if (varianceLevel < 25) {
      styleInstructions = "is extremely polished, formal, and conservative in its pacing.";
    }

    // Designed for instruct-tuned models
    const prompt = `<|system|>
You are an expert ghostwriter. Rewrite the following paragraph so that it ${styleInstructions} while preserving the exact semantic meaning. Return ONLY the rewritten paragraph text. Do not include introductory or concluding remarks.
<|user|>
${paragraphText}
<|assistant|>
`;

    // Dynamic Temperature Scaling
    // Maps variance 0-100 to temperature 0.6 to 1.1 max for SLMs
    const tempScale = 0.6 + ((varianceLevel / 100) * 0.5);

    // Depending on model, max_new_tokens needs to comfortably fit a paragraph
    const output = await generator(prompt, {
      max_new_tokens: 250, 
      temperature: tempScale,
      repetition_penalty: varianceLevel > 75 ? 1.05 : 1.15, // Lower penalty at high variance to allow natural stutters/repeats
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
