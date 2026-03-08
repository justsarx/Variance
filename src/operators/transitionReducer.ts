export function transitionReducer(sentences: string[], variance: number): string[] {
  if (variance < 26) return sentences;

  const result: string[] = [];
  const openers = [
    { text: "Furthermore,", replace: ["Also,", "Plus,", ""] },
    { text: "In conclusion,", replace: ["To sum up,", "Ultimately,", ""] },
    { text: "It is important to note that", replace: ["Importantly,", "Note that", ""] },
    { text: "Additionally,", replace: ["Also,", ""] },
    { text: "Moreover,", replace: ["Also,", "And", ""] },
  ];

  const reduceChance = variance / 100;

  for (const sentence of sentences) {
    let newSentence = sentence;
    if (Math.random() < reduceChance) {
      for (const opener of openers) {
        if (newSentence.startsWith(opener.text)) {
          const replacement = opener.replace[Math.floor(Math.random() * opener.replace.length)];
          newSentence = newSentence.replace(opener.text, replacement).trim();
          if (replacement === "" && newSentence.length > 0) {
            newSentence = newSentence.charAt(0).toUpperCase() + newSentence.slice(1);
          }
          break;
        }
      }
    }
    result.push(newSentence);
  }

  return result;
}
