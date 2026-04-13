export interface TransformOptions {
  varianceLevel: number;
  executionMode: ExecutionMode;
  activeModelId?: string | null;
  apiKey?: string;
  apiProvider?: 'OpenAI' | 'Anthropic' | 'Gemini';
}

export type PipelineStage = 'Idle' | 'Tokenizing' | 'Analyzing' | 'Transforming' | 'Checking' | 'Complete';

export const PipelineStage = {
  Idle: 'Idle' as const,
  Tokenizing: 'Tokenizing' as const,
  Analyzing: 'Analyzing' as const,
  Transforming: 'Transforming' as const,
  Checking: 'Checking' as const,
  Complete: 'Complete' as const
};

export interface Sentence {
  originalText: string;
  tokens: string[];
  wordCount: number;
  punctuationProfile: string[];
}

export interface StyleProfile {
  lengthDistribution: Record<string, number>;
  transitionFrequency: number;
  averagePunctuationPerSentence: number;
}

export type ExecutionMode = 'Lightweight' | 'Balanced' | 'Advanced' | 'External';
export type ModelTier = 'light' | 'balanced' | 'advanced';

export interface ModelConfig {
  id: string; // Internal identifier
  name: string; // Display name
  tier: ModelTier;
  size: string;
  description: string;
  hf_repo: string;
}

export interface HardwareCapabilities {
  supportsWebGPU: boolean;
  cpuThreads: number;
  deviceMemory: number | 'unknown'; // navigator.deviceMemory gives rough GB or is unavailable
  recommendedMode: ExecutionMode;
}

export interface TransformResult {
  output: string;
  changeCount: number;
  stageLog: string[];
}
