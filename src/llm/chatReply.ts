import { modelManager } from '../models/modelManager';
import type { ExecutionMode } from '../types';
import { rewriteParagraphExternal } from './externalApi';
import { rewriteParagraph } from './paragraphRewrite';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatReplyOptions {
  executionMode: ExecutionMode;
  activeModelId?: string | null;
  apiKey?: string;
  apiProvider?: 'OpenAI' | 'Anthropic' | 'Gemini';
  history: ChatTurn[];
  message: string;
}

function sanitizeChatText(raw: string, userMessage: string): string {
  const text = raw.trim();
  if (!text) return '';

  const markers = ['<|assistant|>', 'Assistant:', 'assistant:'];
  for (const marker of markers) {
    const idx = text.lastIndexOf(marker);
    if (idx >= 0) {
      const candidate = text.slice(idx + marker.length).trim();
      if (candidate) return candidate;
    }
  }

  const lowered = text.toLowerCase();
  const leakedPromptPrefix = 'answer this user message briefly and helpfully:';
  if (lowered.startsWith(leakedPromptPrefix)) return '';
  if (text === userMessage) return '';

  return text;
}

async function localChatReply(history: ChatTurn[], message: string, modelId: string): Promise<string> {
  const extractGeneratedText = (output: unknown): string => {
    if (typeof output === 'string') return output.trim();
    if (Array.isArray(output) && output.length > 0) {
      // @ts-ignore transformers output shape
      if (typeof output[0]?.generated_text === 'string') return output[0].generated_text.trim();
      // @ts-ignore fallback shape
      if (typeof output[0]?.text === 'string') return output[0].text.trim();
    }
    // @ts-ignore transformers output shape
    if (typeof output?.generated_text === 'string') return output.generated_text.trim();
    return '';
  };

  try {
    const generator = await modelManager.loadModel(modelId);
    const recentHistory = history.slice(-12)
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    // Plain instruction format is more robust across mixed instruct/chat checkpoints.
    const prompt = `You are a helpful, concise assistant.
Reply accurately and naturally.

Conversation so far:
${recentHistory}

User: ${message}

Assistant:`;

    const output = await generator(prompt, {
      max_new_tokens: 220,
      temperature: 0.7,
      do_sample: true,
      return_full_text: false,
    });
    const result = sanitizeChatText(extractGeneratedText(output), message);
    if (result) return result;

    // Retry with lower creativity before failing.
    const retryOutput = await generator(prompt, {
      max_new_tokens: 180,
      temperature: 0.4,
      do_sample: false,
      return_full_text: false,
    });
    const retryResult = sanitizeChatText(extractGeneratedText(retryOutput), message);
    return retryResult || 'I could not generate a response. Please try again.';
  } catch (e) {
    console.error('Local chat generation failed', e);
    try {
      // Last-resort fallback so user still gets a response instead of a hard failure.
      const fallback = await rewriteParagraph(
        `Answer this user message briefly and helpfully: ${message}`,
        modelId,
        25
      );
      const cleanedFallback = sanitizeChatText(fallback, message);
      if (cleanedFallback) return cleanedFallback;
    } catch {
      // Ignore fallback failure and return message below.
    }
    return 'Local model response failed. Try a smaller local model or switch to External mode for chat.';
  }
}

export async function generateChatReply(options: ChatReplyOptions): Promise<string> {
  const { executionMode, activeModelId, apiKey, apiProvider, history, message } = options;

  if (executionMode === 'External') {
    if (!apiKey || !apiProvider) {
      return 'External mode requires an API key and provider. Add them in Manage Models.';
    }

    // Reuse external adapter with conversation context packed in.
    const context = history.slice(-10)
      .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n');

    const packedPrompt = `Conversation:
${context}

User: ${message}

Respond as the assistant naturally and helpfully.`;

    return rewriteParagraphExternal(packedPrompt, apiKey, apiProvider, 35);
  }

  if (!activeModelId) {
    return 'No local model is active. Open Manage Models and activate one first.';
  }

  return localChatReply(history, message, activeModelId);
}
