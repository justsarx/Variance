import { tokenizeWords } from '../utils/tokenizer';

export function sentenceMerger(sentences: string[], variance: number): string[] {
  // Less likely at very low variance. Say scale up to 30% chance.
  const mergeChance = (variance / 100) * 0.3;
  if (mergeChance < 0.05) return sentences;

  const result: string[] = [];
  let i = 0;

  while (i < sentences.length) {
    if (i < sentences.length - 1) {
      const s1 = sentences[i];
      const s2 = sentences[i + 1];
      const words1 = tokenizeWords(s1);
      const words2 = tokenizeWords(s2);

      if (words1.length < 6 && words2.length < 6 && Math.random() < mergeChance) {
        // Merge them using a semicolon or comma
        const isSemi = Math.random() > 0.5;
        // remove trailing punctuation from s1
        const cleanS1 = s1.replace(/[.!?]$/, '');
        // lowercase first char of s2 only if comma
        const s2Lower = isSemi ? s2 : s2.charAt(0).toLowerCase() + s2.slice(1);
        
        const merged = `${cleanS1}${isSemi ? ';' : ','} ${s2Lower}`;
        result.push(merged);
        i += 2;
        continue;
      }
    }
    result.push(sentences[i]);
    i++;
  }

  return result;
}
