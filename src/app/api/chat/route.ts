import { NextRequest, NextResponse } from 'next/server';
import { Provider } from '@/types';

// Mark as dynamic — API routes can't be statically exported
export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  provider: Provider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  stream?: boolean;
}

// ── Provider base URLs ────────────────────────────────────────────
const PROVIDER_URLS: Record<Provider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  ollama: 'http://localhost:11434/api/chat',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const ENV_KEYS: Record<Provider, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  groq: 'GROQ_API_KEY',
  ollama: '',
  openrouter: 'OPENROUTER_API_KEY',
};

// ── SSE Helper ─────────────────────────────────────────────────────
function sseChunk(content: string): string {
  return `data: ${JSON.stringify({ content })}\n\n`;
}

function sseDone(): string {
  return 'data: [DONE]\n\n';
}

// ── Provider handlers ─────────────────────────────────────────────

// OpenAI-compatible (OpenAI, Groq, OpenRouter)
async function handleOpenAICompatible(
  url: string,
  apiKey: string,
  body: ChatRequestBody,
  stream: boolean
) {
  const payload: any = {
    model: body.model,
    messages: body.messages,
    temperature: body.temperature,
    max_tokens: body.maxTokens,
    stream,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  // OpenRouter extra headers
  if (body.provider === 'openrouter') {
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'RoMa Ai Chatbot';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${body.provider} API error (${response.status}): ${err}`);
  }

  if (!stream || !response.body) {
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ content, raw: data });
  }

  // Stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode(sseDone()));
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                controller.enqueue(encoder.encode(sseChunk(delta)));
              }
            } catch {
              // skip
            }
          }
        }
        controller.enqueue(encoder.encode(sseDone()));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Anthropic
async function handleAnthropic(
  apiKey: string,
  body: ChatRequestBody,
  stream: boolean
) {
  // Anthropic takes system separately
  const systemMsg = body.messages.find((m) => m.role === 'system');
  const chatMessages = body.messages.filter((m) => m.role !== 'system');

  const payload: any = {
    model: body.model,
    messages: chatMessages,
    max_tokens: body.maxTokens,
    stream,
  };

  if (systemMsg) {
    payload.system = systemMsg.content;
  }

  // Anthropic uses temperature 0-1 range
  payload.temperature = Math.min(body.temperature, 1);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  const response = await fetch(PROVIDER_URLS.anthropic, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${err}`);
  }

  if (!stream || !response.body) {
    const data = await response.json();
    const content = data.content?.map((c: any) => c.text).join('') || '';
    return NextResponse.json({ content, raw: data });
  }

  // Stream — Anthropic uses SSE with event types
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta') {
                const delta = parsed.delta?.text || '';
                if (delta) {
                  controller.enqueue(encoder.encode(sseChunk(delta)));
                }
              } else if (parsed.type === 'message_stop') {
                controller.enqueue(encoder.encode(sseDone()));
                controller.close();
                return;
              }
            } catch {
              // skip
            }
          }
        }
        controller.enqueue(encoder.encode(sseDone()));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Ollama
async function handleOllama(body: ChatRequestBody, stream: boolean) {
  const payload = {
    model: body.model,
    messages: body.messages,
    stream,
    options: {
      temperature: body.temperature,
      num_predict: body.maxTokens,
    },
  };

  const response = await fetch(PROVIDER_URLS.ollama, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama error (${response.status}): ${err}. Make sure Ollama is running (ollama serve) and the model is pulled (ollama pull ${body.model}).`);
  }

  if (!stream || !response.body) {
    const data = await response.json();
    const content = data.message?.content || '';
    return NextResponse.json({ content, raw: data });
  }

  // Ollama streams JSON lines (not SSE)
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const parsed = JSON.parse(trimmed);
              const content = parsed.message?.content || '';
              if (content) {
                controller.enqueue(encoder.encode(sseChunk(content)));
              }
              if (parsed.done) {
                controller.enqueue(encoder.encode(sseDone()));
                controller.close();
                return;
              }
            } catch {
              // skip
            }
          }
        }
        controller.enqueue(encoder.encode(sseDone()));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ── Main route handler ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { provider, model, messages, temperature, maxTokens, apiKey: clientKey, stream = true } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    // Resolve API key — client-provided takes priority, then env
    const envKey = ENV_KEYS[provider] ? process.env[ENV_KEYS[provider]] || '' : '';
    const apiKey = clientKey || envKey;

    // Check if key is required
    if (provider !== 'ollama' && !apiKey) {
      const providerNames: Record<string, string> = {
        openai: 'OpenAI',
        anthropic: 'Anthropic',
        groq: 'Groq',
        openrouter: 'OpenRouter',
      };
      return NextResponse.json(
        {
          error: `No API key for ${providerNames[provider]}. Add your key in Settings or set ${ENV_KEYS[provider]} in .env file.`,
        },
        { status: 401 }
      );
    }

    switch (provider) {
      case 'openai':
      case 'groq':
      case 'openrouter':
        return await handleOpenAICompatible(
          PROVIDER_URLS[provider],
          apiKey,
          body,
          stream
        );

      case 'anthropic':
        return await handleAnthropic(apiKey, body, stream);

      case 'ollama':
        return await handleOllama(body, stream);

      default:
        return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
