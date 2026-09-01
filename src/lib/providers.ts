import { Provider, ProviderConfig, ModelOption } from '@/types';

// ── Provider definitions ──────────────────────────────────────────
export const PROVIDERS: Record<Provider, ProviderConfig> = {
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference — FREE tier available',
    apiKeyRequired: true,
    apiKeyUrl: 'https://console.groq.com/keys',
    free: true,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', contextWindow: 131072, description: 'Most capable Llama on Groq' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq', contextWindow: 131072, description: 'Ultra-fast' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', contextWindow: 131072 },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', contextWindow: 32768 },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq', contextWindow: 8192 },
      { id: 'gemma2-29b-it', name: 'Gemma 2 29B', provider: 'groq', contextWindow: 8192 },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', provider: 'groq', contextWindow: 131072, description: 'Reasoning model' },
      { id: 'deepseek-r1-distill-qwen-32b', name: 'DeepSeek R1 Qwen 32B', provider: 'groq', contextWindow: 131072 },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', provider: 'groq', contextWindow: 131072 },
      { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B', provider: 'groq', contextWindow: 131072, description: 'Code specialist' },
    ],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4, GPT-3.5 and more',
    apiKeyRequired: true,
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, description: 'Most capable, multimodal' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, description: 'Fast & affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000 },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai', contextWindow: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', contextWindow: 16385 },
      { id: 'o1-preview', name: 'o1 Preview', provider: 'openai', contextWindow: 128000, description: 'Reasoning model' },
      { id: 'o1-mini', name: 'o1 Mini', provider: 'openai', contextWindow: 65536, description: 'Fast reasoning' },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Opus, Haiku',
    apiKeyRequired: true,
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', contextWindow: 200000, description: 'Most intelligent' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', contextWindow: 200000, description: 'Fastest, affordable' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', contextWindow: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic', contextWindow: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic', contextWindow: 200000 },
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 100+ models via one API',
    apiKeyRequired: true,
    apiKeyUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter', contextWindow: 128000 },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openrouter', contextWindow: 128000 },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', contextWindow: 200000 },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'openrouter', contextWindow: 200000 },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter', contextWindow: 131072 },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', provider: 'openrouter', contextWindow: 131072, description: 'Massive model' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', provider: 'openrouter', contextWindow: 1000000 },
      { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'openrouter', contextWindow: 1000000 },
      { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'openrouter', contextWindow: 128000 },
      { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B', provider: 'openrouter', contextWindow: 65536 },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', contextWindow: 131072, description: 'Reasoning model' },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'openrouter', contextWindow: 131072 },
      { id: 'x-ai/grok-2', name: 'Grok 2', provider: 'openrouter', contextWindow: 131072 },
    ],
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally — 100% free, private, no API key',
    apiKeyRequired: false,
    apiKeyUrl: 'https://ollama.com',
    free: true,
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama', contextWindow: 128000, description: 'Latest Llama — local' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', provider: 'ollama', contextWindow: 128000 },
      { id: 'llama3.1:70b', name: 'Llama 3.1 70B', provider: 'ollama', contextWindow: 128000 },
      { id: 'llama3.1:405b', name: 'Llama 3.1 405B', provider: 'ollama', contextWindow: 128000, description: 'Massive — needs big GPU' },
      { id: 'qwen2.5:7b', name: 'Qwen 2.5 7B', provider: 'ollama', contextWindow: 32768 },
      { id: 'qwen2.5:32b', name: 'Qwen 2.5 32B', provider: 'ollama', contextWindow: 32768 },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', provider: 'ollama', contextWindow: 32768 },
      { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B', provider: 'ollama', contextWindow: 32768, description: 'Code specialist' },
      { id: 'qwen2.5-coder:32b', name: 'Qwen 2.5 Coder 32B', provider: 'ollama', contextWindow: 32768, description: 'Code specialist' },
      { id: 'mistral:7b', name: 'Mistral 7B', provider: 'ollama', contextWindow: 32768 },
      { id: 'mistral-nemo:12b', name: 'Mistral Nemo 12B', provider: 'ollama', contextWindow: 128000 },
      { id: 'mixtral:8x7b', name: 'Mixtral 8x7B', provider: 'ollama', contextWindow: 32768 },
      { id: 'codellama:7b', name: 'Code Llama 7B', provider: 'ollama', contextWindow: 16384 },
      { id: 'codellama:34b', name: 'Code Llama 34B', provider: 'ollama', contextWindow: 16384 },
      { id: 'phi3:mini', name: 'Phi 3 Mini', provider: 'ollama', contextWindow: 128000, description: 'Small & fast' },
      { id: 'phi3.5:3.8b', name: 'Phi 3.5 3.8B', provider: 'ollama', contextWindow: 128000 },
      { id: 'deepseek-r1:7b', name: 'DeepSeek R1 7B', provider: 'ollama', contextWindow: 128000, description: 'Reasoning model' },
      { id: 'deepseek-r1:32b', name: 'DeepSeek R1 32B', provider: 'ollama', contextWindow: 128000, description: 'Reasoning model' },
      { id: 'deepseek-r1:70b', name: 'DeepSeek R1 70B', provider: 'ollama', contextWindow: 128000, description: 'Reasoning model' },
      { id: 'gemma2:2b', name: 'Gemma 2 2B', provider: 'ollama', contextWindow: 8192 },
      { id: 'gemma2:9b', name: 'Gemma 2 9B', provider: 'ollama', contextWindow: 8192 },
      { id: 'gemma2:27b', name: 'Gemma 2 27B', provider: 'ollama', contextWindow: 8192 },
      { id: 'starcoder2:7b', name: 'StarCoder 2 7B', provider: 'ollama', contextWindow: 16384, description: 'Code generation' },
      { id: 'starcoder2:15b', name: 'StarCoder 2 15B', provider: 'ollama', contextWindow: 16384, description: 'Code generation' },
      { id: 'dolphin-llama3:8b', name: 'Dolphin Llama 3 8B', provider: 'ollama', contextWindow: 8192, description: 'Uncensored' },
      { id: 'command-r:35b', name: 'Command R 35B', provider: 'ollama', contextWindow: 128000 },
      { id: 'nomic-embed-text', name: 'Nomic Embed', provider: 'ollama', contextWindow: 8192, description: 'Embeddings' },
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
