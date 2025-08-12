import { NextRequest, NextResponse } from 'next/server';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiResponse } from '@/lib/types';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, filter, update } = body;

    if (!collectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'collectionId is required'
      }, { status: 400 });
    }

    if (!filter || !update) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'filter and update objects are required'
      }, { status: 400 });
    }

    const builder = await getSecretVaultClient();

    await builder.updateData({
      collection: collectionId,
      filter,
      update,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { updated: true }
    });
  } catch (error) {
    console.error('Failed to update records:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}