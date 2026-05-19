import { useEffect, useRef, useState } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isResponding: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
}

export function ChatPanel({ messages, isResponding, disabled, onSend, onClear }: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, messages[messages.length - 1]?.content, isResponding]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="flex-1 px-4 pb-4 pt-4 min-h-0">
      <div className="flex flex-col h-full bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-default shrink-0">
          <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-text-muted font-medium">CHAT</span>
          <button
            onClick={onClear}
            disabled={disabled || messages.length === 0}
            className="bg-transparent border border-border-default text-text-secondary font-ui text-[12px] font-medium py-[6px] px-3 rounded-[8px] hover:border-border-active hover:text-text-primary transition-all duration-150 disabled:opacity-50"
          >
            Clear Chat
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-bg-elevated p-6 space-y-4">
          {messages.length === 0 && !isResponding && (
            <div className="h-full flex items-center justify-center">
              <p className="font-ui italic text-text-muted text-[14px]">Start a chat with your currently selected model.</p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className={m.role === 'user'
                ? 'max-w-[80%] rounded-2xl px-4 py-3 bg-accent-glow border border-[rgba(249,115,22,0.35)] text-text-primary font-ui text-[14px] leading-[1.6]'
                : 'max-w-[80%] rounded-2xl px-4 py-3 bg-bg-primary border border-border-default text-text-primary font-ui text-[14px] leading-[1.6]'}
              >
                {m.content || (m.role === 'assistant' && isResponding ? <span className="cursor-blink text-accent-primary">|</span> : '')}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border-default p-4 bg-bg-surface">
          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={disabled}
              placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
              className="flex-1 min-h-[52px] max-h-[140px] bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-text-primary text-[14px] font-ui outline-none focus:border-accent-primary transition-colors resize-y"
            />
            <button
              onClick={handleSend}
              disabled={disabled || !draft.trim()}
              className="self-end bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)] text-white font-ui text-[13px] font-semibold uppercase tracking-[0.06em] py-[10px] px-5 rounded-[8px] shadow-[0_0_24px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
