import type { Sentence } from '../../types';
import { synonymMap } from '../../utils/synonyms';

export function lexicalSubstitutor(sentences: Sentence[], variance: number): Sentence[] {
  const result: Sentence[] = [];
  const chance = variance / 100;

  for (const sentence of sentences) {
    let newText = sentence.originalText;
    
    // Context-aware pass (very basic heuristic: don't swap if it creates weird repetition)
    for (const [word, synonyms] of Object.entries(synonymMap)) {
      if (Math.random() < chance) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        newText = newText.replace(regex, (match) => {
          // simple context check - just pick randomly for now but can be expanded
          const syn = synonyms[Math.floor(Math.random() * synonyms.length)];
          if (match[0] === match[0].toUpperCase()) {
            return syn.charAt(0).toUpperCase() + syn.slice(1);
          }
          return syn;
        });
      }
    }
    
    if (newText !== sentence.originalText) {
      result.push({
        originalText: newText,
        tokens: newText.split(' '),
        wordCount: newText.split(' ').length,
        punctuationProfile: newText.match(/[.,!?;:]/g) || []
      });
    } else {
      result.push(sentence);
    }
  }

  return result;
}
