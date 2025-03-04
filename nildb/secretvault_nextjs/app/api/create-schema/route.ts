import { NODE_CONFIG } from '../../lib/config';
import { NextResponse } from 'next/server';

// Remeber to change the SCHEMA_ID to be unique UUID <-- This is what your schema will be
const testPayload = {
  _id: process.env.SCHEMA_ID,
  name: 'My services',
  keys: ['_id'],
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
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
          type: 'string',
        },
        password: {
          type: 'string',
        },
        registered_at: {
          type: 'string',
          format: 'date-time',
          coerce: true,
        },
      },
      required: ['_id', 'service', 'username', 'password', 'registered_at'],
      additionalProperties: false,
    },
  },
};

export async function POST() {
  try {
    // Detailed environment variable validation
    for (const [nodeName, config] of Object.entries(NODE_CONFIG)) {
      if (!config.url || config.url.includes('your_node')) {
        console.error(`Invalid URL for ${nodeName}: ${config.url}`);
        return NextResponse.json(
          { error: `Missing or invalid URL configuration for ${nodeName}` },
          { status: 500 }
        );
      }
      if (!config.jwt || config.jwt.includes('your_jwt')) {
        return NextResponse.json(
          { error: `Missing JWT configuration for ${nodeName}` },
          { status: 500 }
        );
      }
    }

    const results = await Promise.all(
      Object.entries(NODE_CONFIG).map(async ([nodeName, nodeConfig]) => {
        console.log(
          `Attempting to create schema on ${nodeName} at URL: ${nodeConfig.url}`
        );

        const headers = {
          Authorization: `Bearer ${nodeConfig.jwt}`,
          'Content-Type': 'application/json',
        };

        const url = new URL('/api/v1/schemas', nodeConfig.url).toString();
        console.log(`Full URL for ${nodeName}: ${url}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(testPayload), // Swap out the payload here
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create schema on ${nodeName}: ${response.status} ${response.statusText}. Check if you have not duplicated the SCHEMA ID`
          );
        }

        console.log(`Schema created successfully on ${nodeName}.`);
        return process.env.SCHEMA_ID;
      })
    );

    if (results.every(Boolean)) {
      return NextResponse.json({ success: true, results });
    }

    return NextResponse.json(
      { error: 'Failed to create schema on all nodes' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error(`Error creating schema: ${error.message}`);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
