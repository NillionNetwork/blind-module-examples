import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSecretVaultClient } from '@/lib/secretvault';
import { CollectionSchema, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Collection name is required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();
    const collectionId = randomUUID();

    const schema: CollectionSchema = {
      _id: collectionId,
      type: 'standard' as const,
      name,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            service: { type: 'string' },
            username: { type: 'string' },
            apiKey: {
              type: 'object',
              properties: {
                '%share': {
                  type: 'string',
                },
              },
              required: ['%share'],
            },
          },
          required: ['_id', 'service', 'username', 'apiKey'],
        },
      },
    };

    await builder.createCollection(schema);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { collectionId, name }
    });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}