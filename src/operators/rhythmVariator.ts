import { tokenizeWords } from '../utils/tokenizer';

export function rhythmVariator(sentences: string[], variance: number): string[] {
  const result: string[] = [];
  const chance = (variance / 100) * 0.2; // roughly 20% max

  for (const sentence of sentences) {
    if (Math.random() < chance && tokenizeWords(sentence).length > 20) {
      const passiveMatch = sentence.match(/(.*) was (.*) by (.*)\./);
      if (passiveMatch && passiveMatch.length === 4) {
        const [, obj, verb, subj] = passiveMatch;
        const newS = `${subj.charAt(0).toUpperCase() + subj.slice(1)} ${verb} ${obj.toLowerCase()}.`;
        result.push(newS);
        continue;
      } else {
        const punchy = ["This changed everything.", "The results were clear.", "It was that simple.", "Consider the impact."];
        result.push(sentence);
        if (Math.random() > 0.5) {
          result.push(punchy[Math.floor(Math.random() * punchy.length)]);
        }
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
