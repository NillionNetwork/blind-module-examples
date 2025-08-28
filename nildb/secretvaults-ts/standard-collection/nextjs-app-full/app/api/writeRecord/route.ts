import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiKeyRecord, ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, records } = body;

    if (!collectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'collectionId is required'
      }, { status: 400 });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'records array is required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();

    const formattedRecords: ApiKeyRecord[] = records.map((record: any) => ({
      _id: record._id || randomUUID(),
      service: record.service,
      username: record.username,
      apiKey: { '%allot': record.apiKey },
    }));

    await builder.createStandardData({
      body: {
        collection: collectionId,
        data: formattedRecords,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { added: formattedRecords.length }
    });
  } catch (error) {
    console.error('Failed to write records:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}