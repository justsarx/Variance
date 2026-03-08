import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ControlBar } from './components/ControlBar';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { StatusBar } from './components/StatusBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ModelManagerPanel } from './components/ModelManagerPanel';
import { runPipelineV3 } from './engine/pipelineV3';
import { PipelineStage } from './types';
import type { ExecutionMode } from './types';
import { useWordStream } from './utils/useWordStream';
import { tokenizeWords } from './utils/tokenizer';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [varianceLevel, setVarianceLevel] = useState(42);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.Idle);
  const [changeCount, setChangeCount] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // V3 Engine State
  const [showModelManager, setShowModelManager] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('Lightweight');
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  const { displayedWords, isStreaming, startStream } = useWordStream();

  const isTransforming = pipelineStage !== PipelineStage.Idle && pipelineStage !== PipelineStage.Complete;
  const isBusy = isTransforming || isStreaming;

  const handleTransform = async () => {
    if (!inputText.trim() || isBusy) return;
    setChangeCount(null);
    const result = await runPipelineV3(inputText, { varianceLevel, executionMode, activeModelId }, setPipelineStage);
    setChangeCount(result.changeCount);
    startStream(result.output);
  };

  const handleClear = () => {
    setInputText('');
    setPipelineStage(PipelineStage.Idle);
    setChangeCount(null);
    startStream('');
  };

  const handleCopy = () => {
    const textToCopy = displayedWords.join(' ');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const inputWordCount = tokenizeWords(inputText).length;
  const outputWordCount = displayedWords.length;

  return (
    <ErrorBoundary>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-bg-primary font-ui text-text-primary">
      <Navbar isTransforming={isTransforming} />
      
      <div className="flex flex-col flex-1 min-h-0">
        <ControlBar 
          varianceLevel={varianceLevel}
          setVarianceLevel={setVarianceLevel}
          onClear={handleClear}
          onCopy={handleCopy}
          onTransform={handleTransform}
          isTransforming={isTransforming}
          copySuccess={copySuccess}
          disabled={isBusy}
        />

        <div className="flex items-center justify-between px-6 py-2 border-b border-border-default bg-bg-primary font-ui text-[12px] text-text-secondary">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="font-ui text-[12px] uppercase tracking-wider text-text-secondary w-20">Variance</span>
              <input 
                type="range" 
                className="flex-1 accent-accent-primary"
                min="0"
                max="1"
                step="0.1"
                value={varianceLevel}
                onChange={(e) => setVarianceLevel(parseFloat(e.target.value))}
                disabled={isBusy}
              />
              <span className="font-ui text-[12px] text-text-primary w-8 text-right">{(varianceLevel * 10).toFixed(0)}/10</span>
            </div>
            
            <button 
              onClick={handleTransform}
              disabled={isBusy || !inputText.trim()}
              className={`px-8 py-2 rounded-xl font-ui font-medium tracking-wide transition-all ${
                isBusy || !inputText.trim()
                  ? 'bg-bg-elevated text-text-muted cursor-not-allowed border border-border-default'
                  : 'bg-accent-primary text-black hover:bg-opacity-90 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
              }`}
            >
              {isBusy ? 'Transforming...' : 'Inject Variance'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-2 border-b border-border-default bg-bg-primary font-ui text-[12px] text-text-secondary">
          <div className="flex items-center gap-3">
            <span>Engine V3 Mode: <strong className="text-text-primary ml-1">{executionMode}</strong></span>
            {executionMode !== 'Lightweight' && activeModelId && (
              <span className="px-2 py-0.5 rounded bg-accent-glow text-accent-primary border border-accent-primary border-opacity-30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary"></span>
                {activeModelId}
              </span>
            )}
          </div>
          <button 
            onClick={() => setShowModelManager(true)}
            disabled={isBusy}
            className="text-text-primary hover:text-accent-primary hover:bg-bg-elevated px-3 py-1 rounded-md transition-colors border border-border-default hover:border-accent-primary"
          >
            Manage Local Models
          </button>
        </div>
        
        <div className="flex-1 flex gap-4 px-4 pb-4 pt-4 min-h-0">
          <InputPanel 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isBusy}
          />
          <OutputPanel 
            words={displayedWords}
            isStreaming={isStreaming}
            changeCount={changeCount}
          />
        </div>
      </div>

      <StatusBar 
        inputWordCount={inputWordCount}
        outputWordCount={outputWordCount}
        pipelineStage={pipelineStage}
      />
      
      {showModelManager && (
        <ModelManagerPanel 
          onClose={() => setShowModelManager(false)}
          activeMode={executionMode}
          onModeSelect={setExecutionMode}
          activeModelId={activeModelId}
          onModelSelect={setActiveModelId}
        />
      )}
    </div>
    </ErrorBoundary>
  );
}
