import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';

async function deleteRecord(collectionId: string, recordId: string) {
  try {
    const builder = await initSecretVaultBuilderClient();

    // Tip: use https://collection-explorer.nillion.com/collections/<collection-id> to view the collection and records
    const deleteResult = await builder.deleteData({
      collection: collectionId,
      filter: {
        _id: recordId, // Filter by record ID, or use any other field(s) to match records
      },
    });

    return deleteResult;
  } catch (error) {
    console.error('Error deleting record:', error);
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

deleteRecord(collectionId, recordId)
  .then((result) => {
    console.log(
      'Successfully deleted record across nodes',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to delete record:', JSON.stringify(error));
    process.exit(1);
  });
