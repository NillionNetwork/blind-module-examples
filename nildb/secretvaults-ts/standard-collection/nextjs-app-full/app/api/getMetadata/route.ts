import { NextRequest, NextResponse } from 'next/server';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    
    if (!collectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'collectionId query parameter is required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();
    const metadata = await builder.readCollection(collectionId);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        collectionId,
        totalRecords: metadata.data.count,
        sizeBytes: metadata.data.size,
        lastModified: metadata.data.last_write?.substring(0, 19) + 'Z',
      }
    });
  } catch (error) {
    console.error('Failed to get collection metadata:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}