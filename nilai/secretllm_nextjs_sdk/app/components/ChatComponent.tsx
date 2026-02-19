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
    <div className='flex-1 p-8 rounded-2xl bg-white text-center shadow-sm hover:shadow-md transition-shadow duration-300'>
      <h2 className='text-2xl font-bold mb-4 text-black'>{title}</h2>
      <p className='text-gray-600 mb-8 text-sm max-w-md mx-auto'>{description}</p>

      <form onSubmit={handleSubmit} className='space-y-6 max-w-md mx-auto'>
        <div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ask me anything...'
            className='w-full p-4 rounded-xl resize-none h-32 focus:outline-none text-black bg-gray-50 focus:bg-white focus:shadow-sm transition-all duration-200 border border-gray-200'
            disabled={loading}
          />
        </div>

        <button
          type='submit'
          disabled={loading || !message.trim()}
          className='w-full bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md'
        >
          {loading ? 'Thinking...' : 'Send Message'}
        </button>
      </form>

      {response && (
        <div className='mt-8 p-6 rounded-xl bg-gray-50 max-w-md mx-auto text-left'>
          <h4 className='font-bold mb-3 text-black text-center'>Response:</h4>
          <p className='whitespace-pre-wrap text-black text-sm leading-relaxed'>{response}</p>
        </div>
      )}
    </div>
  );
}