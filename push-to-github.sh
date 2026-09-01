#!/bin/bash
# ── RoMa Ai Chatbot — GitHub Push Script ───────────────────────────
# Run this after unzipping the project to push it to your GitHub repo.
#
# Usage:
#   1. Create a new repo on GitHub (don't initialize with README)
#   2. Unzip roma-ai-chatbot.zip
#   3. cd into the folder
#   4. Run: bash push-to-github.sh
#   5. Enter your GitHub repo URL when prompted

set -e

echo "🌟 RoMa Ai Chatbot — GitHub Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Install it first: https://git-scm.com/downloads"
    exit 1
fi

# Ask for repo URL
read -p "Enter your GitHub repo URL (e.g. https://github.com/username/roma-ai-chatbot.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo ""
echo "📦 Initializing git repository..."

git init
git add -A
git commit -m "feat: RoMa Ai Chatbot — multi-provider premium chatbot

- Next.js 14 + TypeScript + Tailwind CSS
- Multi-provider: OpenAI, Anthropic, Groq, Ollama, OpenRouter
- Streaming responses (SSE)
- Premium dark UI with animations
- Markdown rendering + code syntax highlighting
- Conversation management with localStorage persistence
- Adjustable settings (temperature, max tokens, system prompt)"

git branch -M main
git remote add origin "$REPO_URL"

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your chatbot is now on GitHub."
echo ""
echo "Next steps:"
echo "  npm install"
echo "  cp .env.example .env  # Add your API keys"
echo "  npm run dev"
echo ""
echo "  Visit http://localhost:3000"
