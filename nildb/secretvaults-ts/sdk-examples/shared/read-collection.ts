import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';

async function readCollectionRecords(collectionId: string) {
  try {
    const builder = await initSecretVaultBuilderClient();

    const records = await builder.findData({
      collection: collectionId,
      filter: {}, // Empty filter returns all records
    });

    return records.data;
  } catch (error) {
    console.error('Error reading collection records:', error);
    throw error;
  }
}

const collectionId = process.env.NILLION_COLLECTION_ID;

if (!collectionId) {
  console.error('Missing required environment variable: NILLION_COLLECTION_ID');
  process.exit(1);
}

readCollectionRecords(collectionId)
  .then((result) => {
    console.log(
      'Successfully read collection records',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to read collection records:', JSON.stringify(error));
    process.exit(1);
  });
