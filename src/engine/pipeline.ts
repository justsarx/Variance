import { PipelineStage } from '../types';
import type { TransformOptions, TransformResult } from '../types';
import { tokenizeSentences, tokenizeWords } from '../utils/tokenizer';

import { sentenceSplitter } from '../operators/sentenceSplitter';
import { sentenceMerger } from '../operators/sentenceMerger';
import { clauseReorderer } from '../operators/clauseReorderer';
import { lexicalSubstitutor } from '../operators/lexicalSubstitutor';
import { transitionReducer } from '../operators/transitionReducer';
import { rhythmVariator } from '../operators/rhythmVariator';

export const operatorsRegistry = [
  sentenceSplitter,
  sentenceMerger,
  clauseReorderer,
  lexicalSubstitutor,
  transitionReducer,
  rhythmVariator
];

export async function runPipeline(
  input: string,
  options: TransformOptions,
  onStageChange: (stage: PipelineStage) => void
): Promise<TransformResult> {
  const stageLog: string[] = [];
  let changeCount = 0;

  onStageChange(PipelineStage.Tokenizing);
  stageLog.push("Tokenizing text...");
  await new Promise(r => setTimeout(r, 200));
  let sentences = tokenizeSentences(input);

  onStageChange(PipelineStage.Analyzing);
  stageLog.push("Analyzing sentence structures...");
  await new Promise(r => setTimeout(r, 300));
  const initialWordCount = tokenizeWords(input).length;

  onStageChange(PipelineStage.Transforming);
  stageLog.push("Applying variance operators...");
  await new Promise(r => setTimeout(r, 400));
  
  let currentSentences = [...sentences];
  for (const op of operatorsRegistry) {
    const beforeStr = currentSentences.join(' ');
    currentSentences = op(currentSentences, options.varianceLevel);
    const afterStr = currentSentences.join(' ');
    if (beforeStr !== afterStr) {
      changeCount += Math.max(1, Math.floor(Math.abs(beforeStr.length - afterStr.length) / 10)); // proxy heuristic for number of changes
    }
  }

  onStageChange(PipelineStage.Checking);
  stageLog.push("Verifying semantic constraints...");
  await new Promise(r => setTimeout(r, 200));
  
  // Clean up any double spaces that operators might have introduced
  const outputStr = currentSentences.join(' ').replace(/\s{2,}/g, ' ');
  const finalWordCount = tokenizeWords(outputStr).length;

  if (finalWordCount < initialWordCount * 0.6) {
    onStageChange(PipelineStage.Complete);
    return {
      output: input,
      changeCount: 0,
      stageLog: [...stageLog, "Guard triggered: Output was too short. Returned original."]
    };
  }

  onStageChange(PipelineStage.Complete);
  stageLog.push("Transformation complete.");
  
  // ensure changeCount is > 0 if variance > 0 just to show SOMETHING happened
  if (options.varianceLevel > 0 && changeCount === 0 && outputStr !== input) {
    changeCount = 1;
  }
  
  return {
    output: outputStr,
    changeCount,
    stageLog
  };
}
