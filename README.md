# 🌟 RoMa Ai — Premium Multi-Provider Chatbot

A professional, feature-rich AI chatbot built with Next.js 14, TypeScript, and Tailwind CSS. Supports multiple AI providers with a beautiful dark UI, streaming responses, markdown rendering, and syntax-highlighted code blocks.

![RoMa Ai](public/favicon.svg)

## ✨ Features

- **Multi-Provider Support** — OpenAI, Anthropic (Claude), Groq, Ollama (local), and OpenRouter
- **Streaming Responses** — Real-time token-by-token streaming (SSE)
- **Premium Dark UI** — Smooth animations, glassmorphism, gradient accents
- **Markdown Rendering** — Full GFM support with tables, lists, blockquotes
- **Code Syntax Highlighting** — Custom lightweight highlighter for 10+ languages
- **Conversation Management** — Create, rename, delete, and persist chats (localStorage)
- **Adjustable Settings** — Temperature, max tokens, system prompt, model selection
- **Responsive Design** — Works on desktop, tablet, and mobile
- **API Key Security** — Keys stored locally in browser, never sent to third parties
- **No Rate Limits** — You control your own API keys and usage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommend 20+)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/roma-ai-chatbot.git
cd roma-ai-chatbot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env (at least one)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GROQ_API_KEY=gsk_...

# Start development server
npm run dev
```

Visit **http://localhost:3000** — you're ready to chat!

### Production Build

```bash
npm run build
npm start
```

## 🔑 API Key Setup

You need at least **one** API key. Pick the provider that works best for you:

| Provider | Free Tier | Get API Key |
|----------|-----------|-------------|
| **Groq** | ✅ Yes | [console.groq.com/keys](https://console.groq.com/keys) |
| **Ollama** | ✅ Yes (local) | [ollama.com](https://ollama.com) |
| **OpenAI** | ❌ Paid | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Anthropic** | ❌ Paid | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| **OpenRouter** | Some free | [openrouter.ai/keys](https://openrouter.ai/keys) |

### Two ways to provide API keys:

1. **Environment variables** (server-side): Set in `.env` file
2. **In-app Settings** (client-side): Open Settings panel → enter key → Save

Keys entered in Settings are stored in browser localStorage and take priority over env vars.

### Using Ollama (100% Free, Local)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start the server
ollama serve

# Pull a model (in another terminal)
ollama pull llama3.2

# Now select "Ollama" in RoMa Ai settings and start chatting!
```

## 🏗️ Project Structure

```
roma-ai-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts       # Multi-provider chat API (streaming)
│   │   ├── globals.css           # Premium dark theme styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main page
│   ├── components/
│   │   ├── ChatInterface.tsx     # Main chat orchestrator
│   │   ├── ChatInput.tsx         # Auto-expanding input with send/stop
│   │   ├── MessageBubble.tsx     # Message rendering with markdown
│   │   ├── CodeBlock.tsx         # Syntax-highlighted code blocks
│   │   ├── Sidebar.tsx           # Conversation list & navigation
│   │   └── SettingsPanel.tsx     # Provider/model/API key settings
│   ├── lib/
│   │   ├── providers.ts          # Provider configs & model lists
│   │   └── utils.ts              # Utilities (cn, stream reader, etc.)
│   ├── stores/
│   │   └── chatStore.ts          # Zustand store with persistence
│   └── types/
│       └── index.ts              # TypeScript types
├── public/
│   └── favicon.svg               # RoMa Ai logo
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── README.md
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js` → `theme.extend.colors`:
```js
accent: {
  DEFAULT: '#6366f1',  // Change to your brand color
  hover: '#7c7ff5',
  dim: '#4f46e5',
}
```

### Add a New Provider

1. Add provider config in `src/lib/providers.ts`
2. Add a handler in `src/app/api/chat/route.ts`
3. Add the provider type in `src/types/index.ts`

### Change Default Model

Edit `src/stores/chatStore.ts` → `defaultSettings`:
```ts
const defaultSettings: Settings = {
  provider: 'groq',           // Change default provider
  model: 'llama-3.3-70b-versatile',  // Change default model
  ...
};
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import repo
3. Add environment variables (API keys)
4. Deploy — done!

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t roma-ai .
docker run -p 3000:3000 --env-file .env roma-ai
```

### Other Platforms

Works on any platform that supports Next.js 14:
- Netlify, Railway, Render, DigitalOcean App Platform, AWS Amplify, Cloudflare Pages

## 🔒 Privacy & Security

- API keys are stored in **your browser's localStorage** — they never touch our server
- When using Ollama, **everything runs locally** — zero data leaves your machine
- When using cloud providers, requests go **directly from your browser to the provider's API**
- No analytics, no tracking, no data collection

## 📝 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State Management**: Zustand (with persistence)
- **Markdown**: react-markdown + remark-gfm
- **Icons**: lucide-react
- **Code Highlighting**: Custom lightweight regex-based highlighter

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License — free to use, modify, and distribute.

## 💡 Tips

- **Cheapest option**: Groq free tier + Llama 3.3 70B (fast + capable)
- **Most private**: Ollama with Llama 3.2 (runs on your machine)
- **Most capable**: OpenAI GPT-4o or Anthropic Claude 3.5 Sonnet
- **Best value**: OpenRouter (access 100+ models, some free)

---

Built with ❤️ using Next.js, Tailwind CSS, and TypeScript.
