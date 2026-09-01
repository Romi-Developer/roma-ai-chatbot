'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Zap, Code2, BookOpen, Wand2, Info } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { generateId } from '@/lib/utils';
import { getProvider } from '@/lib/providers';
import { streamChat } from '@/lib/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const SUGGESTIONS = [
  { icon: Code2, title: 'Write Code', prompt: 'Write a Python function that implements binary search with detailed comments and type hints.' },
  { icon: BookOpen, title: 'Explain a Concept', prompt: 'Explain how transformer neural networks work, in simple terms with an analogy.' },
  { icon: Wand2, title: 'Creative Writing', prompt: 'Write a short story about a robot discovering emotions for the first time.' },
  { icon: Zap, title: 'Brainstorm Ideas', prompt: 'Give me 10 innovative startup ideas for solving climate change in India.' },
];

interface ChatInterfaceProps {
  onOpenAbout: () => void;
}

export default function ChatInterface({ onOpenAbout }: ChatInterfaceProps) {
  const {
    conversations, activeId, settings,
    addMessage, updateMessage, createConversation, clearMessages,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string, regenerate = false) => {
    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    if (!regenerate) {
      addMessage(convId, {
        id: generateId(), role: 'user', content: text, createdAt: Date.now(),
      });
    }

    const assistantMsgId = generateId();
    addMessage(convId, {
      id: assistantMsgId, role: 'assistant', content: '', createdAt: Date.now(),
      pending: true, provider: settings.provider, model: settings.model,
    });

    setIsLoading(true);

    // Build messages — read fresh state
    const conv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const apiMessages = [
      { role: 'system' as const, content: settings.systemPrompt },
      ...(conv?.messages
          .filter((m) => m.id !== assistantMsgId && !m.error && m.content.trim())
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })) ?? []),
    ];

    abortRef.current = new AbortController();
    let fullContent = '';

    await streamChat(
      settings.provider,
      settings.model,
      apiMessages,
      settings.temperature,
      settings.maxTokens,
      {
        onChunk: (chunk) => {
          fullContent += chunk;
          updateMessage(convId!, assistantMsgId, { content: fullContent, pending: true });
        },
        onDone: () => {
          updateMessage(convId!, assistantMsgId, {
            content: fullContent || '(No response received)',
            pending: false,
          });
          setIsLoading(false);
        },
        onError: (error) => {
          updateMessage(convId!, assistantMsgId, {
            content: `Error: ${error}`,
            pending: false,
            error: true,
          });
          setIsLoading(false);
        },
      },
      abortRef.current.signal
    );

    abortRef.current = null;
  }, [activeId, settings, addMessage, updateMessage, createConversation]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleRegenerate = () => {
    if (!activeConversation || messages.length < 2) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant) {
      useChatStore.setState((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === activeId ? { ...c, messages: c.messages.filter((m) => m.id !== lastAssistant.id) } : c
        ),
      }));
    }
    sendMessage(lastUser.content, true);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-bg-tertiary px-2 py-1 text-xs font-medium text-text-secondary">
            {getProvider(settings.provider).name}
          </span>
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">{settings.model}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onOpenAbout} className="text-xs text-text-tertiary transition-colors hover:text-accent flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            About
          </button>
          {messages.length > 0 && (
            <button onClick={() => activeId && clearMessages(activeId)} className="text-xs text-text-tertiary transition-colors hover:text-red-400">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={(p) => sendMessage(p)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} onRegenerate={handleRegenerate} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} onStop={handleStop} isLoading={isLoading} />
    </div>
  );
}

function WelcomeScreen({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 glow-strong">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-3xl font-bold gradient-text">RoMa Ai</h1>
      <p className="mb-8 text-sm text-text-secondary">Your premium AI assistant — powered by multiple providers</p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.prompt)}
            className="group flex flex-col items-start rounded-xl border border-border bg-bg-secondary p-4 text-left transition-all hover:border-accent/40 hover:bg-bg-tertiary animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-bg-tertiary text-accent transition-colors group-hover:bg-accent/10">
              <s.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-text-primary">{s.title}</span>
            <span className="mt-1 text-xs text-text-tertiary line-clamp-2">{s.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
