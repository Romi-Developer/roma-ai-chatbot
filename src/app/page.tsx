'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import AboutModal from '@/components/AboutModal';
import { useChatStore } from '@/stores/chatStore';
import { useThemeStore } from '@/stores/themeStore';

export default function Home() {
  const { sidebarOpen, createConversation, conversations } = useChatStore();
  const { initTheme } = useThemeStore();
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    initTheme();
    if (conversations.length === 0) {
      createConversation();
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar onOpenAbout={() => setAboutOpen(true)} />
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
        <ChatInterface onOpenAbout={() => setAboutOpen(true)} />
      </main>
      <SettingsPanel />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
