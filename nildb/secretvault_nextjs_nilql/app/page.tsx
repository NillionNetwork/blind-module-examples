'use client';
import PasswordManager from './components/PasswordManager';

export default function Home() {
  return (
    <main className='p-8 min-h-screen w-full flex items-center justify-center'>
      <PasswordManager />
    </main>
  );
}
