import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient, Did } from '@nillion/secretvaults';
import 'dotenv/config';

export async function initSecretVaultBuilderClient() {
  const NILLION_API_KEY = process.env.NILLION_API_KEY;

  if (!NILLION_API_KEY) {
    throw new Error('Missing required environment variable: NILLION_API_KEY');
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

  // Refresh authentication
  await builder.refreshRootToken();

  // 1 time setup for new builders
  // Register builder profile if it doesn't exist
  try {
    const builderProfile = await builder.readProfile();
    console.log('Using existing builder profile:', builderProfile.data._id);
  } catch {
    // Profile doesn't exist, register the builder
    try {
      const BUILDER_NAME = 'Default Builder';
      const builderDid = Keypair.from(NILLION_API_KEY).toDid().toString();
      await builder.register({
        did: Did.parse(builderDid),
        name: BUILDER_NAME,
      });
      console.log(
        `1 time builder profile registration complete for ${builderDid}`
      );
    } catch (error) {
      // Ignore duplicate key errors (concurrent registration)
      if (
        !(error instanceof Error) ||
        !error.message.includes('duplicate key')
      ) {
        throw error;
      }
    }
  }

  return builder;
}
