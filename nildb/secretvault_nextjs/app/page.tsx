// 'use client';

// import { createEncryptionService } from './lib/encryption';
// import { useState } from 'react';

// interface CredentialForm {
//   service: string;
//   username: string;
//   password: string;
// }

// interface Status {
//   loading?: boolean;
//   error?: string;
//   shares?: string[];
//   decrypted?: string; // Added for verification
// }

// export default function Home() {
//   const [form, setForm] = useState<CredentialForm>({
//     service: '',
//     username: '',
//     password: '',
//   });

//   const [status, setStatus] = useState<Status>({});

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus({ loading: true });

//     try {
//       const encryption = await createEncryptionService({ nodes: 3 });

//       // Encrypt
//       const shares = await encryption.encryptPassword(form.password);
//       console.log('Generated shares:', shares);

//       // Decrypt to verify
//       const decrypted = await encryption.decryptPassword(shares);
//       console.log('Verification - decrypted password:', decrypted);

//       setStatus({
//         loading: false,
//         shares,
//         decrypted,
//       });
//     } catch (error) {
//       console.error('Encryption error:', error);
//       setStatus({
//         loading: false,
//         error:
//           error instanceof Error
//             ? error.message
//             : 'Failed to process credential',
//       });
//     }
//   };

//   return (
//     <main className='flex min-h-screen flex-col p-8'>
//       <div className='max-w-4xl mx-auto w-full'>
//         <h1 className='text-3xl font-bold mb-8 flex items-center gap-2'>
//           <span>🔐</span> Secure Credential Manager
//         </h1>

//         <section className='mb-8'>
//           <h2 className='text-2xl font-semibold mb-4'>Add New Credential</h2>
//           <form onSubmit={handleSubmit} className='space-y-4'>
//             <div>
//               <label
//                 htmlFor='service'
//                 className='block text-sm font-medium text-gray-700 mb-1'
//               >
//                 Service Name
//               </label>
//               <input
//                 type='text'
//                 id='service'
//                 name='service'
//                 placeholder='e.g., Netflix'
//                 value={form.service}
//                 onChange={handleInputChange}
//                 className='w-full p-2 border border-gray-300 rounded-md'
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor='username'
//                 className='block text-sm font-medium text-gray-700 mb-1'
//               >
//                 Username
//               </label>
//               <input
//                 type='text'
//                 id='username'
//                 name='username'
//                 placeholder='Enter your username'
//                 value={form.username}
//                 onChange={handleInputChange}
//                 className='w-full p-2 border border-gray-300 rounded-md'
//                 required
//               />
//             </div>

//             <div>
//               <label
//                 htmlFor='password'
//                 className='block text-sm font-medium text-gray-700 mb-1'
//               >
//                 Password
//               </label>
//               <input
//                 type='password'
//                 id='password'
//                 name='password'
//                 value={form.password}
//                 onChange={handleInputChange}
//                 className='w-full p-2 border border-gray-300 rounded-md'
//                 required
//               />
//             </div>

//             <button
//               type='submit'
//               disabled={status.loading}
//               className='px-4 py-2 bg-blue-500 text-white rounded-md
//                        hover:bg-blue-600 transition-colors
//                        disabled:bg-blue-300 disabled:cursor-not-allowed'
//             >
//               {status.loading ? 'Processing...' : 'Save Credential'}
//             </button>
//           </form>

//           {status.error && (
//             <div className='mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md'>
//               {status.error}
//             </div>
//           )}

//           {status.shares && (
//             <div className='mt-4 space-y-4'>
//               {/* Encrypted Shares */}
//               <div className='p-4 bg-gray-50 border border-gray-200 rounded-md'>
//                 <h3 className='font-semibold mb-2'>Encrypted Shares:</h3>
//                 <pre className='whitespace-pre-wrap break-all bg-white p-3 rounded border border-gray-100 text-sm'>
//                   {JSON.stringify(status.shares, null, 2)}
//                 </pre>
//               </div>

//               {/* Decrypted Result */}
//               {status.decrypted && (
//                 <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
//                   <h3 className='font-semibold mb-2'>
//                     Verification - Decrypted Password:
//                   </h3>
//                   <p className='font-mono bg-white p-3 rounded border border-green-100'>
//                     {status.decrypted}
//                   </p>
//                   {status.decrypted === form.password && (
//                     <p className='mt-2 text-sm text-green-600'>
//                       ✓ Encryption verified - decrypted password matches
//                       original
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </section>
//       </div>
//     </main>
//   );
// }

'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('');
  const [retrievedCredential, setRetrievedCredential] = useState<any>(null);

  const hardcodedData = {
    username: 'hardcodedUser',
    password: 'superSecret123',
    service: 'testService',
  };

  const storeCredential = async () => {
    setStatus('Storing credential...');
    try {
      const response = await fetch('/api/nildb/credentials/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hardcodedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to store credential');
      }

      setStatus('Credential stored successfully!');
    } catch (error) {
      setStatus(
        `Error storing credential: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const retrieveCredential = async (credentialId: string) => {
    if (!credentialId) {
      setStatus('Credential ID is required for retrieval.');
      return;
    }

    setStatus('Retrieving credential...');
    try {
      const response = await fetch(
        `/api/nildb/credentials/read?id=${credentialId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve credential');
      }

      setRetrievedCredential(data);
      setStatus('Credential retrieved successfully!');
    } catch (error) {
      setStatus(
        `Error retrieving credential: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  return (
    <main className='p-8'>
      <h1 className='text-2xl font-bold mb-6'>Secure Credential Manager</h1>

      <div className='mb-4'>
        <button
          onClick={storeCredential}
          className='bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600'
        >
          Store Hardcoded Credential
        </button>
      </div>

      <div className='mb-4'>
        <button
          onClick={() => retrieveCredential('hardcoded-credential-id')}
          className='bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600'
        >
          Retrieve Credential
        </button>
      </div>

      {status && (
        <div
          className={`mt-4 p-4 rounded ${
            status.includes('Error')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {status}
        </div>
      )}

      {retrievedCredential && (
        <div className='mt-4 p-4 border rounded'>
          <h3 className='font-semibold mb-2'>Retrieved Credential:</h3>
          <pre className='bg-gray-100 p-2 rounded'>
            {JSON.stringify(retrievedCredential, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
