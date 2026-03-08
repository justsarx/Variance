import type { Sentence } from '../types';
import { buildSentenceObjects } from '../utils/tokenizer';

export interface Paragraph {
  originalText: string;
  sentences: Sentence[];
}

export function segmentIntoParagraphs(text: string): Paragraph[] {
  // Split by double newline to detect explicit structural paragraphs
  const rawParagraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return rawParagraphs.map(rawText => {
    return {
      originalText: rawText.trim(),
      sentences: buildSentenceObjects(rawText.trim())
    };
  });
}

// Helper to convert an array of Paragraphs back to a flat array of mapped Sentences for the rest of the V2 operators
export function extractSentencesFromParagraphs(paragraphs: Paragraph[]): Sentence[] {
  const result: Sentence[] = [];
  for (const p of paragraphs) {
    result.push(...p.sentences);
  }
  return result;
}
