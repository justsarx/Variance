import type { Sentence } from '../types';
import { getEmbedding } from '../utils/embeddings';
import { cosineSimilarity } from '../utils/similarity';

// Threshold for sentence similarity. Below this is rejected.
const SIMILARITY_THRESHOLD = 0.82;

export async function semanticGuardPass(original: Sentence[], transformed: Sentence[]): Promise<Sentence[]> {
  const result: Sentence[] = [];
  
  // Simplistic mapping: We run the guard on sentences that share the same index.
  // In a robust V2 with splitting/merging, you might need a fuzzy rolling window 
  // or pass an identity tuple. For demonstration, we compare index to index, 
  // and if lengths differ (due to splitting), we skip the guard or group them.
  
  if (original.length !== transformed.length) {
    // Structural changes (splitting/merging) occurred. Skip 1:1 guard or implement advanced grouping.
    // For now, allow it to pass.
    return transformed;
  }

  for (let i = 0; i < original.length; i++) {
    const origS = original[i];
    const newS = transformed[i];

    if (origS.originalText === newS.originalText) {
      result.push(newS);
      continue;
    }

    try {
      const origVec = await getEmbedding(origS.originalText);
      const newVec = await getEmbedding(newS.originalText);
      
      const similarity = cosineSimilarity(origVec, newVec);
      
      if (similarity < SIMILARITY_THRESHOLD) {
        console.log(`Semantic Guard REJECTED: [${similarity.toFixed(2)}] "${newS.originalText}" doesn't match "${origS.originalText}"`);
        // Fallback to original
        result.push(origS);
      } else {
        result.push(newS);
      }
    } catch (e) {
      // If embedding fails (network, etc), fallback to new text safely
      console.error("Embedding engine failed, allowing transformation.", e);
      result.push(newS);
    }
  }

  return result;
}

// V3 Paragraph Guard
export async function semanticGuardParagraph(originalText: string, transformedText: string): Promise<string> {
  if (originalText === transformedText) return transformedText;

  try {
    const origVec = await getEmbedding(originalText);
    const newVec = await getEmbedding(transformedText);
    const similarity = cosineSimilarity(origVec, newVec);
    
    if (similarity < SIMILARITY_THRESHOLD) {
      console.log(`Semantic Guard REJECTED Paragraph Rewrite: [${similarity.toFixed(2)}]`);
      return originalText;
    }
    return transformedText;
  } catch (e) {
    console.error("Embedding engine failed, allowing paragraph transformation.", e);
    return transformedText;
  }
}
