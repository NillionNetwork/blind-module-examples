'use client';

import { useState } from 'react';

export interface ChatComponentProps {
  title: string;
  endpoint: string;
  description: string;
}

export default function ChatComponent({ title, endpoint, description }: ChatComponentProps) {
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