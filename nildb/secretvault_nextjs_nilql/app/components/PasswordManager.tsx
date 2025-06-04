'use client';

import type React from 'react';
import { useState } from 'react';
import SchemaContent from './SchemaContent';

interface PasswordEntry {
  id: string;
  username: string;
  password: string;
  service: string;
  createdAt: Date;
}

export default function PasswordManager() {
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    service: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.service) return;

    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      username: formData.username,
      password: formData.password,
      service: formData.service,
      createdAt: new Date(),
    };

    setEntries([...entries, newEntry]);
    setFormData({ username: '', password: '', service: '' });
    console.log('...creaing credential');
    try {
      console.log('attempting to call');
      const response = await fetch('/api/create-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          service: formData.service,
        }),
      });
      console.log('schema creation', response);
    } catch (error) {
      alert('Failed to create schema credentials');
      console.error(error);
    } finally {
      setShowForm(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const createCredential = async () => {
    console.log('...creaing credential');
    try {
      console.log('attempting to call');
      const response = await fetch('/api/create-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          service: formData.service,
        }),
      });
      console.log('schema creation', response);
    } catch (error) {
      alert('Failed to create schema credentials');
      console.error(error);
    } finally {
      setShowForm(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-md'>
      <div className='mx-auto max-w-xl space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Secure Password Manager Demo
          </h1>
          <p className='text-gray-600'>Securely store data via nilQL</p>
        </div>
        <p>
          1. Register your orgnaization here:
          <a
            href='https://sv-sda-registration.replit.app'
            target='_blank'
            className='underline'
            rel='noopener noreferrer'
          >
            https://sv-sda-registration.replit.app
          </a>
        </p>
        <p>
          2. Upload the following schema to{' '}
          <a
            href='https://schema-tools.vercel.app'
            target='_blank'
            rel='noopener noreferrer'
            className='underline'
          >
            https://schema-tools.vercel.app
          </a>{' '}
          with your new credentials + follow the steps
        </p>
        <SchemaContent />

        <p>3. Check that the Schema was created in the "Collections tab"</p>
        <p>4. Click into "password-manager" and it should have empty records</p>

        <hr className='my-6 border-gray-300' />

        <p>
          5. Copy Schema ID + run `node generate.js` to get add the JWT to the
          .env
        </p>
        <p className='italic'>Here is the main action with nilql library.</p>

        {/* Create Form */}

        <div className='bg-white rounded-lg border shadow-sm'>
          <div className='px-6 py-4 border-b'>
            <h3 className='text-lg font-semibold'>Add New Password Entry</h3>
            <p className='text-sm text-gray-600 mt-1'>
              Enter the details for your new password entry
            </p>
          </div>
          <div className='px-6 py-4'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <label
                    htmlFor='service'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Service
                  </label>
                  <input
                    id='service'
                    type='text'
                    placeholder='e.g., Gmail, GitHub, Netflix'
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div className='space-y-2'>
                  <label
                    htmlFor='username'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Username
                  </label>
                  <input
                    id='username'
                    type='text'
                    placeholder='Enter username or email'
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
                <div className='space-y-2'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    placeholder='Enter password'
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  onClick={() =>
                    setFormData({
                      username: '',
                      password: '',
                      service: '',
                    })
                  }
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>

        <p>
          6. You should have an updated record that is encrypted for your
          passwords in your Schema tools app.
        </p>
      </div>
    </div>
  );
}
