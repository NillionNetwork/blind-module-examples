'use client';

import { useState } from 'react';

interface ChatComponentProps {
  title: string;
  endpoint: string;
  description: string;
}

function ChatComponent({ title, endpoint, description }: ChatComponentProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 p-6 border border-gray-200 rounded-lg'>
      <h2 className='text-2xl font-bold mb-2'>{title}</h2>
      <p className='text-gray-600 mb-6 text-sm'>{description}</p>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask me anything...'
            className='w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black'
            disabled={loading}
          />
        </div>

        <button
          type='submit'
          disabled={loading || !message.trim()}
          className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
        >
          {loading ? 'Thinking...' : 'Send Message'}
        </button>
      </form>

      {response && (
        <div className='mt-6 p-4 bg-gray-100 rounded-lg'>
          <h4 className='font-semibold mb-2 text-black'>Response:</h4>
          <p className='whitespace-pre-wrap text-black text-sm'>{response}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className='min-h-screen p-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-bold text-center mb-8'>nilAI LLM Chat</h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <ChatComponent
            title='Direct API Key'
            endpoint='/api/chat'
            description='Uses direct API key authentication for simple, straightforward requests.'
          />

          <ChatComponent
            title='Delegation Token'
            endpoint='/api/chat-delegation'
            description='Uses delegation token authentication with server-managed token creation and client-side usage.'
          />
        </div>

        <div className='mt-12 bg-blue-50 p-6 rounded-lg'>
          <h3 className='text-lg font-semibold mb-3 text-black'>
            Authentication Methods Comparison:
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
            <div>
              <h4 className='font-medium text-blue-800 mb-2'>Direct API Key</h4>
              <ul className='space-y-1 text-gray-700'>
                <li>• Simple implementation</li>
                <li>• Direct authentication</li>
                <li>• Good for server-side applications</li>
                <li>• API key exposed to client requests</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium text-blue-800 mb-2'>
                Delegation Token
              </h4>
              <ul className='space-y-1 text-gray-700'>
                <li>• Enhanced security</li>
                <li>• Time-limited tokens</li>
                <li>• Single-use tokens</li>
                <li>• API key remains on server</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
