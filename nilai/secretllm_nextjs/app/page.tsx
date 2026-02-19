'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './lib/types/api';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isThemeReady, setIsThemeReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('secretllm-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme =
      savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : prefersDark
          ? 'dark'
          : 'light';

    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;
    window.localStorage.setItem('secretllm-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, isThemeReady]);

  const hasMessages = messages.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const raw = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        if (raw.startsWith('<!DOCTYPE')) {
          throw new Error(
            'Server returned an HTML error page. Check the Next.js terminal logs and restart the dev server.'
          );
        }
        throw new Error(`Server returned non-JSON response: ${raw.slice(0, 160)}`);
      }

      const content =
        typeof data.response === 'string'
          ? data.response
          : (data as { choices?: Array<{ message?: { content?: string } }> })
              .choices?.[0]?.message?.content;

      if (!res.ok) {
        const errorMessage =
          (typeof data.error === 'string' ? data.error : undefined) ??
          `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }

      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('No valid response content received from API');
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${
          error instanceof Error ? error.message : 'Unexpected error'
        }`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--page-fg)] transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.12),transparent_72%)] dark:bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.14),transparent_72%)]" />
      </div>

      <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--toggle-border)] bg-[var(--toggle-bg)] px-5 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted-fg)] transition hover:border-[var(--page-fg)] hover:opacity-90"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {isThemeReady && theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
              >
                <path d="M21 13.1A8.6 8.6 0 1110.9 3a7.2 7.2 0 0010.1 10.1z" />
              </svg>
            )}
          </button>
        </div>

        {!hasMessages && !loading && (
          <section className="animate-fade-up flex flex-1 items-center justify-center pb-14 text-center sm:pb-20">
            <div>
              <h1 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] lowercase leading-[0.9] tracking-[-0.055em]">
                secretllm chat
              </h1>
              <p className="mt-4 text-[11px] uppercase tracking-[0.5em] text-[var(--muted-fg)] sm:text-sm">
                Private LLM Inference.
              </p>
            </div>
          </section>
        )}

        <section
          className={`flex items-end justify-center pb-2 ${hasMessages || loading ? 'flex-1' : ''
            }`}
        >
          <div
            className={`flex w-full max-w-3xl flex-col ${hasMessages || loading ? 'h-full' : ''
              }`}
          >
            <div
              className={`px-1 sm:px-2 ${hasMessages || loading
                  ? 'flex-1 overflow-y-auto pb-6 pt-8'
                  : 'pb-4 pt-0'
                }`}
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-relaxed sm:text-[15px] ${message.role === 'user'
                        ? 'border-black/10 bg-black text-white dark:border-white/20 dark:bg-white dark:text-black'
                        : 'border-black/15 bg-white/85 text-black shadow-sm backdrop-blur dark:border-slate-400/30 dark:bg-slate-900/75 dark:text-slate-100'
                        }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center rounded-2xl border border-black/15 bg-white/85 px-4 py-3 text-sm text-black shadow-sm dark:border-slate-400/30 dark:bg-slate-900/75 dark:text-slate-100">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="mb-1 flex items-center gap-2 rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.55)] backdrop-blur-sm"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your message here..."
                className="h-12 flex-1 rounded-xl bg-transparent px-4 text-sm text-[var(--page-fg)] placeholder:text-[var(--muted-fg)] focus:outline-none sm:text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black text-xl text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
                aria-label="Send message"
              >
                {loading ? (
                  '…'
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 12h14M13 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
