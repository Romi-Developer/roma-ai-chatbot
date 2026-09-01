import { NextRequest, NextResponse } from 'next/server';
import { Provider } from '@/types';

// Returns available models for a given provider
export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider') as Provider;

  if (!provider) {
    return NextResponse.json({ error: 'Provider parameter required' }, { status: 400 });
  }

  const providerUrls: Record<string, string> = {
    ollama: 'http://localhost:11434/api/tags',
  };

  if (provider === 'ollama') {
    try {
      const response = await fetch(providerUrls.ollama);
      if (!response.ok) {
        return NextResponse.json({ error: 'Ollama not running' }, { status: 502 });
      }
      const data = await response.json();
      const models = (data.models || []).map((m: any) => ({
        id: m.name,
        name: m.name,
        provider: 'ollama',
        size: m.size,
      }));
      return NextResponse.json({ models });
    } catch {
      return NextResponse.json({ error: 'Cannot connect to Ollama' }, { status: 502 });
    }
  }

  // For other providers, models are hardcoded in providers.ts
  return NextResponse.json({ error: 'Use hardcoded model list' }, { status: 200 });
}
