'use client';

import { useState } from 'react';
import {
  X, Key, ExternalLink, Check, Zap, Cpu, Sliders, Terminal, Sparkles,
  Settings as SettingsIcon, Info,
} from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { PROVIDER_LIST, getProvider, getDefaultModel } from '@/lib/providers';
import { Provider } from '@/types';
import { cn } from '@/lib/utils';
import { getApiKey, setApiKey as saveApiKey } from '@/lib/api';

export default function SettingsPanel() {
  const { settingsOpen, setSettingsOpen, settings, setSettings, setProvider } = useChatStore();
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  if (!settingsOpen) return null;

  const activeProvider = getProvider(settings.provider);
  const storedKey = getApiKey(settings.provider);
  const maskedKey = storedKey ? '••••••••••••••••' : '';

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      saveApiKey(settings.provider, keyInput.trim());
      setKeyInput('');
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />

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
                  onClick={() => setProvider(p.id)}
                  className={cn(
                    'group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                    settings.provider === p.id ? 'border-accent bg-accent/10 glow' : 'border-border bg-bg-tertiary hover:border-border-hover'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    {p.free && (
                      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">FREE</span>
                    )}
                    {settings.provider === p.id && <Check className="h-4 w-4 text-accent" />}
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
                  onClick={() => setSettings({ model: m.id })}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3 transition-all',
                    settings.model === m.id ? 'border-accent bg-accent/10' : 'border-border bg-bg-tertiary hover:border-border-hover'
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.name}</span>
                    {m.description && <span className="text-xs text-text-tertiary">{m.description}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {m.contextWindow && (
                      <span className="text-xs text-text-tertiary">{(m.contextWindow / 1000).toFixed(0)}K ctx</span>
                    )}
                    {settings.model === m.id && <Check className="h-4 w-4 text-accent" />}
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
                API Key {storedKey && <span className="text-xs text-green-400">✓ Saved</span>}
              </label>
              <div className="rounded-xl border border-border bg-bg-tertiary p-4">
                {storedKey && !keyInput ? (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-text-secondary">{maskedKey}</span>
                    <button
                      onClick={() => setKeyInput('')}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder={`Enter ${activeProvider.name} API key...`}
                      className="flex-1 rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                    />
                    <button
                      onClick={handleSaveKey}
                      className={cn(
                        'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                        keySaved ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-accent-hover'
                      )}
                    >
                      {keySaved ? '✓ Saved' : 'Save'}
                    </button>
                  </div>
                )}
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
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-text-tertiary hover:text-text-secondary"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-tertiary">
                  Your key is stored locally on your device. It never leaves except when making API calls directly to {activeProvider.name}.
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
              type="range" min={0} max={2} step={0.1}
              value={settings.temperature}
              onChange={(e) => setSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-xs text-text-tertiary">
              <span>Precise (0)</span><span>Balanced (0.7)</span><span>Creative (2)</span>
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
                type="range" min={256} max={32768} step={256}
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

          {/* Info */}
          <div className="flex items-start gap-2 rounded-xl border border-border bg-bg-tertiary p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
            <p className="text-xs text-text-secondary">
              <strong>Tip:</strong> For <strong>free</strong> usage, select <strong>Groq</strong> (free tier, very fast) or <strong>Ollama</strong> (100% free, local).
              For Ollama, install from{' '}
              <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">ollama.com</a>{' '}
              and run <code className="rounded bg-bg-primary px-1 text-accent">ollama serve</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
