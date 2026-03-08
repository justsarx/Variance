import type { TransformOptions, TransformResult } from '../types';
import { PipelineStage } from '../types';
import { buildSentenceObjects } from '../utils/tokenizer';
import { analyzeStructure } from './structuralAnalysis';

import { sentenceSplitter } from '../operators/structural/sentenceSplitter';
import { sentenceMerger } from '../operators/structural/sentenceMerger';
import { clauseReorderer } from '../operators/structural/clauseReorderer';
import { lexicalSubstitutor } from '../operators/lexical/lexicalSubstitutor';
import { rhythmVariator } from '../operators/rhythm/rhythmVariator';

import { llmRewritePass } from './llmRewritePass';
import { semanticGuardPass } from './semanticGuard';

export const structuralOperators = [
  sentenceSplitter,
  sentenceMerger,
  clauseReorderer,
];

export async function runPipelineV2(
  input: string,
  options: TransformOptions & { llmEnabled?: boolean },
  onStageChange: (stage: PipelineStage) => void
): Promise<TransformResult> {
  const stageLog: string[] = [];
  let changeCount = 0;

  // Stage 1: Tokenization
  onStageChange(PipelineStage.Tokenizing);
  stageLog.push("Tokenizing text into Sentence objects...");
  await new Promise(r => setTimeout(r, 100)); // UI paint
  let sentences = buildSentenceObjects(input);
  const initialWordCount = sentences.reduce((acc, s) => acc + s.wordCount, 0);

  // Stage 2: Structural Analysis
  onStageChange(PipelineStage.Analyzing);
  stageLog.push("Analyzing text structure and stylistic metrics...");
  await new Promise(r => setTimeout(r, 100));
  analyzeStructure(sentences);

  onStageChange(PipelineStage.Transforming);
  // Stage 3: Structural Transform Pass
  stageLog.push("Applying Stage 3: Syntax operators (split/merge/reorder)...");
  await new Promise(r => setTimeout(r, 100));
  for (const op of structuralOperators) {
    sentences = op(sentences, options.varianceLevel);
  }

  // Stage 4: Lexical Variation
  stageLog.push("Applying Stage 4: Context-aware Lexical Substitution...");
  await new Promise(r => setTimeout(r, 100));
  sentences = lexicalSubstitutor(sentences, options.varianceLevel);

  // Stage 5: Optional LLM Micro-Rewrite
  if (options.llmEnabled) {
    stageLog.push("Applying Stage 5: Local LLM Micro-Rewrite...");
    await new Promise(r => setTimeout(r, 100));
    sentences = await llmRewritePass(sentences, options.varianceLevel, true);
  }

  onStageChange(PipelineStage.Checking);
  // Stage 6: Semantic Guard
  stageLog.push("Applying Stage 6: Semantic Similarity Guard...");
  await new Promise(r => setTimeout(r, 100));
  const originalSentences = buildSentenceObjects(input);
  sentences = await semanticGuardPass(originalSentences, sentences);

  // Stage 7: Rhythm Balancing
  stageLog.push("Applying Stage 7: Rhythm Balancing...");
  await new Promise(r => setTimeout(r, 100));
  sentences = rhythmVariator(sentences, options.varianceLevel);

  // Stage 8: Output Assembly
  const outputStr = sentences.map(s => s.originalText).join(' ').replace(/\s{2,}/g, ' ');
  const finalWordCount = outputStr.split(' ').filter(Boolean).length;
  
  // Guard length dropping
  if (finalWordCount < initialWordCount * 0.6) {
    onStageChange(PipelineStage.Complete);
    return {
      output: input,
      changeCount: 0,
      stageLog: [...stageLog, "Guard triggered: Output was too short. Returned original."]
    };
  }

  if (outputStr !== input) {
    // Rough estimate logic or just rely on the new pipeline logic logging
    changeCount = Math.max(1, Math.floor(Math.abs(input.length - outputStr.length) / 5) || 5);
  }

  onStageChange(PipelineStage.Complete);
  stageLog.push("Engine V2 Transformation complete.");
  
  return {
    output: outputStr,
    changeCount,
    stageLog
  };
}
