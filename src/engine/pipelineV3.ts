import type { TransformOptions, PipelineStage, TransformResult, ExecutionMode } from '../types';
import { buildSentenceObjects } from '../utils/tokenizer';
import type { Paragraph } from './paragraphSegmenter';
import { segmentIntoParagraphs, extractSentencesFromParagraphs } from './paragraphSegmenter';
import { analyzeStructure } from './structuralAnalysis';
import { structuralOperators } from './pipelineV2';
import { lexicalSubstitutor } from '../operators/lexical/lexicalSubstitutor';
import { rhythmVariator } from '../operators/rhythm/rhythmVariator';
import { semanticGuardParagraph } from './semanticGuard';
import { rewriteParagraph } from '../llm/paragraphRewrite';

export async function runPipelineV3(
  input: string,
  options: TransformOptions & { executionMode: ExecutionMode; activeModelId?: string | null },
  onStageChange: (stage: PipelineStage, progressMessage?: string) => void
): Promise<TransformResult> {
  const stageLog: string[] = [`Engine V3: Running in ${options.executionMode} Mode`];
  let changeCount = 0;

  // 1: Stage 1 (Tokenization into Paragraphs vs Sentences)
  onStageChange('Tokenizing', 'Segmenting text...');
  let paragraphs = segmentIntoParagraphs(input);
  const initialWordCount = input.split(' ').filter(Boolean).length;
  await new Promise(r => setTimeout(r, 50));

  // Mode Distribution
  if (options.executionMode === 'Lightweight') {
    // Run purely structural/algorithmic (same as V2 without LLM)
    onStageChange('Analyzing', 'Analyzing Metrics');
    let sentences = extractSentencesFromParagraphs(paragraphs);
    analyzeStructure(sentences);

    onStageChange('Transforming', 'Applying Structural Handlers');
    for (const op of structuralOperators) {
      sentences = op(sentences, options.varianceLevel);
    }
    sentences = lexicalSubstitutor(sentences, options.varianceLevel);

    onStageChange('Checking', 'Balancing Rhythm');
    sentences = rhythmVariator(sentences, options.varianceLevel);

    const outputStr = sentences.map(s => s.originalText).join(' ').replace(/\s{2,}/g, ' ');
    if (outputStr !== input) changeCount = Math.max(1, Math.floor(Math.abs(input.length - outputStr.length) / 5) || 5);
    onStageChange('Complete', 'Transformation Finished');
    return { output: outputStr, changeCount, stageLog };
  }

  // Balanced or Advanced LLM Mode (requires activeModelId)
  if (!options.activeModelId) {
    stageLog.push('No Active ML model selected! Falling back to Lightweight.');
    return runPipelineV3(input, { ...options, executionMode: 'Lightweight' }, onStageChange);
  }

  onStageChange('Analyzing', 'Structuring for ML inference...');
  
  const rewrittenParagraphs: Paragraph[] = [];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    
    onStageChange('Transforming', `Rewriting paragraph ${i + 1}/${paragraphs.length}...`);
    let newParaText = await rewriteParagraph(p.originalText, options.activeModelId, () => {
      // Could stream ML progress back up to UI here
    });

    if (options.executionMode === 'Advanced') {
      onStageChange('Transforming', `Deep rewriting paragraph ${i + 1}/${paragraphs.length}...`);
      // Multi-pass LLM rewrite
      newParaText = await rewriteParagraph(newParaText, options.activeModelId);
    }

    onStageChange('Checking', `Semantic guard on paragraph ${i + 1}/${paragraphs.length}...`);
    // Semantic Guard against severe drift
    newParaText = await semanticGuardParagraph(p.originalText, newParaText);

    rewrittenParagraphs.push({
      originalText: newParaText,
      sentences: buildSentenceObjects(newParaText)
    });
  }

  // Convert rewritten paragraphs back to sentences for final polish algorithms
  let sentences = extractSentencesFromParagraphs(rewrittenParagraphs);
  
  onStageChange('Transforming', 'Applying Final Polish');
  for (const op of structuralOperators) {
    sentences = op(sentences, options.varianceLevel);
  }
  sentences = rhythmVariator(sentences, options.varianceLevel);

  const outputStr = sentences.map(s => s.originalText).join(' ').replace(/\s{2,}/g, ' ');
  
  // Guard length dropping
  const finalWordCount = outputStr.split(' ').filter(Boolean).length;
  if (finalWordCount < initialWordCount * 0.6) {
    onStageChange('Complete', 'Aborted: Too destructive');
    return {
      output: input,
      changeCount: 0,
      stageLog: [...stageLog, "Guard triggered: Output was too short. Returned original."]
    };
  }

  if (outputStr !== input) {
    changeCount = Math.max(1, Math.floor(Math.abs(input.length - outputStr.length) / 5) || 5);
  }

  onStageChange('Complete', 'Engine V3 Pipeline Finished');
  stageLog.push(`Transformation complete using ${options.activeModelId}`);
  
  return { output: outputStr, changeCount, stageLog };
}
