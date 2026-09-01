import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoMa Ai — Smart AI Assistant',
  description: 'RoMa Ai — A professional multi-provider AI chatbot by Romio Shaikh',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <style>{`
          /* Dark theme (Night Mode) — default */
          .dark {
            --bg-primary: #0a0a0b;
            --bg-secondary: #131316;
            --bg-tertiary: #1a1a1f;
            --bg-hover: #222228;
            --text-primary: #ededed;
            --text-secondary: #9b9ba3;
            --text-tertiary: #6b6b73;
            --border-color: #2a2a32;
            --border-hover: #3a3a44;
          }
          /* Light theme */
          .light {
            --bg-primary: #f8f9fa;
            --bg-secondary: #ffffff;
            --bg-tertiary: #f3f4f6;
            --bg-hover: #e5e7eb;
            --text-primary: #1a1a1a;
            --text-secondary: #4b5563;
            --text-tertiary: #9ca3af;
            --border-color: #e5e7eb;
            --border-hover: #d1d5db;
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var saved = JSON.parse(localStorage.getItem('roma-theme') || '{}');
            var theme = saved.state?.theme || 'system';
            var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', isDark);
            document.documentElement.classList.toggle('light', !isDark);
          } catch(e) {}
        `}} />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
