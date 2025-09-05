import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';

async function findRecordById(collectionId: string, recordId: string) {
  try {
    const builder = await initSecretVaultBuilderClient();

    // Tip: use https://collection-explorer.nillion.com/collections/<collection-id> to view the collection and records
    // Finding a specific record by its _id
    const record = await builder.findData({
      collection: collectionId,
      filter: {
        _id: recordId, // Filter by specific record ID
      },
    });

    return record.data;
  } catch (error) {
    console.error('Error finding record by ID:', error);
    throw error;
  }
}

const collectionId = process.env.NILLION_COLLECTION_ID;
const recordId = process.env.NILLION_RECORD_ID;

if (!collectionId) {
  console.error('Missing required environment variable: NILLION_COLLECTION_ID');
  process.exit(1);
}

if (!recordId) {
  console.error('Missing required environment variable: NILLION_RECORD_ID');
  process.exit(1);
}

findRecordById(collectionId, recordId)
  .then((result) => {
    console.log(
      'Successfully found record by ID',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to find record by ID:', JSON.stringify(error));
    process.exit(1);
  });