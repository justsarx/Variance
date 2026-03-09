import { Fragment } from 'react';
import { PipelineStage } from '../types';

interface StatusBarProps {
  inputWordCount: number;
  outputWordCount: number;
  pipelineStage: PipelineStage;
  executionMode?: string;
  activeModelId?: string | null;
  onManageModels?: () => void;
}

export function StatusBar({ inputWordCount, outputWordCount, pipelineStage, executionMode, activeModelId, onManageModels }: StatusBarProps) {
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
            {executionMode !== 'Lightweight' && activeModelId && (
              <span className="text-accent-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                {activeModelId}
              </span>
            )}
          </div>
        )}
        
        <button 
          onClick={onManageModels}
          className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <span>Manage Models</span>
        </button>
      </div>
    </div>
  );
}
