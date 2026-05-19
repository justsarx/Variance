import { Fragment } from 'react';
import { PipelineStage } from '../types';

interface StatusBarProps {
  inputWordCount: number;
  outputWordCount: number;
  pipelineStage: PipelineStage;
  executionMode?: string;
  activeModelId?: string | null;
  apiProvider?: 'OpenAI' | 'Anthropic' | 'Gemini';
  onManageModels?: () => void;
}

export function StatusBar({ inputWordCount, outputWordCount, pipelineStage, executionMode, activeModelId, apiProvider, onManageModels }: StatusBarProps) {
  const stages = [
    PipelineStage.Tokenizing,
    PipelineStage.Analyzing,
    PipelineStage.Transforming,
    PipelineStage.Checking
  ];

  const showCenter = pipelineStage !== PipelineStage.Idle && pipelineStage !== PipelineStage.Complete;

  return (
    <div className="h-8 w-full bg-bg-surface border-t border-border-default px-6 flex items-center justify-between shrink-0 font-ui text-[11px] text-text-muted">
      <div>
        Input: {inputWordCount} words &middot; Output: {outputWordCount} words
      </div>

      {showCenter && (
        <div className="flex items-center gap-2 text-accent-primary font-medium">
          {stages.map((stage, idx) => (
            <Fragment key={stage}>
              <span className={pipelineStage === stage ? 'opacity-100' : 'opacity-40'}>
                {stage}...
              </span>
              {idx < stages.length - 1 && <span className="opacity-40">→</span>}
            </Fragment>
          ))}
        </div>
      )}
      {!showCenter && <div />}

      <div className="flex items-center gap-4">
        {executionMode && (
          <div className="flex items-center gap-2">
            <span>Mode: <strong className="text-text-primary">{executionMode}</strong></span>
            {executionMode === 'External' ? (
              <span className="text-accent-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                {apiProvider}
              </span>
            ) : (
              executionMode !== 'Lightweight' && activeModelId && (
              <span className="text-accent-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                {activeModelId}
              </span>
              )
            )}
          </div>
        )}

        <button
          onClick={onManageModels}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <path d="M15 2v2" />
            <path d="M15 20v2" />
            <path d="M2 15h2" />
            <path d="M2 9h2" />
            <path d="M20 15h2" />
            <path d="M20 9h2" />
            <path d="M9 2v2" />
            <path d="M9 20v2" />
          </svg>
          <span>Manage Models</span>
        </button>
      </div>
    </div>
  );
}
