import type { ModelConfig } from '../types';

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'qwen2-0.5b',
    name: 'Qwen2-0.5B',
    tier: 'light',
    size: '420MB',
    description: 'Ultra-lightweight rewriting model. Extremely fast.',
    hf_repo: 'Xenova/Qwen1.5-0.5B-Chat' // Note: replace with a quantized model of choice
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
    id: 'gemma-2b',
    name: 'Gemma-2B',
    tier: 'balanced',
    size: '1.2GB',
    description: 'Balanced performance, great for single-pass paragraphs.',
    hf_repo: 'Xenova/gemma-2b-it'
  },
  {
    id: 'smollm-3b',
    name: 'SmolLM-3B',
    tier: 'advanced',
    size: '1.5GB',
    description: 'High quality advanced rewriting with multi-pass potential.',
    hf_repo: 'Xenova/SmolLM-360M-Instruct' // Xenova/SmolLM-360M-Instruct used as placeholder for testing capabilities
  }
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}

// Helper to filter models by hardware recommendation tier
export function getModelsByTier(tier: 'light' | 'balanced' | 'advanced'): ModelConfig[] {
  return AVAILABLE_MODELS.filter(m => m.tier === tier);
}
