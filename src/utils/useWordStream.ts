import { useState, useCallback, useRef } from 'react';

export function useWordStream() {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamTimer = useRef<number | null>(null);

  const startStream = useCallback((fullText: string) => {
    setIsStreaming(true);
    setDisplayedWords([]);
    
    // We split by spaces but we need to keep spaces if we want to render them correctly,
    // actually, for word reveal, we can just split by space and render with margin.
    // Or we split by space and let the component join them visually.
    const words = fullText.split(' ');
    let index = 0;
    
    if (streamTimer.current) {
      clearInterval(streamTimer.current);
    }
    
    setDisplayedWords([]);

    streamTimer.current = window.setInterval(() => {
      if (index < words.length) {
        // capture the word before the updater or index increment
        const nextWord = words[index];
        setDisplayedWords(prev => [...prev, nextWord]);
        index++;
      } else {
        setIsStreaming(false);
        if (streamTimer.current) {
          clearInterval(streamTimer.current);
          streamTimer.current = null;
        }
      }
    }, 20); // 20ms per word streamed
  }, []);

  return { displayedWords, isStreaming, startStream };
}
