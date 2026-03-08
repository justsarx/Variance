import { useState, useEffect } from 'react';
import type { ExecutionMode, HardwareCapabilities } from '../types';
import { AVAILABLE_MODELS } from '../models/modelRegistry';
import { detectHardware } from '../models/hardwareDetection';
import type { ProgressCallback } from '../models/modelManager';
import { modelManager } from '../models/modelManager';

interface Props {
  onClose: () => void;
  activeMode: ExecutionMode;
  onModeSelect: (mode: ExecutionMode) => void;
  activeModelId: string | null;
  onModelSelect: (id: string | null) => void;
}

export function ModelManagerPanel({ onClose, activeMode, onModeSelect, activeModelId, onModelSelect }: Props) {
  const [hw, setHw] = useState<HardwareCapabilities | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, { loaded: number, total: number, status: string }>>({});

  useEffect(() => {
    setHw(detectHardware());
  }, []);

  const handleDownload = async (modelId: string) => {
    try {
      setDownloadProgress(prev => ({ ...prev, [modelId]: { loaded: 0, total: 100, status: 'initializing' } }));
      
      const callback: ProgressCallback = (data) => {
        if (data.status === 'progress' && data.loaded && data.total) {
          setDownloadProgress(prev => ({
            ...prev,
            [modelId]: { loaded: data.loaded as number, total: data.total as number, status: 'downloading' }
          }));
        } else if (data.status === 'ready' || data.status === 'done') {
          setDownloadProgress(prev => ({
            ...prev,
            [modelId]: { loaded: 100, total: 100, status: 'ready' }
          }));
        }
      };

      await modelManager.loadModel(modelId, callback);
      onModelSelect(modelId);
      
      // Auto upgrade mode if they download an advanced model
      const config = AVAILABLE_MODELS.find(m => m.id === modelId);
      if (config) {
        if (config.tier === 'advanced') onModeSelect('Advanced');
        else if (config.tier === 'balanced' || config.tier === 'light') onModeSelect('Balanced');
      }

    } catch (e) {
      console.error("Failed to load model", e);
      setDownloadProgress(prev => ({ ...prev, [modelId]: { loaded: 0, total: 100, status: 'error' } }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-default flex justify-between items-center sticky top-0 bg-bg-surface">
          <h2 className="text-text-primary font-ui font-medium text-[16px]">Engine V3 Settings</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary px-2 py-1">✕</button>
        </div>

        <div className="p-6 space-y-8">
          {/* HW Detection */}
          {hw && (
            <div className="p-4 rounded-xl bg-bg-elevated border border-border-default">
              <h3 className="text-text-primary font-ui text-[12px] uppercase tracking-wider mb-2">Hardware Profile</h3>
              <p className="text-text-secondary text-[14px]">
                WebGPU: <span className={hw.supportsWebGPU ? "text-accent-primary" : "text-text-muted"}>{hw.supportsWebGPU ? "Supported" : "Not available (Fallback to WASM)"}</span> • 
                CPU Threads: {hw.cpuThreads} • 
                Est. Memory: {hw.deviceMemory}GB
              </p>
              <p className="text-accent-primary text-[13px] mt-2">Recommended Mode: <strong>{hw.recommendedMode}</strong></p>
            </div>
          )}

          {/* Execution Modes */}
          <div>
            <h3 className="text-text-primary font-ui text-[12px] uppercase tracking-wider mb-3">Execution Mode</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['Lightweight', 'Balanced', 'Advanced'] as ExecutionMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onModeSelect(mode)}
                  className={`p-3 rounded-xl border text-left transition-all ${activeMode === mode ? 'border-accent-primary bg-accent-glow' : 'border-border-default hover:border-text-muted bg-bg-elevated'}`}
                >
                  <div className={`font-ui text-[14px] ${activeMode === mode ? 'text-accent-primary' : 'text-text-primary'}`}>{mode}</div>
                  <div className="text-[12px] text-text-muted mt-1">
                    {mode === 'Lightweight' && 'Algorithmic transforms. Fast, reliable.'}
                    {mode === 'Balanced' && '1-pass LLM rewrite. Good quality.'}
                    {mode === 'Advanced' && 'Multi-pass LLM rewrite. Best quality.'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Local Models */}
          <div>
            <h3 className="text-text-primary font-ui text-[12px] uppercase tracking-wider mb-3">Local AI Models</h3>
            <div className="space-y-3">
              {AVAILABLE_MODELS.map(model => {
                const isActive = activeModelId === model.id;
                const progress = downloadProgress[model.id];
                const bgClass = isActive ? 'border-accent-primary bg-accent-glow' : 'border-border-default bg-bg-elevated';

                return (
                  <div key={model.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${bgClass}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-ui text-text-primary font-medium">{model.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-bg-primary text-text-muted text-[10px] uppercase">{model.tier}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary mt-1">{model.description}</p>
                      <p className="text-[12px] text-text-muted mt-1">Size: ~{model.size}</p>
                      
                      {progress && progress.status === 'downloading' && (
                        <div className="mt-3">
                          <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
                            <div className="bg-accent-primary h-1.5" style={{ width: `${(progress.loaded / progress.total) * 100}%` }}></div>
                          </div>
                          <p className="text-[11px] text-text-muted mt-1 text-right">{(progress.loaded / 1024 / 1024).toFixed(1)}MB / {(progress.total / 1024 / 1024).toFixed(1)}MB</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      {isActive ? (
                        <span className="text-accent-primary font-ui text-[13px] flex items-center gap-2">✓ Active</span>
                      ) : progress && (progress.status === 'downloading' || progress.status === 'initializing') ? (
                        <span className="text-text-muted font-ui text-[13px]">Downloading...</span>
                      ) : progress && progress.status === 'ready' ? (
                        <button onClick={() => onModelSelect(model.id)} className="px-4 py-2 rounded-lg bg-bg-primary border border-border-default text-text-primary font-ui text-[13px] hover:border-text-muted transition-colors">Activate</button>
                      ) : (
                        <button onClick={() => handleDownload(model.id)} className="px-4 py-2 rounded-lg bg-accent-primary text-black font-ui text-[13px] font-medium hover:bg-opacity-90 transition-colors">Download</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
