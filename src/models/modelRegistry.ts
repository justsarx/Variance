import type { ModelConfig } from '../types';

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'qwen2-0.5b',
    name: 'Qwen2-0.5B',
    tier: 'light',
    size: '420MB',
    description: 'Ultra-lightweight rewriting model. Extremely fast.',
    hf_repo: 'Xenova/Qwen1.5-0.5B-Chat'
  },
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama-1.1B',
    tier: 'light',
    size: '650MB',
    description: 'Lightweight model with good baseline variation.',
    hf_repo: 'Xenova/TinyLlama-1.1B-Chat-v1.0'
  },
  {
    id: 'qwen1.5-1.8b',
    name: 'Qwen1.5-1.8B',
    tier: 'balanced',
    size: '1.1GB',
    description: 'Stronger rewriting model with better semantic control.',
    hf_repo: 'Xenova/Qwen1.5-1.8B-Chat'
  },
  {
    id: 'phi-2',
    name: 'Phi-2',
    tier: 'advanced',
    size: '1.4GB',
    description: 'High quality rewriting with strong reasoning capability.',
    hf_repo: 'Xenova/phi-2'
  }
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

export function getModelsByTier(tier: 'light' | 'balanced' | 'advanced'): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.tier === tier);
}