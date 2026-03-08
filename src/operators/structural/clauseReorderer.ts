import type { Sentence } from '../../types';

export function clauseReorderer(sentences: Sentence[], variance: number): Sentence[] {
  const result: Sentence[] = [];
  const triggerWords = ['Although', 'While', 'Because', 'Since', 'If'];
  
  const reorderChance = (variance / 100) * 0.3;

  for (const sentence of sentences) {
    if (Math.random() > reorderChance) {
      result.push(sentence);
      continue;
    }

    const firstWordMatch = sentence.originalText.match(/^([A-Za-z]+)\s/);
    if (firstWordMatch && triggerWords.includes(firstWordMatch[1])) {
      const commaIndex = sentence.originalText.indexOf(', ');
      
      if (commaIndex > 10 && commaIndex < sentence.originalText.length - 10) {
        const clause1 = sentence.originalText.substring(0, commaIndex);
        const clause2 = sentence.originalText.substring(commaIndex + 2);
        
        const c1Word = firstWordMatch[1].toLowerCase();
        const cleanClause1 = clause1.substring(firstWordMatch[1].length + 1).trim(); 
        
        let newS = `${clause2.charAt(0).toUpperCase()}${clause2.slice(1).replace(/[.!?]$/, '')}, ${c1Word} ${cleanClause1}.`;
        
        result.push({
          originalText: newS,
          tokens: [],
          wordCount: newS.split(' ').length,
          punctuationProfile: newS.match(/[.,!?;:]/g) || []
        });
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
