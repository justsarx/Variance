import type { Sentence } from '../../types';

export function rhythmVariator(sentences: Sentence[], variance: number): Sentence[] {
  const result: Sentence[] = [];
  const chance = (variance / 100) * 0.2; // roughly 20% max

  for (const sentence of sentences) {
    if (Math.random() < chance && sentence.wordCount > 20) {
      const passiveMatch = sentence.originalText.match(/(.*) was (.*) by (.*)\./);
      if (passiveMatch && passiveMatch.length === 4) {
        const [, obj, verb, subj] = passiveMatch;
        const newS = `${subj.charAt(0).toUpperCase() + subj.slice(1)} ${verb} ${obj.toLowerCase()}.`;
        result.push({
          originalText: newS,
          tokens: [],
          wordCount: newS.split(' ').length,
          punctuationProfile: newS.match(/[.,!?;:]/g) || []
        });
        continue;
      } else {
        const punchy = ["This changed everything.", "The results were clear.", "It was that simple.", "Consider the impact."];
        result.push(sentence);
        if (Math.random() > 0.5) {
          const punch = punchy[Math.floor(Math.random() * punchy.length)];
          result.push({
            originalText: punch,
            tokens: [],
            wordCount: punch.split(' ').length,
            punctuationProfile: punch.match(/[.,!?;:]/g) || []
          });
        }
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
