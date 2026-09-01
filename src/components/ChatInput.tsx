'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim() || isLoading || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            'relative flex items-end gap-2 rounded-2xl border bg-bg-secondary transition-all',
            'border-border focus-within:border-accent/50 focus-within:glow',
            disabled && 'opacity-50'
          )}
        >
          <button
            className="ml-3 mb-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-secondary"
            title="Attach (coming soon)"
            disabled
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message RoMa Ai..."
            disabled={disabled}
            className="flex-1 resize-none bg-transparent py-3 text-[0.9375rem] text-text-primary placeholder:text-text-tertiary focus:outline-none"
            style={{ maxHeight: '200px' }}
          />

          <button
            className="mb-2.5 mr-2.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-secondary"
            title="Voice (coming soon)"
            disabled
          >
            <Mic className="h-4 w-4" />
          </button>

          {isLoading ? (
            <button
              onClick={onStop}
              className="mb-2 mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30"
              title="Stop"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || disabled}
              className={cn(
                'mb-2 mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all',
                text.trim() && !disabled
                  ? 'bg-gradient-to-br from-accent to-accent-dim text-white hover:scale-105 active:scale-95'
                  : 'bg-bg-tertiary text-text-tertiary'
              )}
              title="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-text-tertiary">
          RoMa Ai can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
