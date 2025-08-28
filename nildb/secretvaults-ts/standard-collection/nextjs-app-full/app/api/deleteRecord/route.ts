import { NextRequest, NextResponse } from 'next/server';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiResponse } from '@/lib/types';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const service = searchParams.get('service');
    const recordId = searchParams.get('recordId');

    if (!collectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'collectionId query parameter is required'
      }, { status: 400 });
    }

    let filter: Record<string, any> = {};
    if (service) {
      filter.service = service;
    }
    if (recordId) {
      filter._id = recordId;
    }

    if (Object.keys(filter).length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'filter parameter (service or recordId) is required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();

    await builder.deleteData({
      collection: collectionId,
      filter,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true }
    });
  } catch (error) {
    console.error('Failed to delete records:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}