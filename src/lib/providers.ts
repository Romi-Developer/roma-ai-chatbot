import { Provider, ProviderConfig, ModelOption } from '@/types';

// ── Provider definitions ──────────────────────────────────────────
// Models listed here are the commonly used ones. The API route will
// accept any model id the user configures.

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo and more',
    apiKeyRequired: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, description: 'Most capable, multimodal' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: 'Fast & affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385 },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Opus, Haiku — excellent for long contexts',
    apiKeyRequired: true,
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', contextWindow: 200000, description: 'Most intelligent' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', contextWindow: 200000, description: 'Fastest, affordable' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', contextWindow: 200000 },
    ],
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference for open models — FREE tier available',
    apiKeyRequired: true,
    apiKeyUrl: 'https://console.groq.com/keys',
    free: true,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', contextWindow: 131072, description: 'Most capable Llama on Groq' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq', contextWindow: 131072, description: 'Ultra-fast' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', contextWindow: 32768 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq', contextWindow: 8192 },
    ],
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally — 100% free, private, no API key needed',
    apiKeyRequired: false,
    apiKeyUrl: 'https://ollama.com/download',
    free: true,
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama', contextWindow: 128000, description: 'Latest Llama — local' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', provider: 'ollama', contextWindow: 128000 },
      { id: 'llama3.1:70b', name: 'Llama 3.1 70B', provider: 'ollama', contextWindow: 128000 },
      { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', provider: 'ollama', contextWindow: 32768 },
      { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B', provider: 'ollama', contextWindow: 32768 },
      { id: 'mistral:7b', name: 'Mistral 7B', provider: 'ollama', contextWindow: 32768 },
      { id: 'codellama:7b', name: 'Code Llama 7B', provider: 'ollama', contextWindow: 16384 },
      { id: 'phi3:mini', name: 'Phi 3 Mini', provider: 'ollama', contextWindow: 128000 },
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models (GPT, Claude, Llama, Mistral, Gemini) via one API',
    apiKeyRequired: true,
    apiKeyUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OR)', provider: 'openrouter', contextWindow: 128000 },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OR)', provider: 'openrouter', contextWindow: 200000 },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (via OR)', provider: 'openrouter', contextWindow: 131072 },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5 (via OR)', provider: 'openrouter', contextWindow: 1000000 },
      { id: 'mistralai/mistral-large', name: 'Mistral Large (via OR)', provider: 'openrouter', contextWindow: 128000 },
    ],
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

export function getProvider(id: Provider): ProviderConfig {
  return PROVIDERS[id];
}

export function getDefaultModel(provider: Provider): string {
  return PROVIDERS[provider].models[0]?.id ?? '';
}

export function getModelInfo(modelId: string, provider: Provider): ModelOption | undefined {
  return PROVIDERS[provider].models.find((m) => m.id === modelId);
}
