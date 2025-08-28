import { NextRequest, NextResponse } from 'next/server';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const service = searchParams.get('service');
    const limit = searchParams.get('limit');
    
    if (!collectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'collectionId query parameter is required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();

    let filter: Record<string, any> = {};
    if (service) {
      filter.service = service;
    }

    const records = await builder.findData({
      collection: collectionId,
      filter,
    });

    let data = records.data || [];
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum)) {
        data = data.slice(0, limitNum);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Failed to read records:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}