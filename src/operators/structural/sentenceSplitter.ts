import type { Sentence } from '../../types';

export function sentenceSplitter(sentences: Sentence[], variance: number): Sentence[] {
  if (variance < 25) return sentences;

  const result: Sentence[] = [];
  const conjunctions = [' and ', ' but ', ' so ', ' yet '];

  for (const sentence of sentences) {
    if (sentence.wordCount > 30) {
      let splitIndex = -1;
      let usedConj = '';
      
      const lowerText = sentence.originalText.toLowerCase();
      // Find a conjunction near the middle (30% to 70% of the sentence)
      for (const conj of conjunctions) {
        const idx = lowerText.indexOf(conj, Math.floor(sentence.originalText.length * 0.3));
        if (idx !== -1 && idx < sentence.originalText.length * 0.7) {
          splitIndex = idx;
          usedConj = conj;
          break;
        }
      }

      let shouldSplit = Math.random() < (variance / 100) * 0.4;
      
      // Phase 2: AI Bypass Uncapping
      if (variance > 75) {
        shouldSplit = Math.random() < (variance / 100) * 0.85; // Up to 85% chance to fragment long sentences
      }

      if (splitIndex !== -1 && shouldSplit) {
        let firstPart = sentence.originalText.substring(0, splitIndex).trim();
        let secondPart = sentence.originalText.substring(splitIndex + usedConj.length).trim();
        
        secondPart = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        if (!/[.!?]$/.test(firstPart)) firstPart += '.';
        
        result.push({
          originalText: firstPart,
          tokens: [], // To be rebuilt at the end if necessary, or just rely on text
          wordCount: firstPart.split(' ').length,
          punctuationProfile: firstPart.match(/[.,!?;:]/g) || []
        });
        
        result.push({
          originalText: secondPart,
          tokens: [],
          wordCount: secondPart.split(' ').length,
          punctuationProfile: secondPart.match(/[.,!?;:]/g) || []
        });
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
