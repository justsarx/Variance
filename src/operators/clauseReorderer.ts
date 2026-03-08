export function clauseReorderer(sentences: string[], variance: number): string[] {
  const result: string[] = [];
  const triggerWords = ['Although', 'While', 'Because', 'Since', 'If'];
  
  // Chance up to 30% at max variance
  const reorderChance = (variance / 100) * 0.3;

  for (const sentence of sentences) {
    if (Math.random() > reorderChance) {
      result.push(sentence);
      continue;
    }

    const firstWordMatch = sentence.match(/^([A-Za-z]+)\s/);
    if (firstWordMatch && triggerWords.includes(firstWordMatch[1])) {
      // Try to find the comma separating the clauses.
      // E.g. "Because it is raining, we stayed inside."
      const commaIndex = sentence.indexOf(', ');
      
      // Basic sanity check to ensure the comma isn't too early or too late
      if (commaIndex > 10 && commaIndex < sentence.length - 10) {
        const clause1 = sentence.substring(0, commaIndex); // "Because it is raining"
        const clause2 = sentence.substring(commaIndex + 2); // "we stayed inside."
        
        const c1Word = firstWordMatch[1].toLowerCase();
        // remove "Because " from clause1
        const cleanClause1 = clause1.substring(firstWordMatch[1].length + 1).trim(); 
        
        let newS = `${clause2.charAt(0).toUpperCase()}${clause2.slice(1).replace(/[.!?]$/, '')}, ${c1Word} ${cleanClause1}.`;
        result.push(newS);
        continue;
      }
    }
    result.push(sentence);
  }

  return result;
}
