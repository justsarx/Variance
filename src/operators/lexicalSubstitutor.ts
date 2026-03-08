import { synonymMap } from '../utils/synonyms';

export function lexicalSubstitutor(sentences: string[], variance: number): string[] {
  const result: string[] = [];
  const chance = variance / 100;

  for (const sentence of sentences) {
    let newSentence = sentence;
    for (const [word, synonyms] of Object.entries(synonymMap)) {
      if (Math.random() < chance) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        newSentence = newSentence.replace(regex, (match) => {
          const syn = synonyms[Math.floor(Math.random() * synonyms.length)];
          if (match[0] === match[0].toUpperCase()) {
            return syn.charAt(0).toUpperCase() + syn.slice(1);
          }
          return syn;
        });
      }
    }
    result.push(newSentence);
  }

  return result;
}
