'use client';

import { X, Send, Sun, Moon, Monitor, Info, Code2, Sparkles } from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  const { theme, setTheme } = useThemeStore();

  if (!open) return null;

  const themes: { id: ThemeMode; name: string; icon: any; label: string }[] = [
    { id: 'light', name: 'Light', icon: Sun, label: 'Light Mode' },
    { id: 'dark', name: 'Night', icon: Moon, label: 'Night Mode' },
    { id: 'system', name: 'Default', icon: Monitor, label: 'System Default' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-bg-secondary shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold">About RoMa Ai</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Logo + Title */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 glow-strong">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">RoMa Ai</h3>
            <p className="text-sm text-text-secondary mt-1">Smart AI Assistant v1.0</p>
            <p className="text-xs text-text-tertiary mt-1">Multi-Provider AI Chatbot</p>
          </div>

          {/* Theme Selector */}
          <section>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
              <Sun className="h-4 w-4 text-accent" />
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                    theme === t.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-bg-tertiary hover:border-border-hover'
                  )}
                >
                  <t.icon className={cn('h-5 w-5', theme === t.id ? 'text-accent' : 'text-text-secondary')} />
                  <span className={cn('text-xs', theme === t.id ? 'font-medium text-text-primary' : 'text-text-secondary')}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-text-tertiary text-center">
              {theme === 'light' ? 'Light Mode active' : theme === 'dark' ? 'Night Mode active' : 'Following system preference'}
            </p>
          </section>

          {/* How to Use — English */}
          <section className="rounded-xl border border-border bg-bg-tertiary p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Code2 className="h-4 w-4 text-accent" />
              How to Use (English)
            </h4>
            <ol className="space-y-1.5 text-xs text-text-secondary list-decimal list-inside">
              <li>Tap the <strong>Settings</strong> (gear icon) in the sidebar</li>
              <li>Select an <strong>AI Provider</strong> — we recommend <strong>Groq</strong> (free & fast)</li>
              <li>Get a free API key from the link provided in Settings</li>
              <li>Paste your API key and tap <strong>Save</strong></li>
              <li>Choose a <strong>model</strong> (e.g., Llama 3.3 70B for Groq)</li>
              <li>Close Settings and start chatting!</li>
              <li>For <strong>100% free & private</strong> use, select <strong>Ollama</strong> (runs locally)</li>
              <li>Adjust <strong>Temperature</strong> for creativity and <strong>Max Tokens</strong> for response length</li>
              <li>Swipe left on a chat to rename or delete it</li>
              <li>Tap the copy icon on any message to copy it</li>
            </ol>
          </section>

          {/* How to Use — Hindi */}
          <section className="rounded-xl border border-border bg-bg-tertiary p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Code2 className="h-4 w-4 text-accent" />
              कैसे इस्तेमाल करें (Hindi)
            </h4>
            <ol className="space-y-1.5 text-xs text-text-secondary list-decimal list-inside">
              <li>साइडबार में <strong>Settings</strong> (gear आइकन) पर टैप करें</li>
              <li>एक <strong>AI Provider</strong> चुनें — हम <strong>Groq</strong> (फ्री और तेज़) सुझाते हैं</li>
              <li>Settings में दिए गए लिंक से फ्री API key लें</li>
              <li>अपनी API key paste करें और <strong>Save</strong> दबाएं</li>
              <li>एक <strong>model</strong> चुनें (जैसे Groq के लिए Llama 3.3 70B)</li>
              <li>Settings बंद करें और चैट शुरू करें!</li>
              <li><strong>100% फ्री और प्राइवेट</strong> इस्तेमाल के लिए <strong>Ollama</strong> चुनें (लोकल चलता है)</li>
              <li>क्रिएटिविटी के लिए <strong>Temperature</strong> और रिस्पॉन्स लेंथ के लिए <strong>Max Tokens</strong> एडजस्ट करें</li>
              <li>चैट का नाम बदलने या डिलीट करने के लिए स्वाइप करें</li>
              <li>किसी भी मैसेज को कॉपी करने के लिए कॉपी आइकन पर टैप करें</li>
            </ol>
          </section>

          {/* Telegram */}
          <a
            href="https://t.me/romio_modz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-[#229ED9]/40 bg-[#229ED9]/10 p-4 transition-all hover:bg-[#229ED9]/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#229ED9]">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">Join Our Telegram Channel</p>
              <p className="text-xs text-text-secondary">@romio_modz — Get latest updates & tips</p>
            </div>
            <span className="text-xs text-[#229ED9] font-medium">Join →</span>
          </a>

          {/* Developer Credits */}
          <div className="rounded-xl border border-border bg-gradient-to-br from-accent/5 to-purple-500/5 p-4 text-center">
            <p className="text-sm font-semibold text-text-primary">Developed By The Romio Shaikh</p>
            <p className="text-xs text-text-secondary mt-1">Developer Partner: Manik Developer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
