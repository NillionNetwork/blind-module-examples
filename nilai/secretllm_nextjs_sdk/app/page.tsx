'use client';

import ChatComponent from './components/ChatComponent';
import AuthMethodsComparison from './components/AuthMethodsComparison';

export default function Home() {
  return (
    <main className='min-h-screen p-8 bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-5xl font-bold text-center mb-16 text-black'>
          nilAI LLM Interface
        </h1>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8'>
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

        <AuthMethodsComparison />
      </div>
    </main>
  );
}
