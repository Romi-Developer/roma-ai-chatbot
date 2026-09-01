'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, X, FileText, Image as ImageIcon, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content?: string; // text content for txt files
}

interface ChatInputProps {
  onSend: (text: string, files?: AttachedFile[]) => void;
  onStop?: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if ((!text.trim() && files.length === 0) || isLoading || disabled) return;
    onSend(text.trim(), files.length > 0 ? files : undefined);
    setText('');
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      const attached: AttachedFile = {
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
      };

      // Read text files
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.xml') || file.name.endsWith('.html') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py') || file.name.endsWith('.java') || file.name.endsWith('.c') || file.name.endsWith('.cpp')) {
        try {
          attached.content = await file.text();
        } catch {
          // ignore
        }
      }

      newFiles.push(attached);
    }

    setFiles([...files, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1048576).toFixed(1)}MB`;
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.gz') || name.endsWith('.rar')) return Archive;
    return FileText;
  };

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl">
        {/* Attached files preview */}
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((f, i) => {
              const Icon = getFileIcon(f.type, f.name);
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-bg-tertiary px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  <span className="max-w-[120px] truncate text-xs text-text-secondary">{f.name}</span>
                  <span className="text-[10px] text-text-tertiary">{formatSize(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="text-text-tertiary hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border bg-bg-secondary px-3 py-2 transition-all',
            'border-border focus-within:border-accent/50 focus-within:glow',
            disabled && 'opacity-50'
          )}
        >
          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.xml,.html,.js,.ts,.tsx,.py,.java,.c,.cpp,.css,.pdf,.zip,.tar,.gz,.rar,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-accent active:scale-95"
            title="Attach files (txt, pdf, images, zip)"
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
            className="flex-1 resize-none bg-transparent py-1.5 text-[0.9375rem] leading-relaxed text-text-primary placeholder:text-text-tertiary focus:outline-none"
            style={{ maxHeight: '160px' }}
          />

          {isLoading ? (
            <button
              onClick={onStop}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400 transition-all hover:bg-red-500/30 active:scale-95"
              title="Stop"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={(!text.trim() && files.length === 0) || disabled}
              className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95',
                (text.trim() || files.length > 0) && !disabled
                  ? 'bg-gradient-to-br from-accent to-accent-dim text-white hover:opacity-90'
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

export type { AttachedFile };
