// ── Types ─────────────────────────────────────────────────────────

export type Provider = 'openai' | 'anthropic' | 'groq' | 'ollama' | 'openrouter' | 'gemini' | 'deepseek' | 'mistral';

export interface ModelOption {
  id: string;
  name: string;
  provider: Provider;
  contextWindow?: number;
  description?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  model?: string;
  provider?: Provider;
  error?: boolean;
  pending?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  provider: Provider;
  systemPrompt?: string;
}

export interface Settings {
  provider: Provider;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  streaming: boolean;
}

export interface ProviderConfig {
  id: Provider;
  name: string;
  description: string;
  models: ModelOption[];
  apiKeyRequired: boolean;
  apiKeyUrl?: string;
  free?: boolean;
}
