import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoMa Ai — Premium Chat Assistant',
  description: 'A premium AI chatbot supporting multiple providers — OpenAI, Anthropic, Groq, Ollama & more',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
