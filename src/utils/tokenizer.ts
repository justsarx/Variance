import type { Sentence } from '../types';

export function tokenizeSentences(text: string): string[] {
  // Regex that splits on sentence-ending punctuation (., !, ?) followed by a space and capital letter.
  return text.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
}

export function tokenizeWords(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

export function buildSentenceObjects(text: string): Sentence[] {
  const strings = tokenizeSentences(text);
  return strings.map(s => {
    const tokens = tokenizeWords(s);
    const punctuationProfile = (s.match(/[.,!?;:]/g) || []);
    return {
      originalText: s,
      tokens,
      wordCount: tokens.length,
      punctuationProfile
    };
  });
}
