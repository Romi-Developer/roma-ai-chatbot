'use client';

import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import { useChatStore } from '@/stores/chatStore';

export default function Home() {
  const { sidebarOpen, createConversation, conversations } = useChatStore();

  // Auto-create first conversation on mount
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-72' : 'ml-0'
        }`}
      >
        <ChatInterface />
      </main>
      <SettingsPanel />
    </div>
  );
}
