import { NextRequest, NextResponse } from 'next/server';
import { getSecretVaultClient } from '@/lib/secretvault';
import { ApiResponse } from '@/lib/types';

export async function GET() {
  try {
    const builder = await getSecretVaultClient();
    const profile = await builder.readProfile();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        collections: profile.data.collections.length,
        totalQueries: profile.data.queries.length,
      }
    });
  } catch (error) {
    console.error('Failed to get builder profile:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}