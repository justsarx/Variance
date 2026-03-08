import { tokenizeWords } from '../utils/tokenizer';
import type { ChangeEvent } from 'react';

interface InputPanelProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export function InputPanel({ value, onChange, disabled }: InputPanelProps) {
  const wordCount = tokenizeWords(value).length;

  return (
    <div className="flex flex-col flex-1 bg-bg-surface border border-border-default rounded-xl overflow-hidden focus-within:border-border-active transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] h-full min-h-0">
      <div className="flex justify-between items-center px-6 py-4 border-b border-border-default shrink-0">
        <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-text-muted font-medium">INPUT TEXT</span>
        <span className="font-ui text-[12px] text-text-secondary">{wordCount} words</span>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Paste or write your AI-generated text here..."
        className="flex-1 w-full bg-bg-elevated text-text-primary font-mono text-[14px] leading-[1.75] p-6 resize-none outline-none border-none placeholder:text-text-muted"
      />
    </div>
  );
}
