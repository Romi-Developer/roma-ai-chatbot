import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Message, Settings, Provider } from '@/types';
import { generateId } from '@/lib/utils';
import { getDefaultModel } from '@/lib/providers';

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  settings: Settings;
  sidebarOpen: boolean;
  settingsOpen: boolean;

  // Actions
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  addMessage: (convId: string, message: Message) => void;
  updateMessage: (convId: string, msgId: string, updates: Partial<Message>) => void;
  clearMessages: (convId: string) => void;
  setSettings: (updates: Partial<Settings>) => void;
  setProvider: (provider: Provider) => void;
  toggleSidebar: () => void;
  toggleSettings: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  getActiveConversation: () => Conversation | null;
}

const defaultSettings: Settings = {
  provider: 'groq',
  model: getDefaultModel('groq'),
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: 'You are RoMa Ai, a helpful, knowledgeable AI assistant. You provide clear, accurate, and well-structured responses. You use markdown formatting when appropriate.',
  streaming: true,
};

function createNewConversation(settings: Settings): Conversation {
  return {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model: settings.model,
    provider: settings.provider,
    systemPrompt: settings.systemPrompt,
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      settings: defaultSettings,
      sidebarOpen: true,
      settingsOpen: false,

      createConversation: () => {
        const conv = createNewConversation(get().settings);
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeId: conv.id,
        }));
        return conv.id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          const newActive = state.activeId === id
            ? filtered[0]?.id ?? null
            : state.activeId;
          return { conversations: filtered, activeId: newActive };
        });
        // Auto-create if empty
        if (get().conversations.length === 0) {
          get().createConversation();
        }
      },

      setActiveConversation: (id) => set({ activeId: id }),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        })),

      addMessage: (convId, message) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now(),
                  title: c.messages.length === 0 && message.role === 'user'
                    ? message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        })),

      updateMessage: (convId, msgId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, ...updates } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        })),

      clearMessages: (convId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === convId ? { ...c, messages: [], title: 'New Chat', updatedAt: Date.now() } : c
          ),
        })),

      setSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      setProvider: (provider) =>
        set((state) => ({
          settings: {
            ...state.settings,
            provider,
            model: getDefaultModel(provider),
          },
        })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      getActiveConversation: () => {
        const { conversations, activeId } = get();
        return conversations.find((c) => c.id === activeId) ?? null;
      },
    }),
    {
      name: 'roma-ai-chat',
      // Only persist conversations and settings
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);
