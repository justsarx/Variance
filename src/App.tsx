import { useState } from 'react';
import { Navbar } from './components/Navbar';
import type { AppView } from './components/Navbar';
import { ControlBar } from './components/ControlBar';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { ChatPanel } from './components/ChatPanel';
import type { ChatMessage } from './components/ChatPanel';
import { StatusBar } from './components/StatusBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ModelManagerPanel } from './components/ModelManagerPanel';
import { runPipelineV3 } from './engine/pipelineV3';
import { PipelineStage } from './types';
import type { ExecutionMode } from './types';
import { useWordStream } from './utils/useWordStream';
import { tokenizeWords } from './utils/tokenizer';
import { generateChatReply } from './llm/chatReply';

const MAX_CHAT_INPUT_CHARS = 4000;
const MAX_CHAT_MESSAGES = 20;

function streamTextIntoMessage(fullText: string, onChunk: (chunk: string) => void, onDone: () => void) {
  const tokens = fullText.split(/(\s+)/).filter(Boolean);
  if (tokens.length === 0) {
    onDone();
    return;
  }

  let idx = 0;
  const timer = window.setInterval(() => {
    onChunk(tokens[idx] ?? '');
    idx += 1;
    if (idx >= tokens.length) {
      window.clearInterval(timer);
      onDone();
    }
  }, 22);
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('Paraphrase');

  const [inputText, setInputText] = useState('');
  const [varianceLevel, setVarianceLevel] = useState(42);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>(PipelineStage.Idle);
  const [changeCount, setChangeCount] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [showModelManager, setShowModelManager] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('Lightweight');
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'OpenAI' | 'Anthropic' | 'Gemini'>('OpenAI');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatResponding, setIsChatResponding] = useState(false);

  const { displayedWords, isStreaming, startStream } = useWordStream();

  const isTransforming = pipelineStage !== PipelineStage.Idle && pipelineStage !== PipelineStage.Complete;
  const isBusy = isTransforming || isStreaming || isChatResponding;

  const handleTransform = async () => {
    if (!inputText.trim() || isBusy) return;
    setChangeCount(null);
    const result = await runPipelineV3(
      inputText,
      { varianceLevel, executionMode, activeModelId, apiKey, apiProvider },
      setPipelineStage
    );
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

  const handleChatSend = async (rawText: string) => {
    if (isBusy) return;

    const text = rawText.trim().slice(0, MAX_CHAT_INPUT_CHARS);
    if (!text) return;

    const next = [...chatMessages, { role: 'user' as const, content: text }, { role: 'assistant' as const, content: '' }];
    const bounded = next.slice(-MAX_CHAT_MESSAGES);
    setChatMessages(bounded);
    setIsChatResponding(true);

    const history = bounded.slice(0, -1);
    const reply = await generateChatReply({
      executionMode,
      activeModelId,
      apiKey,
      apiProvider,
      history,
      message: text
    });

    let assembled = '';
    streamTextIntoMessage(
      reply,
      (chunk) => {
        assembled += chunk;
        setChatMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: 'assistant', content: assembled };
          }
          return updated;
        });
      },
      () => setIsChatResponding(false)
    );
  };

  const handleClearChat = () => {
    if (isChatResponding) return;
    setChatMessages([]);
  };

  const inputWordCount = activeView === 'Paraphrase'
    ? tokenizeWords(inputText).length
    : tokenizeWords(chatMessages.filter(m => m.role === 'user').map(m => m.content).join(' ')).length;

  const outputWordCount = activeView === 'Paraphrase'
    ? displayedWords.length
    : tokenizeWords(chatMessages.filter(m => m.role === 'assistant').map(m => m.content).join(' ')).length;

  return (
    <ErrorBoundary>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-bg-primary font-ui text-text-primary">
        <Navbar
          isBusy={isBusy}
          executionMode={executionMode}
          apiProvider={apiProvider}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        <div className="flex flex-col flex-1 min-h-0">
          {activeView === 'Paraphrase' ? (
            <>
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
            </>
          ) : (
            <ChatPanel
              messages={chatMessages}
              isResponding={isChatResponding}
              disabled={isBusy}
              onSend={handleChatSend}
              onClear={handleClearChat}
            />
          )}
        </div>

        <StatusBar
          inputWordCount={inputWordCount}
          outputWordCount={outputWordCount}
          pipelineStage={activeView === 'Paraphrase' ? pipelineStage : PipelineStage.Idle}
          executionMode={executionMode}
          activeModelId={activeModelId}
          apiProvider={apiProvider}
          onManageModels={() => setShowModelManager(true)}
        />

        {showModelManager && (
          <ModelManagerPanel
            onClose={() => setShowModelManager(false)}
            activeMode={executionMode}
            onModeSelect={setExecutionMode}
            activeModelId={activeModelId}
            onModelSelect={setActiveModelId}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            apiProvider={apiProvider}
            onApiProviderChange={setApiProvider}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
