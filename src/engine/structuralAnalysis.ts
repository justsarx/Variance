import type { Sentence, StyleProfile } from '../types';

export function analyzeStructure(sentences: Sentence[]): StyleProfile {
  const lengthDistribution: Record<string, number> = {
    short: 0, // < 10 words
    medium: 0, // 10-25 words
    long: 0 // > 25 words
  };

  let totalPunctuation = 0;
  let transitionCount = 0;

  const transitionWords = [
    'however', 'therefore', 'furthermore', 'moreover', 'consequently',
    'although', 'additionally', 'secondly', 'in conclusion'
  ];

  for (const sentence of sentences) {
    if (sentence.wordCount < 10) lengthDistribution.short++;
    else if (sentence.wordCount <= 25) lengthDistribution.medium++;
    else lengthDistribution.long++;

    totalPunctuation += sentence.punctuationProfile.length;

    const lowerText = sentence.originalText.toLowerCase();
    for (const transition of transitionWords) {
      if (lowerText.startsWith(transition)) {
        transitionCount++;
        break;
      }
    }
  }

  return {
    lengthDistribution,
    transitionFrequency: sentences.length > 0 ? transitionCount / sentences.length : 0,
    averagePunctuationPerSentence: sentences.length > 0 ? totalPunctuation / sentences.length : 0
  };
}
