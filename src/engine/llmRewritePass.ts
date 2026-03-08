// In a real robust app, this would be a dedicated WebWorker file (e.g., worker.ts)
// For this architecture demo, we expose a loader toggle that hooks into the main thread.
import { rewriteSentence } from '../llm/sentenceRewrite';
import type { Sentence } from '../types';

export async function llmRewritePass(sentences: Sentence[], variance: number, llmEnabled: boolean): Promise<Sentence[]> {
  if (!llmEnabled) return sentences;

  // Likelihood of rewriting a sentence scales with variance (max 30% chance per sentence to save compute)
  const rewriteChance = (variance / 100) * 0.3;
  const result: Sentence[] = [];

  for (const sentence of sentences) {
    if (Math.random() < rewriteChance && sentence.wordCount > 5) {
      const rewrittenText = await rewriteSentence(sentence.originalText);
      if (rewrittenText && rewrittenText !== sentence.originalText) {
        result.push({
          originalText: rewrittenText,
          tokens: rewrittenText.split(' '),
          wordCount: rewrittenText.split(' ').length,
          punctuationProfile: rewrittenText.match(/[.,!?;:]/g) || []
        });
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
