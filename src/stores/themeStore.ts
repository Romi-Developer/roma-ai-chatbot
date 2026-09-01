import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'dark',

      setTheme: (theme) => {
        const isDark =
          theme === 'dark' ||
          (theme === 'system' &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        const resolved = isDark ? 'dark' : 'light';

        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
          document.documentElement.classList.toggle('light', !isDark);
        }

        set({ theme, resolvedTheme: resolved });
      },

      initTheme: () => {
        const { theme, setTheme } = get();
        setTheme(theme);

        if (theme === 'system' && typeof window !== 'undefined') {
          const mq = window.matchMedia('(prefers-color-scheme: dark)');
          mq.addEventListener('change', () => get().setTheme('system'));
        }
      },
    }),
    { name: 'roma-theme' }
  )
);
