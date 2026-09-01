'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Zap, Code2, BookOpen, Wand2, Info, ChevronDown, Menu, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { generateId } from '@/lib/utils';
import { getProvider } from '@/lib/providers';
import { streamChat } from '@/lib/api';
import type { AttachedFile } from './ChatInput';
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
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string, files?: AttachedFile[], regenerate = false) => {
    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    // Build user message content (include file content if any)
    let userContent = text;
    if (files && files.length > 0) {
      const fileDescriptions = files.map(f => {
        if (f.content) {
          return `\n\n[File: ${f.name}]\n${f.content}`;
        }
        return `\n\n[Attached file: ${f.name} (${f.type}, ${f.size} bytes)]`;
      });
      userContent += fileDescriptions.join('');
    }

    if (!regenerate) {
      addMessage(convId, {
        id: generateId(), role: 'user', content: userContent, createdAt: Date.now(),
      });
    }

    const assistantMsgId = generateId();
    addMessage(convId, {
      id: assistantMsgId, role: 'assistant', content: '', createdAt: Date.now(),
      pending: true, provider: settings.provider, model: settings.model,
    });

    setIsLoading(true);

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
    sendMessage(lastUser.content, undefined, true);
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
        <div className="flex items-center gap-2">
          {/* Suggestion menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <Menu className="h-3.5 w-3.5" />
              Options
              <ChevronDown className={`h-3 w-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-bg-secondary shadow-xl animate-slide-up">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wide">Quick Actions</div>
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          sendMessage(s.prompt);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-bg-tertiary"
                      >
                        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                          <s.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-primary">{s.title}</span>
                          <span className="text-xs text-text-tertiary line-clamp-2">{s.prompt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          {/* About button */}
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <Info className="h-3.5 w-3.5" />
            About
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => activeId && clearMessages(activeId)}
              className="rounded-lg border border-border bg-bg-tertiary px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-red-400 hover:bg-bg-hover"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {showWelcome ? (
          <WelcomeScreen />
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

function WelcomeScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 glow-strong">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-3xl font-bold gradient-text">RoMa Ai</h1>
      <p className="mb-2 text-sm text-text-secondary">Your premium AI assistant — powered by multiple providers</p>
      <p className="text-xs text-text-tertiary">Tap "Options" in the top right for quick actions, or start typing below.</p>
    </div>
  );
}
