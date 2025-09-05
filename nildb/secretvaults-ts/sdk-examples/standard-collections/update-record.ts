import 'dotenv/config';
import { initSecretVaultBuilderClient } from '../client-helpers.js';

async function updateRecord(collectionId: string, recordId: string) {
  try {
    const builderClient = await initSecretVaultBuilderClient();

    // Tip: use https://collection-explorer.nillion.com/collections/<collection-id> to view the collection and records
    // You can update both regular fields and encrypted fields (marked with %allot)
    const updateResult = await builderClient.updateData({
      collection: collectionId,
      filter: {
        _id: recordId, // Filter by record ID, or use any other field(s) to match records
      },
      update: {
        $set: {
          'first name': 'Updated Name',
          'phone number': {
            '%allot': '111-222-3333', // field marked with %allot will be encrypted
          },
        },
      },
    });

    return updateResult;
  } catch (error) {
    console.error('Error updating record:', error);
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

updateRecord(collectionId, recordId)
  .then((result) => {
    console.log(
      'Successfully updated record across nodes',
      JSON.stringify(result, null, 2)
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to update record:', JSON.stringify(error));
    process.exit(1);
  });
