'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './lib/types/api';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full py-10">
        <div className="sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto py-6">
            <h1 className="text-3xl font-bold text-center dark:text-white">
              Chat with the Blind Computer 💻
            </h1>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-2 border-gray-600 dark:border-gray-600 rounded-xl">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`
                  max-w-[80%] rounded-lg px-4 py-2
                  ${
                    message.role === 'user'
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'
                  }
                `}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-black dark:text-white flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <div className="p-4">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border 
                dark:bg-gray-800 dark:border-gray-700 
                focus:outline-none focus:ring-2 focus:ring-gray-500 
                dark:text-white"
              placeholder="What would you like to know?"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black 
                rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
