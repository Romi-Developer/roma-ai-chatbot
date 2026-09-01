'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import CodeBlock from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isLast: boolean;
}

export default function MessageBubble({ message, onRegenerate, isLast }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('group w-full animate-fade-in', isUser ? 'flex justify-end' : 'flex justify-start')}>
      <div className={cn('flex max-w-[85%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-700'
              : message.error
                ? 'bg-gradient-to-br from-red-500 to-red-700'
                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
          )}
        >
          {isUser ? <User className="h-4 w-4 text-white" /> :
           message.error ? <AlertCircle className="h-4 w-4 text-white" /> :
           <Bot className="h-4 w-4 text-white" />}
        </div>

        {/* Content */}
        <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-gradient-to-br from-accent to-accent-dim text-white'
                : message.error
                  ? 'border border-red-500/30 bg-red-500/10 text-red-200'
                  : 'glass border border-border text-text-primary'
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{message.content}</p>
            ) : message.pending && !message.content ? (
              <div className="flex items-center gap-1 py-1">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const content = String(children).replace(/\n$/, '');
                      if (match) {
                        return <CodeBlock language={match[1]} value={content} />;
                      }
                      return <code className={className} {...props}>{children}</code>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.pending && (
                  <span className="ml-0.5 inline-block h-4 w-2 animate-blink bg-accent align-middle" />
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!message.pending && !message.error && (
            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary">
                {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
              </button>
              {!isUser && onRegenerate && isLast && (
                <button onClick={onRegenerate} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary">
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}
              {!isUser && message.model && (
                <span className="text-xs text-text-tertiary">{message.model}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
