import { DatabaseIcon, DownArrowIcon } from './Icons';
import { useState } from 'react';

export const passwordSchema = {
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'password-manager',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          format: 'uuid',
          coerce: true,
        },
        service: {
          type: 'string',
        },
        username: {
          type: 'object',
          properties: {
            '%share': {
              type: 'string',
            },
          },
          required: ['%share'],
        },
        password: {
          type: 'string',
        },
        created_at: {
          type: 'string',
        },
      },
      required: ['_id', 'service', 'username', 'password', 'created_at'],
    },
  },
};

export default function SchemaContent() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  async function createSchemas() {
    try {
      console.log('attempting to call');
      const response = await fetch('/api/create-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('schema creation', response);
    } catch (error) {
      alert('Failed to create schema credentials');
      console.error(error);
    }
  }

  return (
    <>
      <div className='bg-white rounded-lg border shadow-sm'>
        <div
          className='px-6 py-4 border-b cursor-pointer'
          onClick={toggleCollapse}
        >
          <h3 className='text-lg font-semibold flex items-center justify-between gap-2'>
            <span className='flex items-center gap-2'>
              <DatabaseIcon />
              Database Schema
            </span>
            <DownArrowIcon isCollapsed />
          </h3>
        </div>

        {!isCollapsed && (
          <div className='bg-gray-100 p-4 rounded-lg font-mono text-sm'>
            <pre className='bg-gray-100 p-4 rounded-lg text-sm overflow-auto'>
              <code>{JSON.stringify(passwordSchema.schema, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Optional / Demonstration: Create Schema  */}
      {/* <div className='flex justify-center'>
        <button
          onClick={createSchemas}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
        >
          Create / Upload Schema
        </button>
      </div> */}

      <hr className='my-6 border-gray-300' />
    </>
  );
}
