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
  registered_at: string;
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
  const [listedSchemas, setListedSchemas] = useState([]);
  const [schemaStatus, setSchemaStatus] = useState(false);
  const [singleCredData, setSingleCredData] = useState();

  async function createSchemas() {
    try {
      const response = await fetch('/api/create-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('schema creation', response);
      setSchemaStatus(true);

    } catch (error) {
      alert('Failed to create schema credentials');
      console.error(error);
      setCredentialData({ error: 'Failed to create credentials' });
    }
  }

  async function getSchemas() {
    try {
      const response = await fetch('/api/get-schemas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('data', data.results);
      setListedSchemas(data.results);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch schemas');
    }
  }

  async function createCredentialSingleNode() {
    try {
      const response = await fetch('/api/create-credential-single-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log('Single CRED create successful:', data);
        setSingleCredData(data.data);
      } else {
        console.error('Single Cred create failed:', data.error);
        setSingleCredData(data.data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to test create');
    }
  }

  async function createCredential() {
    try {
      console.log('Starting credential creation...');
      const response = await fetch('/api/create-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'netflix',
          username: 'JohnDoe13',
          password: 'password',
          registered_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setCredentialData(data);
      } else {
        console.error('Error response:', data);
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert(
        'Failed to create credentials: ' +
          (error instanceof Error ? error.message : String(error))
      );
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
          service: 'netflix',
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
      <h1 className='text-4xl font-bold'>Secure Credential Manager</h1>
      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-lg font-bold'>Create Schemas</h2>
        <button
          onClick={createSchemas}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Create
        </button>
        <p>Status: {schemaStatus ? 'Success' : ''}</p>
      </div>

      <div className='flex flex-col items-center gap-4 justify-center'>
        <h2 className='text-lg font-bold'>List Schemas</h2>
        <p className='italic'>Check console logs</p>
        <button
          onClick={getSchemas}
          className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
        >
          GET
        </button>
      </div>
      {listedSchemas && (
        <div className='border rounded-lg'>
          {listedSchemas.map((schema, index) => (
            <div key={index}>
              <p>
                Node {index + 1} Length: {schema.length}
              </p>
            </div>
          ))}
        </div>
      )}

      <hr className='my-8 border-t border-gray-300 w-1/2 mx-auto' />

      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-lg font-bold'>Create Credentials</h2>
        <button
          onClick={createCredential}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Create (all nodes)
        </button>
        <button
          onClick={createCredentialSingleNode}
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
        >
          Single Node Create
        </button>
        {singleCredData && (
          <div className='mt-4 p-4 border rounded-lg w-full max-w-lg bg-gray-100'>
            <h3 className='font-bold mb-2'>Single Credential Data:</h3>
            <pre className='p-2 rounded overflow-x-auto'>
              {JSON.stringify(singleCredData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {credentialData && (
        <div className='mt-4 p-4 border rounded-lg w-full max-w-lg bg-gray-100'>
          <h3 className='font-bold mb-2'>All Nodes Response:</h3>
          <pre className='p-2 rounded overflow-x-auto'>
            {JSON.stringify(credentialData, null, 2)}
          </pre>
        </div>
      )}

      <div className='flex flex-col items-center gap-4'>
        <h2 className='text-lg font-bold'>Get Credentials</h2>
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
