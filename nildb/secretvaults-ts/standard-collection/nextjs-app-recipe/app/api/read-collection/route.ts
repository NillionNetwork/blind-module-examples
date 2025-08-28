import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import { NextResponse } from 'next/server';

const NILLION_API_KEY = process.env.NILLION_API_KEY;
const NILLION_COLLECTION_ID = process.env.NILLION_COLLECTION_ID;

export async function GET() {
  try {
    // Validate environment variables
    if (!NILLION_API_KEY || !NILLION_COLLECTION_ID) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required environment variables: NILLION_API_KEY and NILLION_COLLECTION_ID',
        },
        { status: 500 }
      );
    }

    // get a Nillion API Key: https://docs.nillion.com/build/network-api-access
    // see Nillion Testnet Config: https://docs.nillion.com/build/network-config#nildb-nodes
    const builder = await SecretVaultBuilderClient.from({
      keypair: Keypair.from(NILLION_API_KEY),
      urls: {
        chain: 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
        auth: 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
        dbs: [
          'https://nildb-stg-n1.nillion.network',
          'https://nildb-stg-n2.nillion.network',
          'https://nildb-stg-n3.nillion.network',
        ],
      },
      blindfold: { operation: 'store' },
    });

    await builder.refreshRootToken();
    const response = await builder.findData({
      collection: NILLION_COLLECTION_ID,
      filter: {},
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      count: response.data.length,
    });
  } catch (error) {
    console.error('Error reading collection:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}