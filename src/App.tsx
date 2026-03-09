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
        executionMode={executionMode}
        activeModelId={activeModelId}
        onManageModels={() => setShowModelManager(true)}
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
