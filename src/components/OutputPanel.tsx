import { useEffect, useRef } from 'react';

interface OutputPanelProps {
  words: string[];
  isStreaming: boolean;
  changeCount: number | null;
}

export function OutputPanel({ words, isStreaming, changeCount }: OutputPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [words.length, isStreaming]);

  return (
    <div className="flex flex-col flex-1 bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] h-full min-h-0">
      <div className="flex justify-between items-center px-6 py-4 border-b border-border-default shrink-0 min-h-[53px]">
        <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-text-muted font-medium">HUMANIZED OUTPUT</span>
        {changeCount !== null && changeCount > 0 && !isStreaming && (
          <span className="h-6 px-3 rounded-full bg-accent-glow border border-[rgba(249,115,22,0.3)] text-accent-primary font-ui text-[11px] flex items-center justify-center">
            ↻ {changeCount} changes
          </span>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 relative w-full bg-bg-elevated p-6 overflow-y-auto"
      >
        {words.length === 0 && !isStreaming ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-ui italic text-text-muted text-[14px]">Your humanized text will appear here.</span>
          </div>
        ) : (
          <div className="font-mono text-[14px] leading-[1.75] text-text-primary whitespace-pre-wrap">
            {words.map((word, i) => {
              const safeWord = word || '';
              return <span key={i} className="word-token">{safeWord.includes('\n') ? <><br/>{safeWord.replace('\n', '')}</> : safeWord} </span>
            })}
            {(isStreaming || words.length > 0) && (
              <span className={`cursor-blink font-mono text-[14px] leading-[1.75] text-accent-primary font-bold ${!isStreaming ? 'opacity-0 transition-opacity duration-300' : ''}`}>|</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
