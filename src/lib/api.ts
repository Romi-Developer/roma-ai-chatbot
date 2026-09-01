// ── Client-side AI Provider Service ────────────────────────────────
// Direct calls to AI APIs — no server needed (works in APK/static mode)

import { Provider } from '@/types';

const PROVIDER_URLS: Record<Provider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  ollama: 'http://localhost:11434/api/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export function getApiKey(provider: Provider): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`roma-api-key-${provider}`) || '';
}

export function setApiKey(provider: Provider, key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`roma-api-key-${provider}`, key);
}

export function hasApiKey(provider: Provider): boolean {
  if (provider === 'ollama') return true; // Ollama doesn't need a key
  return !!getApiKey(provider);
}

// ── OpenAI-compatible streaming (OpenAI, Groq, OpenRouter) ─────────
async function streamOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  provider: Provider,
  callbacks: StreamCallbacks,
  signal: AbortSignal
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://localhost:3000';
    headers['X-Title'] = 'RoMa Ai';
  }

  if (provider === 'anthropic') {
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `API error (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errJson.error || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') {
        callbacks.onDone();
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) {
          callbacks.onChunk(delta);
        }
      } catch {
        // skip
      }
    }
  }

  callbacks.onDone();
}

// ── Anthropic streaming ────────────────────────────────────────────
async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  callbacks: StreamCallbacks,
  signal: AbortSignal
) {
  const systemMsg = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const response = await fetch(PROVIDER_URLS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      max_tokens: maxTokens,
      temperature: Math.min(temperature, 1),
      stream: true,
      ...(systemMsg ? { system: systemMsg.content } : {}),
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMsg = `Anthropic API error (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta') {
          const delta = parsed.delta?.text || '';
          if (delta) {
            callbacks.onChunk(delta);
          }
        } else if (parsed.type === 'message_stop') {
          callbacks.onDone();
          return;
        }
      } catch {
        // skip
      }
    }
  }

  callbacks.onDone();
}

// ── Ollama streaming ───────────────────────────────────────────────
async function streamOllama(
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  callbacks: StreamCallbacks,
  signal: AbortSignal
) {
  const response = await fetch(PROVIDER_URLS.ollama, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Ollama error (${response.status}): ${errText}. Make sure Ollama is running (ollama serve) and model is pulled (ollama pull ${model}).`
    );
  }

  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const parsed = JSON.parse(trimmed);
        const content = parsed.message?.content || '';
        if (content) {
          callbacks.onChunk(content);
        }
        if (parsed.done) {
          callbacks.onDone();
          return;
        }
      } catch {
        // skip
      }
    }
  }

  callbacks.onDone();
}

// ── Main entry point ────────────────────────────────────────────────
export async function streamChat(
  provider: Provider,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number,
  callbacks: StreamCallbacks,
  signal: AbortSignal
) {
  const apiKey = getApiKey(provider);

  // Check if key is required
  if (provider !== 'ollama' && !apiKey) {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      groq: 'Groq',
      openrouter: 'OpenRouter',
      gemini: 'Google Gemini',
      deepseek: 'DeepSeek',
      mistral: 'Mistral AI',
    };
    callbacks.onError(
      `No API key for ${names[provider]}. Open Settings (gear icon) → enter your API key. Get a free key from the link in Settings.`
    );
    return;
  }

  try {
    switch (provider) {
      case 'openai':
      case 'groq':
      case 'openrouter':
      case 'gemini':
      case 'deepseek':
      case 'mistral':
        await streamOpenAICompatible(
          PROVIDER_URLS[provider],
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          provider,
          callbacks,
          signal
        );
        break;

      case 'anthropic':
        await streamAnthropic(
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          callbacks,
          signal
        );
        break;

      case 'ollama':
        await streamOllama(
          model,
          messages,
          temperature,
          maxTokens,
          callbacks,
          signal
        );
        break;

      default:
        callbacks.onError(`Unknown provider: ${provider}`);
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      callbacks.onDone();
    } else if (err.message === 'Failed to fetch' || err.message === 'Network request failed' || err.message === 'network error') {
      const providerNames: Record<string, string> = {
        openai: 'OpenAI', anthropic: 'Anthropic', groq: 'Groq',
        ollama: 'Ollama', openrouter: 'OpenRouter',
        gemini: 'Google Gemini', deepseek: 'DeepSeek', mistral: 'Mistral AI',
      };
      const name = providerNames[provider] || 'AI provider';
      if (provider === 'ollama') {
        callbacks.onError(
          `Cannot connect to Ollama at localhost:11434.\n\nMake sure Ollama is running:\n1. Open terminal\n2. Run: ollama serve\n3. Pull model: ollama pull ${model}\n\nIf using from phone, Ollama must run on your PC and both must be on same WiFi.`
        );
      } else {
        callbacks.onError(
          `Network error — cannot reach ${name}.\n\nPossible fixes:\n1. Check your internet connection\n2. Verify your API key is correct in Settings\n3. The API service might be temporarily down\n4. If using a VPN, try disabling it`
        );
      }
    } else {
      callbacks.onError(err.message || 'Unknown error occurred. Please try again.');
    }
  }
}
