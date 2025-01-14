'use client';
import { useState } from 'react';

interface CredentialResponse {
  success?: boolean;
  id?: string;
  error?: string;
}

interface StoredCredential {
  service: string;
  username: string;
  password: string;
}

interface GetCredentialsResponse {
  credentials: StoredCredential[];
  error?: string;
}

export default function Home() {
  const [credentialData, setCredentialData] =
    useState<CredentialResponse | null>(null);
  const [storedCredentials, setStoredCredentials] = useState<
    StoredCredential[] | null
  >(null);

  async function createCredential() {
    try {
      const response = await fetch('/api/create-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser@example.com',
          password: 'TestPass123!',
          service: 'github',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCredentialData(data);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to create credentials');
      console.error(error);
      setCredentialData({ error: 'Failed to create credentials' });
    }
  }

  async function getCredentials() {
    try {
      const response = await fetch('/api/get-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'github',
        }),
      });

      const data: GetCredentialsResponse = await response.json();
      if (data.credentials) {
        setStoredCredentials(data.credentials);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to fetch credentials');
    }
  }

  return (
    <main className='p-8 min-h-screen w-full flex flex-col items-center justify-center gap-8 overflow-y-auto'>
      <h1 className='text-2xl font-bold'>Secure Credential Manager</h1>

      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-lg'>Create Credentials</h2>
        <button
          onClick={createCredential}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Create
        </button>
      </div>

      {credentialData && (
        <div className='mt-4 p-4 border rounded-lg w-full max-w-lg'>
          <h3 className='font-bold mb-2'>Create Response:</h3>
          <pre className='bg-gray-100 p-2 rounded overflow-x-auto'>
            {JSON.stringify(credentialData, null, 2)}
          </pre>
        </div>
      )}

      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-lg'>Get Credentials</h2>
        <button
          onClick={getCredentials}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
        >
          Get
        </button>
      </div>

      {storedCredentials && (
        <div className='mt-4 p-4 border rounded-lg w-full max-w-lg'>
          <h3 className='font-bold mb-2'>Stored Credentials:</h3>
          {storedCredentials.map((cred, index) => (
            <div key={index} className='bg-gray-100 p-3 rounded mb-2'>
              <p>
                <strong>Service:</strong> {cred.service}
              </p>
              <p>
                <strong>Username:</strong> {cred.username}
              </p>
              <p>
                <strong>Password:</strong> {cred.password}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
