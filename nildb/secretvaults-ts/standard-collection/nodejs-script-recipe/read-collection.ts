import { Keypair } from '@nillion/nuc';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import 'dotenv/config';

async function readAllRecords() {
  // Load environment variables
  const NILLION_API_KEY = process.env.NILLION_API_KEY;
  const NILLION_COLLECTION_ID = process.env.NILLION_COLLECTION_ID;

  // Validate environment variables
  if (!NILLION_API_KEY || !NILLION_COLLECTION_ID) {
    throw new Error(
      'Missing required environment variables: NILLION_API_KEY and NILLION_COLLECTION_ID'
    );
  }

  try {
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

    // Read all records from the collection
    const response = await builder.findData({
      collection: NILLION_COLLECTION_ID,
      filter: {}, // Empty filter returns all records
    });

    // Display results
    console.log(
      `Found ${response.data.length} records in collection ${NILLION_COLLECTION_ID}:`
    );
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('Error reading collection:', error);
    throw error;
  }
}

// Run the script
readAllRecords()
  .then(() => {
    console.log('Successfully read all records');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to read records:', error);
    process.exit(1);
  });