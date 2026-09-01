'use client';

import { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, Settings as SettingsIcon,
  PanelLeftClose, PanelLeft, Pencil, Check, X, Sparkles, Info, Send,
} from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn, formatTime, truncate } from '@/lib/utils';

interface SidebarProps {
  onOpenAbout: () => void;
}

export default function Sidebar({ onOpenAbout }: SidebarProps) {
  const {
    conversations, activeId, sidebarOpen, settingsOpen,
    createConversation, deleteConversation, setActiveConversation,
    renameConversation, toggleSidebar, toggleSettings, settings,
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartRename = (id: string, title: string) => {
    setEditingId(id);
    setEditValue(title);
  };

  const handleConfirmRename = () => {
    if (editingId && editValue.trim()) {
      renameConversation(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-bg-secondary transition-all duration-300',
          sidebarOpen ? 'w-72' : 'w-0'
        )}
        style={{ overflow: sidebarOpen ? 'visible' : 'hidden' }}
      >
        {sidebarOpen && (
          <div className="flex h-full w-72 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold">RoMa Ai</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* New chat */}
            <div className="px-3 pb-2">
              <button
                onClick={createConversation}
                className="flex w-full items-center gap-2 rounded-xl border border-border bg-bg-tertiary px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-accent/50 hover:bg-bg-hover"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {conversations.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-text-tertiary" />
                  <p className="text-sm text-text-tertiary">No conversations yet</p>
                  <p className="text-xs text-text-tertiary">Start a new chat to begin</p>
                </div>
              )}
              <div className="space-y-0.5">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-lg px-3 py-2 transition-all',
                      activeId === conv.id ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'
                    )}
                  >
                    {editingId === conv.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 rounded border border-accent bg-bg-primary px-2 py-1 text-xs text-text-primary focus:outline-none"
                        />
                        <button onClick={handleConfirmRename} className="text-green-400 hover:text-green-300">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => setActiveConversation(conv.id)} className="flex flex-1 items-center gap-2 overflow-hidden">
                          <MessageSquare className={cn('h-4 w-4 flex-shrink-0', activeId === conv.id ? 'text-accent' : 'text-text-tertiary')} />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className={cn('truncate text-sm', activeId === conv.id ? 'font-medium text-text-primary' : 'text-text-secondary')}>
                              {truncate(conv.title, 28)}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {conv.messages.length > 0 ? `${conv.messages.length} msgs · ${formatTime(conv.updatedAt)}` : formatTime(conv.createdAt)}
                            </span>
                          </div>
                        </button>
                        <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); handleStartRename(conv.id, conv.title); }} className="rounded p-1 text-text-tertiary hover:text-text-primary">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="rounded p-1 text-text-tertiary hover:text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 space-y-1">
              {/* About */}
              <button
                onClick={onOpenAbout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary"
              >
                <Info className="h-4 w-4" />
                About
              </button>

              {/* Telegram */}
              <a
                href="https://t.me/romio_modz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary"
              >
                <Send className="h-4 w-4 text-[#229ED9]" />
                Join Our Telegram
              </a>

              {/* Settings */}
              <button
                onClick={toggleSettings}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  settingsOpen ? 'bg-bg-tertiary text-text-primary' : 'text-text-secondary hover:bg-bg-tertiary'
                )}
              >
                <SettingsIcon className="h-4 w-4" />
                Settings
                <span className="ml-auto text-xs text-text-tertiary">{settings.provider}</span>
              </button>

              {/* Developer credits */}
              <div className="px-3 py-2 text-center">
                <p className="text-[10px] font-medium text-text-tertiary">Developed By The Romio Shaikh</p>
                <p className="text-[9px] text-text-tertiary">Developer Partner: Manik Developer</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-secondary text-text-secondary transition-all hover:bg-bg-tertiary"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
