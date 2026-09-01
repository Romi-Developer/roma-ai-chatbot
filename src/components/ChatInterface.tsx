'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Zap, Code2, BookOpen, Wand2 } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { generateId, readStream } from '@/lib/utils';
import { getProvider } from '@/lib/providers';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const SUGGESTIONS = [
  {
    icon: Code2,
    title: 'Write Code',
    prompt: 'Write a Python function that implements binary search with detailed comments and type hints.',
  },
  {
    icon: BookOpen,
    title: 'Explain a Concept',
    prompt: 'Explain how transformer neural networks work, in simple terms with an analogy.',
  },
  {
    icon: Wand2,
    title: 'Creative Writing',
    prompt: 'Write a short story about a robot discovering emotions for the first time.',
  },
  {
    icon: Zap,
    title: 'Brainstorm Ideas',
    prompt: 'Give me 10 innovative startup ideas for solving climate change in India.',
  },
];

export default function ChatInterface() {
  const {
    conversations,
    activeId,
    settings,
    addMessage,
    updateMessage,
    createConversation,
    clearMessages,
  } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string, regenerate = false) => {
    let convId = activeId;
    if (!convId) {
      convId = createConversation();
    }

    // Add user message (unless regenerating)
    if (!regenerate) {
      addMessage(convId, {
        id: generateId(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
      });
    }

    // Add placeholder assistant message
    const assistantMsgId = generateId();
    addMessage(convId, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      pending: true,
      provider: settings.provider,
      model: settings.model,
    });

    setIsLoading(true);

    // Build messages array — read fresh state
    const conv = useChatStore.getState().conversations.find((c) => c.id === convId);
    const apiMessages = [
      { role: 'system', content: settings.systemPrompt },
      ...(conv?.messages
          .filter((m) => m.id !== assistantMsgId && !m.error)
          .map((m) => ({
            role: m.role,
            content: m.content,
          })) ?? []),
    ];

    // Get API key from localStorage
    const apiKey = typeof window !== 'undefined'
      ? localStorage.getItem(`roma-api-key-${settings.provider}`) || ''
      : '';

    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          apiKey,
          stream: settings.streaming,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      if (settings.streaming && response.body) {
        const reader = response.body.getReader();
        let fullContent = '';

        for await (const chunk of readStream(reader)) {
          if (chunk.startsWith('data: ')) {
            const data = chunk.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || parsed.text || parsed.delta || '';
              if (content) {
                fullContent += content;
                updateMessage(convId!, assistantMsgId, {
                  content: fullContent,
                  pending: true,
                });
              }
            } catch {
              if (data && data !== '[DONE]') {
                fullContent += data;
                updateMessage(convId!, assistantMsgId, {
                  content: fullContent,
                  pending: true,
                });
              }
            }
          } else if (chunk.startsWith('event:')) {
            continue;
          } else {
            try {
              const parsed = JSON.parse(chunk);
              const content = parsed.content || parsed.text || parsed.delta || parsed.message?.content || '';
              if (content) {
                fullContent += content;
                updateMessage(convId!, assistantMsgId, {
                  content: fullContent,
                  pending: true,
                });
              }
            } catch {
              // ignore non-JSON
            }
          }
        }

        updateMessage(convId!, assistantMsgId, {
          content: fullContent || '(No response received)',
          pending: false,
        });
      } else {
        const data = await response.json();
        const content = data.content || data.text || data.message?.content || '';
        updateMessage(convId!, assistantMsgId, {
          content: content || '(No response received)',
          pending: false,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateMessage(convId!, assistantMsgId, {
          content: '(Response stopped by user)',
          pending: false,
        });
      } else {
        updateMessage(convId!, assistantMsgId, {
          content: `Error: ${err.message}`,
          pending: false,
          error: true,
        });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
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
          c.id === activeId
            ? { ...c, messages: c.messages.filter((m) => m.id !== lastAssistant.id) }
            : c
        ),
      }));
    }

    sendMessage(lastUser.content, true);
  };

  const handleSuggestion = (prompt: string) => {
    sendMessage(prompt);
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
        {messages.length > 0 && (
          <button
            onClick={() => activeId && clearMessages(activeId)}
            className="text-xs text-text-tertiary transition-colors hover:text-red-400"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {showWelcome ? (
          <WelcomeScreen onSuggestion={handleSuggestion} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={handleStop}
        isLoading={isLoading}
      />
    </div>
  );
}

// ── Welcome screen ─────────────────────────────────────────────────
function WelcomeScreen({ onSuggestion }: { onSuggestion: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 glow-strong">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h1 className="mb-2 text-3xl font-bold gradient-text">RoMa Ai</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Your premium AI assistant — powered by multiple providers
      </p>

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
