import type { Sentence } from '../../types';

export function sentenceMerger(sentences: Sentence[], variance: number): Sentence[] {
  const mergeChance = (variance / 100) * 0.3;
  if (mergeChance < 0.05) return sentences;

  const result: Sentence[] = [];
  let i = 0;

  while (i < sentences.length) {
    if (i < sentences.length - 1) {
      const s1 = sentences[i];
      const s2 = sentences[i + 1];

      if (s1.wordCount < 6 && s2.wordCount < 6 && Math.random() < mergeChance) {
        const isSemi = Math.random() > 0.5;
        const cleanS1 = s1.originalText.replace(/[.!?]$/, '');
        const s2Lower = isSemi ? s2.originalText : s2.originalText.charAt(0).toLowerCase() + s2.originalText.slice(1);
        
        const mergedText = `${cleanS1}${isSemi ? ';' : ','} ${s2Lower}`;
        result.push({
          originalText: mergedText,
          tokens: [],
          wordCount: mergedText.split(' ').length,
          punctuationProfile: mergedText.match(/[.,!?;:]/g) || []
        });
        i += 2;
        continue;
      }
    }
    result.push(sentences[i]);
    i++;
  }

  return result;
}
