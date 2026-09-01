'use client';

import { useState } from 'react';
import { X, Key, ExternalLink, Check, Zap, Cpu, Sliders, Terminal, Globe, Sparkles, Settings as SettingsIcon, Info } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { PROVIDER_LIST, getProvider, getDefaultModel } from '@/lib/providers';
import { Provider } from '@/types';
import { cn } from '@/lib/utils';

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, settings, setSettings, setProvider } = useChatStore();
  const [apiKey, setApiKey] = useState<Record<Provider, string>>({
    openai: '',
    anthropic: '',
    groq: '',
    ollama: '',
    openrouter: '',
  });
  const [showKey, setShowKey] = useState<Provider | null>(null);

  if (!settingsOpen) return null;

  const handleProviderChange = (provider: Provider) => {
    setProvider(provider);
  };

  const handleModelChange = (model: string) => {
    setSettings({ model });
  };

  const activeProvider = getProvider(settings.provider);

  const saveApiKey = (provider: Provider) => {
    // Save to localStorage — API route reads from env or client header
    localStorage.setItem(`roma-api-key-${provider}`, apiKey[provider]);
    setShowKey(null);
  };

  const getStoredKey = (provider: Provider) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`roma-api-key-${provider}`) || '';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Panel */}
      <div className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Provider Selection */}
          <section className="mb-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Cpu className="h-4 w-4 text-accent" />
              AI Provider
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROVIDER_LIST.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={cn(
                    'group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                    settings.provider === p.id
                      ? 'border-accent bg-accent/10 glow'
                      : 'border-border bg-bg-tertiary hover:border-border-hover'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    {p.free && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                        FREE
                      </span>
                    )}
                    {settings.provider === p.id && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <span className="mt-1 text-xs text-text-tertiary">{p.description}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Model Selection */}
          <section className="mb-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Zap className="h-4 w-4 text-accent" />
              Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {activeProvider.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3 transition-all',
                    settings.model === m.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-bg-tertiary hover:border-border-hover'
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.name}</span>
                    {m.description && (
                      <span className="text-xs text-text-tertiary">{m.description}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {m.contextWindow && (
                      <span className="text-xs text-text-tertiary">
                        {(m.contextWindow / 1000).toFixed(0)}K ctx
                      </span>
                    )}
                    {settings.model === m.id && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* API Key */}
          {activeProvider.apiKeyRequired && (
            <section className="mb-6">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
                <Key className="h-4 w-4 text-accent" />
                API Key
              </label>
              <div className="rounded-xl border border-border bg-bg-tertiary p-4">
                <div className="flex items-center gap-2">
                  <input
                    type={showKey === settings.provider ? 'text' : 'password'}
                    value={apiKey[settings.provider] || getStoredKey(settings.provider)}
                    onChange={(e) =>
                      setApiKey({ ...apiKey, [settings.provider]: e.target.value })
                    }
                    placeholder={`Enter ${activeProvider.name} API key...`}
                    className="flex-1 rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                  />
                  <button
                    onClick={() => saveApiKey(settings.provider)}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
                  >
                    Save
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {activeProvider.apiKeyUrl && (
                    <a
                      href={activeProvider.apiKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                    >
                      Get API key <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    onClick={() =>
                      setShowKey(showKey === settings.provider ? null : settings.provider)
                    }
                    className="text-xs text-text-tertiary hover:text-text-secondary"
                  >
                    {showKey === settings.provider ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-tertiary">
                  Your key is stored locally in your browser. It never leaves your device
                  except when making API calls directly to {activeProvider.name}.
                </p>
              </div>
            </section>
          )}

          {/* Temperature */}
          <section className="mb-6">
            <label className="mb-3 flex items-center justify-between text-sm font-medium text-text-primary">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-accent" />
                Temperature
              </span>
              <span className="rounded-md bg-bg-tertiary px-2 py-0.5 font-mono text-xs text-accent">
                {settings.temperature.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={settings.temperature}
              onChange={(e) => setSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-xs text-text-tertiary">
              <span>Precise (0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (2)</span>
            </div>
          </section>

          {/* Max Tokens */}
          <section className="mb-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Terminal className="h-4 w-4 text-accent" />
              Max Tokens (response length)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={256}
                max={32768}
                step={256}
                value={settings.maxTokens}
                onChange={(e) => setSettings({ maxTokens: parseInt(e.target.value) })}
                className="flex-1 accent-accent"
              />
              <input
                type="number"
                value={settings.maxTokens}
                onChange={(e) => setSettings({ maxTokens: parseInt(e.target.value) || 4096 })}
                className="w-24 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </section>

          {/* System Prompt */}
          <section className="mb-6">
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sparkles className="h-4 w-4 text-accent" />
              System Prompt
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ systemPrompt: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
              placeholder="You are a helpful AI assistant..."
            />
          </section>

          {/* Info banner */}
          <div className="flex items-start gap-2 rounded-xl border border-border bg-bg-tertiary p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <p className="text-xs text-text-secondary">
              <strong>Tip:</strong> You can also set API keys in a <code className="rounded bg-bg-primary px-1 text-accent">.env</code> file
              for server-side configuration. Client-stored keys take priority.
              For <strong>Ollama</strong>, install it from{' '}
              <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                ollama.com
              </a> and run <code className="rounded bg-bg-primary px-1 text-accent">ollama serve</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
