import { tokenizeWords } from '../utils/tokenizer';

export function sentenceSplitter(sentences: string[], variance: number): string[] {
  // Only apply aggressive splitting at higher variance levels (e.g. > 25)
  if (variance < 25) return sentences;

  const result: string[] = [];
  const conjunctions = [' and ', ' but ', ' so ', ' yet '];

  for (const sentence of sentences) {
    const words = tokenizeWords(sentence);
    if (words.length > 30) {
      // Find a conjunction near the middle (30% to 70% of the sentence)
      let splitIndex = -1;
      let usedConj = '';
      
      const lowerSentence = sentence.toLowerCase();
      for (const conj of conjunctions) {
        const idx = lowerSentence.indexOf(conj, Math.floor(sentence.length * 0.3));
        if (idx !== -1 && idx < sentence.length * 0.7) {
          splitIndex = idx;
          usedConj = conj;
          break;
        }
      }

      // probability factor -> 40% at max variance
      const shouldSplit = Math.random() < (variance / 100) * 0.4;

      if (splitIndex !== -1 && shouldSplit) {
        let firstPart = sentence.substring(0, splitIndex).trim();
        let secondPart = sentence.substring(splitIndex + usedConj.length).trim();
        
        // Capitalize second part
        secondPart = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
        
        // Ensure first part ends with a period if it doesn't already
        if (!/[.!?]$/.test(firstPart)) firstPart += '.';
        
        result.push(firstPart);
        result.push(secondPart);
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
